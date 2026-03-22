-- ============================================================================
-- AutoKlient Database Schema - Migration 003
-- Operational Tables: subscriptions, jobs, sms_log, email_log,
--                     google_token_refresh_log
-- ============================================================================

-- ==========================================================================
-- TABLE: subscriptions
-- ==========================================================================
-- Tracks the billing/subscription state per business.
-- Integrated with Stripe (or LemonSqueezy) via webhook.
--
-- DECISION: Separate table from businesses because subscription logic is
-- complex (plan changes, grace periods, past_due) and we want to keep
-- businesses table clean.
-- ==========================================================================
CREATE TABLE public.subscriptions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         uuid NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,

    -- Plan details
    plan                subscription_plan NOT NULL DEFAULT 'trial',
    status              subscription_status NOT NULL DEFAULT 'active',

    -- Limits for this plan (denormalized for fast checking)
    sms_limit_monthly   integer NOT NULL DEFAULT 50,   -- trial default
    customers_limit     integer NOT NULL DEFAULT 100,   -- trial default

    -- Usage counters (reset monthly by a cron job)
    sms_used_this_month integer NOT NULL DEFAULT 0,
    current_period_start timestamptz NOT NULL DEFAULT now(),
    current_period_end   timestamptz NOT NULL DEFAULT (now() + interval '30 days'),

    -- Payment provider integration
    stripe_customer_id      text,
    stripe_subscription_id  text,
    stripe_price_id         text,

    -- Trial tracking
    trial_started_at    timestamptz DEFAULT now(),
    trial_ends_at       timestamptz DEFAULT (now() + interval '14 days'),

    -- Cancellation
    cancelled_at        timestamptz,
    cancel_reason       text,

    -- Metadata
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- One active subscription per business
CREATE UNIQUE INDEX uq_subscriptions_business_active
    ON public.subscriptions (business_id)
    WHERE status IN ('active', 'past_due');

COMMENT ON TABLE public.subscriptions IS
    'Subscription/billing state per business. Managed via Stripe webhooks.';
COMMENT ON COLUMN public.subscriptions.sms_used_this_month IS
    'Counter reset monthly by scheduled job. Checked before sending SMS.';


-- ==========================================================================
-- TABLE: jobs
-- ==========================================================================
-- Async job queue. n8n polls this table for pending work.
--
-- DECISION (question E): jobs is the QUEUE, sms_log is the LOG.
--   - A job represents intent: "send this SMS at this time"
--   - sms_log represents outcome: "SMS was sent, here's the provider response"
--   - A completed 'send_sms' job creates an sms_log entry
--   - This separation allows:
--     * Retrying failed jobs without duplicating log entries
--     * Scheduling future jobs (send_at)
--     * Cancelling pending jobs
--     * Clean analytics on actual deliveries (sms_log)
-- ==========================================================================
CREATE TABLE public.jobs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     uuid NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,

    -- Job definition
    type            job_type NOT NULL,
    status          job_status NOT NULL DEFAULT 'pending',
    priority        smallint NOT NULL DEFAULT 0 CHECK (priority BETWEEN -10 AND 10),

    -- Scheduling
    scheduled_at    timestamptz NOT NULL DEFAULT now(),  -- when to execute
    started_at      timestamptz,                          -- when processing began
    completed_at    timestamptz,                          -- when finished

    -- Payload (type-specific data as JSONB)
    payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
    -- For send_sms: { customer_id, template_id, phone, message_text }
    -- For send_email: { customer_id, template_id, to_email, subject, body }
    -- For fetch_reviews: { google_place_id, since_date }
    -- For generate_report: { report_type, date_range }

    -- Result / error tracking
    result          jsonb,           -- provider response, report URL, etc.
    error_message   text,
    retry_count     smallint NOT NULL DEFAULT 0,
    max_retries     smallint NOT NULL DEFAULT 3,

    -- References (optional, for easy joins)
    customer_id     uuid REFERENCES public.customers(id) ON DELETE SET NULL,

    -- Metadata
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.jobs IS
    'Async job queue polled by n8n. Jobs = intent/scheduling; logs = outcomes.';
COMMENT ON COLUMN public.jobs.payload IS
    'Type-specific JSONB payload. Structure depends on job type.';


-- ==========================================================================
-- TABLE: sms_log
-- ==========================================================================
-- Immutable log of all SMS messages sent. Created when a send_sms job
-- completes (success or failure). Used for analytics, billing, and audit.
--
-- DECISION: This is append-only (no UPDATE/DELETE by users).
-- ==========================================================================
CREATE TABLE public.sms_log (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         uuid NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,
    customer_id         uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    job_id              uuid REFERENCES public.jobs(id) ON DELETE SET NULL,

    -- Message content
    phone_to            text NOT NULL,
    message_text        text NOT NULL,
    template_id         uuid,  -- FK added after sms_templates table exists

    -- Delivery tracking
    status              sms_delivery_status NOT NULL DEFAULT 'queued',
    provider            text NOT NULL DEFAULT 'smsapi',  -- smsapi.pl, twilio, etc.
    provider_message_id text,  -- external ID for status callbacks
    segments_count      smallint NOT NULL DEFAULT 1,  -- SMS segments (for billing)
    cost_pln            numeric(8,4),  -- cost in PLN

    -- Status updates
    sent_at             timestamptz,
    delivered_at        timestamptz,
    failed_at           timestamptz,
    failure_reason      text,

    -- Metadata
    created_at          timestamptz NOT NULL DEFAULT now()
    -- No updated_at: status updates are done via specific columns
    -- No deleted_at: SMS logs are immutable for audit
);

COMMENT ON TABLE public.sms_log IS
    'Immutable log of SMS messages. Append-only for audit compliance.';
COMMENT ON COLUMN public.sms_log.segments_count IS
    'Number of SMS segments. Polish characters increase segment count.';


-- ==========================================================================
-- TABLE: email_log
-- ==========================================================================
-- Log of all emails sent (review requests, reports, notifications).
-- Same pattern as sms_log: immutable, append-only.
-- ==========================================================================
CREATE TABLE public.email_log (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         uuid NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,
    customer_id         uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    job_id              uuid REFERENCES public.jobs(id) ON DELETE SET NULL,

    -- Message content
    email_to            text NOT NULL,
    subject             text NOT NULL,
    body_html           text,
    template_id         uuid,

    -- Delivery tracking
    status              email_delivery_status NOT NULL DEFAULT 'queued',
    provider            text NOT NULL DEFAULT 'resend',  -- resend, sendgrid, etc.
    provider_message_id text,

    -- Status updates
    sent_at             timestamptz,
    delivered_at        timestamptz,
    opened_at           timestamptz,
    bounced_at          timestamptz,
    failed_at           timestamptz,
    failure_reason      text,

    -- Metadata
    created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_log IS
    'Immutable log of emails sent. Append-only for audit compliance.';


-- ==========================================================================
-- TABLE: google_token_refresh_log
-- ==========================================================================
-- Tracks OAuth token refresh attempts for debugging and monitoring.
-- Helps diagnose "why did Google integration stop working?" questions.
-- ==========================================================================
CREATE TABLE public.google_token_refresh_log (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

    success         boolean NOT NULL,
    error_message   text,
    token_expires_at timestamptz,  -- new expiry if refresh succeeded
    ip_address      inet,

    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.google_token_refresh_log IS
    'Diagnostic log for Google OAuth token refreshes. Short retention (30 days).';
