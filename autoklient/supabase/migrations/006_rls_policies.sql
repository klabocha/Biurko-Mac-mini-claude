-- ============================================================================
-- AutoKlient Database Schema - Migration 006
-- Row Level Security Policies
-- ============================================================================
-- DESIGN PRINCIPLES:
--   1. All tables have RLS enabled.
--   2. Authenticated users see only their own businesses' data.
--   3. Service-role (n8n, webhooks) bypasses RLS automatically (Supabase default).
--   4. Anon role has NO access to any table.
--   5. Helper function get_user_business_ids() used in all policies.
--   6. Soft-deleted rows are hidden from normal SELECT policies.
--   7. Immutable tables (sms_log, email_log, audit_log) block UPDATE/DELETE.
-- ============================================================================

-- ==========================================================================
-- BUSINESSES
-- ==========================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Users can read only their own businesses (excluding soft-deleted)
CREATE POLICY businesses_select ON public.businesses
    FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    );

-- Users can create businesses (they become the owner)
CREATE POLICY businesses_insert ON public.businesses
    FOR INSERT
    TO authenticated
    WITH CHECK (
        owner_id = auth.uid()
    );

-- Users can update only their own businesses (not soft-deleted ones)
CREATE POLICY businesses_update ON public.businesses
    FOR UPDATE
    TO authenticated
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    )
    WITH CHECK (
        owner_id = auth.uid()
    );

-- DELETE is intercepted by soft_delete trigger, but the policy still gates access
CREATE POLICY businesses_delete ON public.businesses
    FOR DELETE
    TO authenticated
    USING (
        owner_id = auth.uid()
        AND deleted_at IS NULL
    );


-- ==========================================================================
-- CUSTOMERS
-- ==========================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_select ON public.customers
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND deleted_at IS NULL
    );

CREATE POLICY customers_insert ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

CREATE POLICY customers_update ON public.customers
    FOR UPDATE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND deleted_at IS NULL
    )
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

CREATE POLICY customers_delete ON public.customers
    FOR DELETE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND deleted_at IS NULL
    );


-- ==========================================================================
-- REVIEWS
-- ==========================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_select ON public.reviews
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND deleted_at IS NULL
    );

-- Reviews are normally inserted by n8n (service role), but allow authenticated too
CREATE POLICY reviews_insert ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

CREATE POLICY reviews_update ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND deleted_at IS NULL
    )
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

CREATE POLICY reviews_delete ON public.reviews
    FOR DELETE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND deleted_at IS NULL
    );


-- ==========================================================================
-- SUBSCRIPTIONS
-- ==========================================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their subscription (no soft-delete on this table)
CREATE POLICY subscriptions_select ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- Subscriptions are created by the system (service role) or during onboarding
CREATE POLICY subscriptions_insert ON public.subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- Users cannot directly modify subscriptions (Stripe webhooks do this via service role)
-- But allow limited updates (e.g., cancel_reason)
CREATE POLICY subscriptions_update ON public.subscriptions
    FOR UPDATE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    )
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- Users cannot delete subscriptions
-- (No DELETE policy = denied by default with RLS enabled)


-- ==========================================================================
-- JOBS
-- ==========================================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY jobs_select ON public.jobs
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- Users can create jobs (e.g., "send SMS to this customer")
CREATE POLICY jobs_insert ON public.jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- Users can cancel their own pending jobs
CREATE POLICY jobs_update ON public.jobs
    FOR UPDATE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND status = 'pending'  -- can only modify pending jobs
    )
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- No DELETE policy: jobs are never deleted, they reach terminal states


-- ==========================================================================
-- SMS_LOG (immutable - read only for authenticated users)
-- ==========================================================================
ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY sms_log_select ON public.sms_log
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- INSERT: only service role (n8n) creates sms_log entries
-- No INSERT/UPDATE/DELETE policies for authenticated = denied


-- ==========================================================================
-- EMAIL_LOG (immutable - read only for authenticated users)
-- ==========================================================================
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_log_select ON public.email_log
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );


-- ==========================================================================
-- SMS_TEMPLATES
-- ==========================================================================
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

-- Users can read system defaults (business_id IS NULL) + their own templates
CREATE POLICY sms_templates_select ON public.sms_templates
    FOR SELECT
    TO authenticated
    USING (
        (business_id IS NULL AND deleted_at IS NULL)  -- system defaults
        OR (business_id IN (SELECT public.get_user_business_ids()) AND deleted_at IS NULL)
    );

-- Users can create custom templates for their businesses
CREATE POLICY sms_templates_insert ON public.sms_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
        AND business_id IS NOT NULL  -- cannot create system defaults
    );

CREATE POLICY sms_templates_update ON public.sms_templates
    FOR UPDATE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND business_id IS NOT NULL  -- cannot modify system defaults
        AND deleted_at IS NULL
    )
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

CREATE POLICY sms_templates_delete ON public.sms_templates
    FOR DELETE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND business_id IS NOT NULL
        AND deleted_at IS NULL
    );


-- ==========================================================================
-- EMAIL_TEMPLATES (same pattern as sms_templates)
-- ==========================================================================
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_templates_select ON public.email_templates
    FOR SELECT
    TO authenticated
    USING (
        (business_id IS NULL AND deleted_at IS NULL)
        OR (business_id IN (SELECT public.get_user_business_ids()) AND deleted_at IS NULL)
    );

CREATE POLICY email_templates_insert ON public.email_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
        AND business_id IS NOT NULL
    );

CREATE POLICY email_templates_update ON public.email_templates
    FOR UPDATE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND business_id IS NOT NULL
        AND deleted_at IS NULL
    )
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );

CREATE POLICY email_templates_delete ON public.email_templates
    FOR DELETE
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
        AND business_id IS NOT NULL
        AND deleted_at IS NULL
    );


-- ==========================================================================
-- GOOGLE_TOKEN_REFRESH_LOG
-- ==========================================================================
ALTER TABLE public.google_token_refresh_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY google_token_log_select ON public.google_token_refresh_log
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- INSERT only by service role (n8n handles token refresh)


-- ==========================================================================
-- AUDIT_LOG (read-only for business owners)
-- ==========================================================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select ON public.audit_log
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- No INSERT/UPDATE/DELETE for authenticated. Triggers use SECURITY DEFINER.


-- ==========================================================================
-- ANALYTICS_EVENTS (read-only for business owners)
-- ==========================================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_events_select ON public.analytics_events
    FOR SELECT
    TO authenticated
    USING (
        business_id IN (SELECT public.get_user_business_ids())
    );

-- INSERT allowed (app can track events client-side)
CREATE POLICY analytics_events_insert ON public.analytics_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (SELECT public.get_user_business_ids())
    );
