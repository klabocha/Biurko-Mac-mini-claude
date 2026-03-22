-- ============================================================================
-- AutoKlient Database Schema - Migration 001
-- Extensions and Helper Functions
-- ============================================================================
-- This migration sets up PostgreSQL extensions and reusable helper functions
-- that other migrations depend on.
-- ============================================================================

-- ==========================================================================
-- EXTENSIONS
-- ==========================================================================

-- pgcrypto: used for gen_random_uuid() and encryption utilities
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- pgsodium: Supabase's encryption layer (available by default on Supabase)
-- Used for encrypting OAuth tokens at rest via Vault
-- CREATE EXTENSION IF NOT EXISTS pgsodium;  -- already enabled on Supabase

-- pg_trgm: trigram matching for fuzzy text search (customer name search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================================================
-- CUSTOM TYPES
-- ==========================================================================

-- Subscription plan tiers
CREATE TYPE subscription_plan AS ENUM ('trial', 'starter', 'professional', 'enterprise');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired');

-- Job status for the async job queue
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- Job type
CREATE TYPE job_type AS ENUM ('send_sms', 'send_email', 'fetch_reviews', 'generate_report');

-- SMS delivery status (mapped from provider callbacks)
CREATE TYPE sms_delivery_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'expired');

-- Email delivery status
CREATE TYPE email_delivery_status AS ENUM ('queued', 'sent', 'delivered', 'opened', 'bounced', 'failed');

-- Review source
CREATE TYPE review_source AS ENUM ('google', 'facebook', 'manual');

-- Audit action type
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE');

-- Business industry (for default template selection)
CREATE TYPE business_industry AS ENUM (
    'osk',                  -- Osrodek Szkolenia Kierowcow
    'nieruchomosci',        -- Real estate
    'instalacje',           -- Installations (HVAC, plumbing, electrical)
    'auto_serwis',          -- Auto service
    'gastronomia',          -- Gastronomy / restaurants
    'zdrowie_uroda',        -- Health & beauty
    'edukacja',             -- Education / tutoring
    'inne'                  -- Other
);

-- ==========================================================================
-- HELPER FUNCTIONS
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- get_user_business_ids(): Returns all business IDs the current user owns.
-- Used in RLS policies. Cached per-statement via STABLE marker.
--
-- DECISION: We use a helper function instead of inline subqueries in RLS
-- policies because:
--   1. Single point of change if the ownership model evolves
--   2. PostgreSQL can cache STABLE function results within a statement
--   3. Cleaner, DRY policy definitions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_business_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.businesses
    WHERE owner_id = auth.uid()
    AND deleted_at IS NULL;
$$;

-- ---------------------------------------------------------------------------
-- is_service_role(): Returns true if the current request uses the service_role key.
-- n8n and other backend services use service_role to bypass RLS.
-- This checks the JWT role claim.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT coalesce(
        current_setting('request.jwt.claim.role', true),
        ''
    ) = 'service_role';
$$;

-- ---------------------------------------------------------------------------
-- update_updated_at(): Trigger function to auto-set updated_at on UPDATE.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- soft_delete(): Trigger function that converts DELETE into soft-delete.
-- Instead of removing the row, it sets deleted_at = now().
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soft_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Instead of deleting, update deleted_at
    EXECUTE format(
        'UPDATE %I.%I SET deleted_at = now() WHERE %I = $1',
        TG_TABLE_SCHEMA, TG_TABLE_NAME,
        'id'
    ) USING OLD.id;
    RETURN NULL; -- suppress the actual DELETE
END;
$$;

-- ---------------------------------------------------------------------------
-- audit_trigger_func(): Generic audit logging trigger.
-- Captures old/new row as JSONB into the audit_log table.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_action audit_action;
    v_old_data jsonb;
    v_new_data jsonb;
    v_business_id uuid;
    v_user_id uuid;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_new_data := to_jsonb(NEW);
        v_old_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if this is a soft-delete (deleted_at changed from NULL to non-NULL)
        IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
            v_action := 'SOFT_DELETE';
        ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
            v_action := 'RESTORE';
        ELSE
            v_action := 'UPDATE';
        END IF;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
    END IF;

    -- Extract business_id if present in the row
    IF v_new_data IS NOT NULL AND v_new_data ? 'business_id' THEN
        v_business_id := (v_new_data->>'business_id')::uuid;
    ELSIF v_old_data IS NOT NULL AND v_old_data ? 'business_id' THEN
        v_business_id := (v_old_data->>'business_id')::uuid;
    ELSIF TG_TABLE_NAME = 'businesses' THEN
        -- For the businesses table itself, the id IS the business_id
        v_business_id := coalesce(
            (v_new_data->>'id')::uuid,
            (v_old_data->>'id')::uuid
        );
    END IF;

    -- Get current user (may be NULL for service-role operations)
    v_user_id := auth.uid();

    INSERT INTO public.audit_log (
        table_name, record_id, action, old_data, new_data,
        business_id, user_id, ip_address
    ) VALUES (
        TG_TABLE_NAME,
        coalesce(
            (v_new_data->>'id')::uuid,
            (v_old_data->>'id')::uuid
        ),
        v_action,
        v_old_data,
        v_new_data,
        v_business_id,
        v_user_id,
        inet(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', '0.0.0.0'))
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
EXCEPTION
    -- Never let audit logging break the actual operation
    WHEN OTHERS THEN
        RAISE WARNING 'audit_trigger_func failed: %', SQLERRM;
        IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
        RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.get_user_business_ids() IS
    'Returns business IDs owned by the currently authenticated user. Used in RLS policies.';
COMMENT ON FUNCTION public.is_service_role() IS
    'Returns true if the current session is using the service_role JWT (backend/n8n access).';
COMMENT ON FUNCTION public.update_updated_at() IS
    'Trigger function: auto-updates updated_at column on row modification.';
COMMENT ON FUNCTION public.soft_delete() IS
    'Trigger function: intercepts DELETE and converts to soft-delete by setting deleted_at.';
COMMENT ON FUNCTION public.audit_trigger_func() IS
    'Trigger function: logs all changes to the audit_log table for compliance.';
