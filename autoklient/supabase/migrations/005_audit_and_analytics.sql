-- ============================================================================
-- AutoKlient Database Schema - Migration 005
-- Audit Log and Analytics Events
-- ============================================================================

-- ==========================================================================
-- TABLE: audit_log
-- ==========================================================================
-- DECISION (question D): Trigger-based automatic auditing.
-- Reasons:
--   1. Cannot be bypassed by application bugs
--   2. Captures service-role (n8n) changes too
--   3. Uniform format for all tables
--   4. RODO compliance: we can prove what data existed and when it was deleted
--
-- Retention: 2 years for RODO compliance, then auto-purged by scheduled job.
-- Tables audited: businesses, customers, subscriptions, sms_templates
-- NOT audited: sms_log, email_log (already immutable), jobs (too noisy),
--              analytics_events (too noisy), google_token_refresh_log (diagnostic)
-- ==========================================================================
CREATE TABLE public.audit_log (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name      text NOT NULL,
    record_id       uuid,
    action          audit_action NOT NULL,

    -- Snapshot of old and new row data
    old_data        jsonb,
    new_data        jsonb,

    -- Context
    business_id     uuid,  -- denormalized for RLS and partitioning
    user_id         uuid,  -- who performed the action (NULL = service role)
    ip_address      inet,

    -- Metadata
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Partition-friendly: no FK constraints on audit_log (intentional).
-- This table is append-only and may be partitioned by created_at in the future.

COMMENT ON TABLE public.audit_log IS
    'Immutable audit trail. Trigger-based, 2-year retention. RODO compliance.';
COMMENT ON COLUMN public.audit_log.old_data IS
    'Full row snapshot before change. NULL for INSERT.';
COMMENT ON COLUMN public.audit_log.new_data IS
    'Full row snapshot after change. NULL for DELETE.';


-- ==========================================================================
-- TABLE: analytics_events
-- ==========================================================================
-- Lightweight event tracking for business intelligence.
-- Events: review_link_clicked, review_submitted, sms_sent, sms_delivered, etc.
-- This is NOT a replacement for a proper analytics service; it's for
-- in-app dashboards and basic metrics.
-- ==========================================================================
CREATE TABLE public.analytics_events (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

    -- Event
    event_type      text NOT NULL CHECK (char_length(event_type) BETWEEN 1 AND 100),
    -- Common event_types:
    --   'review_link_clicked', 'review_submitted',
    --   'sms_sent', 'sms_delivered', 'sms_failed',
    --   'customer_created', 'subscription_upgraded'

    -- Optional references
    customer_id     uuid,
    review_id       uuid,

    -- Arbitrary event data
    metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,

    -- Metadata
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.analytics_events IS
    'Lightweight event tracking for in-app dashboards. High-volume, append-only.';
COMMENT ON COLUMN public.analytics_events.event_type IS
    'Free-form event type string. Convention: snake_case noun_verb.';
