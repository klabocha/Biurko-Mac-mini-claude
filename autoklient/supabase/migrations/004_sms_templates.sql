-- ============================================================================
-- AutoKlient Database Schema - Migration 004
-- SMS Templates System
-- ============================================================================
-- DECISION: Templates are stored in the database (not config files) because:
--   1. Users can customize templates per business
--   2. System defaults are seeded as rows with business_id = NULL
--   3. Per-business templates override system defaults for that industry
--   4. Template variables use {mustache} syntax, validated at application layer
--   5. DB storage enables A/B testing, versioning, analytics
-- ============================================================================

-- ==========================================================================
-- TABLE: sms_templates
-- ==========================================================================
CREATE TABLE public.sms_templates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- NULL business_id = system-wide default template
    -- Non-NULL business_id = business-specific custom template
    business_id     uuid REFERENCES public.businesses(id) ON DELETE CASCADE,

    -- Template metadata
    name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    description     text,
    industry        business_industry,  -- which industry this default is for (NULL = universal)

    -- Template content
    -- Variables: {business_name}, {customer_name}, {review_link}, {followup_days}
    -- Polish SMS: 160 chars = 1 segment (GSM-7), 70 chars = 1 segment (UCS-2/Polish)
    message_template text NOT NULL CHECK (char_length(message_template) BETWEEN 1 AND 640),

    -- Template type
    template_type   text NOT NULL DEFAULT 'review_request'
        CHECK (template_type IN (
            'review_request',       -- initial "please leave a review"
            'review_followup',      -- reminder after X days
            'review_thank_you',     -- thank you after review received
            'welcome',              -- welcome new customer
            'custom'                -- user-defined
        )),

    -- Is this a system default? (business_id IS NULL AND is_default = true)
    is_default      boolean NOT NULL DEFAULT false,

    -- Is this template active?
    is_active       boolean NOT NULL DEFAULT true,

    -- Metadata
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

-- System defaults: one default per type per industry
CREATE UNIQUE INDEX uq_sms_templates_default
    ON public.sms_templates (template_type, industry)
    WHERE business_id IS NULL AND is_default = true AND deleted_at IS NULL;

-- Business templates: one active default per type per business
CREATE UNIQUE INDEX uq_sms_templates_business_default
    ON public.sms_templates (business_id, template_type)
    WHERE is_default = true AND deleted_at IS NULL AND business_id IS NOT NULL;

-- Add FK from sms_log.template_id now that the table exists
ALTER TABLE public.sms_log
    ADD CONSTRAINT fk_sms_log_template
    FOREIGN KEY (template_id) REFERENCES public.sms_templates(id) ON DELETE SET NULL;

-- Add FK from email_log.template_id
ALTER TABLE public.email_log
    ADD CONSTRAINT fk_email_log_template
    FOREIGN KEY (template_id) REFERENCES public.sms_templates(id) ON DELETE SET NULL;

COMMENT ON TABLE public.sms_templates IS
    'SMS message templates. business_id=NULL are system defaults; non-NULL are per-business customizations.';
COMMENT ON COLUMN public.sms_templates.message_template IS
    'Template text with {variable} placeholders. Max 640 chars (4 SMS segments).';
COMMENT ON COLUMN public.sms_templates.industry IS
    'Industry targeting for system defaults. NULL = universal template.';


-- ==========================================================================
-- TABLE: email_templates
-- ==========================================================================
-- Separate from SMS templates because email has subject + HTML body.
-- Same pattern: NULL business_id = system default.
-- ==========================================================================
CREATE TABLE public.email_templates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     uuid REFERENCES public.businesses(id) ON DELETE CASCADE,

    name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    description     text,
    industry        business_industry,

    -- Email content
    subject_template text NOT NULL CHECK (char_length(subject_template) BETWEEN 1 AND 200),
    body_template    text NOT NULL,  -- HTML with {variable} placeholders

    template_type   text NOT NULL DEFAULT 'review_request'
        CHECK (template_type IN (
            'review_request',
            'review_followup',
            'review_thank_you',
            'monthly_report',
            'welcome',
            'custom'
        )),

    is_default      boolean NOT NULL DEFAULT false,
    is_active       boolean NOT NULL DEFAULT true,

    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

CREATE UNIQUE INDEX uq_email_templates_default
    ON public.email_templates (template_type, industry)
    WHERE business_id IS NULL AND is_default = true AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_email_templates_business_default
    ON public.email_templates (business_id, template_type)
    WHERE is_default = true AND deleted_at IS NULL AND business_id IS NOT NULL;

COMMENT ON TABLE public.email_templates IS
    'Email templates. Same pattern as sms_templates: NULL business_id = system defaults.';
