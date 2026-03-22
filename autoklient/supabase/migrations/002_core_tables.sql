-- ============================================================================
-- AutoKlient Database Schema - Migration 002
-- Core Tables: businesses, customers, reviews
-- ============================================================================

-- ==========================================================================
-- TABLE: businesses
-- ==========================================================================
-- Central tenant table. Every other table references this via business_id.
-- The owner_id links to auth.users for RLS enforcement.
-- ==========================================================================
CREATE TABLE public.businesses (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

    -- Business profile
    name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
    industry        business_industry NOT NULL DEFAULT 'inne',
    phone           text CHECK (phone ~ '^\+?[0-9]{7,15}$'),
    email           text CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    website         text,
    address         text,
    city            text,
    postal_code     text CHECK (postal_code ~ '^\d{2}-\d{3}$' OR postal_code IS NULL),
    nip             text CHECK (nip ~ '^\d{10}$' OR nip IS NULL),

    -- Google Business integration
    google_place_id         text,
    google_business_name    text,
    google_review_link      text,  -- Direct link for customers to leave a review

    -- OAuth tokens (encrypted at application level - see SCHEMA_DECISIONS.md section A)
    -- Stored as text; the application encrypts/decrypts with AES-256-GCM
    google_access_token_encrypted   text,
    google_refresh_token_encrypted  text,
    google_token_expires_at         timestamptz,
    google_token_scope              text,

    -- Settings (JSONB for flexibility without schema changes)
    settings        jsonb NOT NULL DEFAULT '{}'::jsonb,
    -- Expected keys in settings:
    --   sms_sender_name: text (max 11 chars, alphanumeric)
    --   review_request_delay_hours: integer (default 24)
    --   followup_enabled: boolean (default true)
    --   followup_delay_days: integer (default 7)
    --   auto_send_enabled: boolean (default false)
    --   timezone: text (default 'Europe/Warsaw')
    --   language: text (default 'pl')

    -- Metadata
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz  -- soft delete (RODO compliance)
);

-- Partial unique: one active business per NIP (allow multiple soft-deleted)
CREATE UNIQUE INDEX uq_businesses_nip_active
    ON public.businesses (nip) WHERE nip IS NOT NULL AND deleted_at IS NULL;

COMMENT ON TABLE public.businesses IS
    'Multi-tenant root table. Each row = one business client of AutoKlient.';
COMMENT ON COLUMN public.businesses.google_access_token_encrypted IS
    'AES-256-GCM encrypted OAuth access token. Encrypted/decrypted in application layer.';
COMMENT ON COLUMN public.businesses.settings IS
    'Flexible JSONB settings bag. Keys documented in column comment.';


-- ==========================================================================
-- TABLE: customers
-- ==========================================================================
-- Customers of the businesses (end-users who receive SMS review requests).
-- RODO: contains PII, subject to deletion requests.
-- ==========================================================================
CREATE TABLE public.customers (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     uuid NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,

    -- Customer info
    name            text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
    phone           text NOT NULL CHECK (phone ~ '^\+?[0-9]{7,15}$'),
    email           text CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),

    -- Tags for segmentation (e.g., ['kurs_B', 'vip'])
    tags            text[] NOT NULL DEFAULT '{}',

    -- Review tracking
    review_requested_at     timestamptz,  -- when we sent the review request SMS
    review_received_at      timestamptz,  -- when we detected they left a review
    review_rating           smallint CHECK (review_rating BETWEEN 1 AND 5),

    -- Consent tracking (RODO)
    sms_consent             boolean NOT NULL DEFAULT false,
    sms_consent_at          timestamptz,
    marketing_consent       boolean NOT NULL DEFAULT false,
    marketing_consent_at    timestamptz,

    -- Notes (free text, e.g., "student, exam passed 2024-03")
    notes           text,

    -- Source of this customer record
    source          text DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'api', 'form')),

    -- Metadata
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz  -- soft delete (RODO)
);

-- Partial unique: same phone can't appear twice for the same business (active only)
CREATE UNIQUE INDEX uq_customers_business_phone_active
    ON public.customers (business_id, phone) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.customers IS
    'End-customers of businesses. Contains PII - subject to RODO deletion.';
COMMENT ON COLUMN public.customers.sms_consent IS
    'Whether the customer consented to receiving SMS. Required before sending.';


-- ==========================================================================
-- TABLE: reviews
-- ==========================================================================
-- Reviews fetched from Google (or other sources) for analytics and tracking.
-- This is a read-mostly table, populated by n8n fetch_reviews jobs.
-- ==========================================================================
CREATE TABLE public.reviews (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     uuid NOT NULL REFERENCES public.businesses(id) ON DELETE RESTRICT,
    customer_id     uuid REFERENCES public.customers(id) ON DELETE SET NULL,

    -- Review data
    source          review_source NOT NULL DEFAULT 'google',
    source_review_id text,  -- external ID from Google/Facebook for dedup
    reviewer_name   text,
    rating          smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text     text,
    review_date     timestamptz NOT NULL,
    reply_text      text,
    reply_date      timestamptz,

    -- Metadata
    fetched_at      timestamptz NOT NULL DEFAULT now(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

-- Dedup: one review per source per external ID
CREATE UNIQUE INDEX uq_reviews_source_id
    ON public.reviews (business_id, source, source_review_id)
    WHERE source_review_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON TABLE public.reviews IS
    'Reviews from Google/Facebook. Fetched periodically by n8n automation.';
COMMENT ON COLUMN public.reviews.source_review_id IS
    'External review ID for deduplication during periodic fetches.';
