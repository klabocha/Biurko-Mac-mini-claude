-- ============================================================================
-- AutoKlient Database Schema - Migration 007
-- Indexes for Performance
-- ============================================================================
-- Top 10 most common queries and the indexes that support them:
--
-- 1. "List my businesses" → businesses.owner_id (+ deleted_at filter)
-- 2. "List customers for business X" → customers.business_id (+ deleted_at)
-- 3. "Search customers by name/phone" → customers trgm + phone
-- 4. "List reviews for business X, newest first" → reviews(business_id, review_date)
-- 5. "Get pending jobs for processing" → jobs(status, scheduled_at)
-- 6. "List SMS log for business X" → sms_log(business_id, created_at)
-- 7. "Check subscription for business X" → subscriptions.business_id
-- 8. "Get templates for business/industry" → sms_templates(business_id, industry)
-- 9. "Dashboard: SMS stats this month" → sms_log(business_id, status, created_at)
-- 10. "Audit trail for a record" → audit_log(table_name, record_id)
--
-- IMPORTANT: RLS policies use get_user_business_ids() which queries
-- businesses.owner_id - this is the most critical index.
-- ============================================================================

-- ==========================================================================
-- BUSINESSES
-- ==========================================================================

-- Critical for RLS: every policy calls get_user_business_ids() → businesses WHERE owner_id = ?
CREATE INDEX idx_businesses_owner_id
    ON public.businesses (owner_id)
    WHERE deleted_at IS NULL;

-- Industry filter (for template resolution)
CREATE INDEX idx_businesses_industry
    ON public.businesses (industry)
    WHERE deleted_at IS NULL;

-- Google Place ID lookup (for review fetching dedup)
CREATE INDEX idx_businesses_google_place_id
    ON public.businesses (google_place_id)
    WHERE google_place_id IS NOT NULL AND deleted_at IS NULL;


-- ==========================================================================
-- CUSTOMERS
-- ==========================================================================

-- Primary listing query: all customers for a business, newest first
CREATE INDEX idx_customers_business_created
    ON public.customers (business_id, created_at DESC)
    WHERE deleted_at IS NULL;

-- Phone lookup (for SMS dedup, customer lookup by phone)
CREATE INDEX idx_customers_business_phone
    ON public.customers (business_id, phone)
    WHERE deleted_at IS NULL;

-- Fuzzy name search using trigram index
CREATE INDEX idx_customers_name_trgm
    ON public.customers USING gin (name gin_trgm_ops)
    WHERE deleted_at IS NULL;

-- Customers who haven't been asked for a review yet (automation target)
CREATE INDEX idx_customers_pending_review
    ON public.customers (business_id, created_at)
    WHERE review_requested_at IS NULL
    AND deleted_at IS NULL
    AND sms_consent = true;

-- Tags for segmentation queries (GIN index on array)
CREATE INDEX idx_customers_tags
    ON public.customers USING gin (tags)
    WHERE deleted_at IS NULL;


-- ==========================================================================
-- REVIEWS
-- ==========================================================================

-- Primary listing: reviews for a business, sorted by date
CREATE INDEX idx_reviews_business_date
    ON public.reviews (business_id, review_date DESC)
    WHERE deleted_at IS NULL;

-- Rating distribution query (dashboard widget)
CREATE INDEX idx_reviews_business_rating
    ON public.reviews (business_id, rating)
    WHERE deleted_at IS NULL;

-- Source filter
CREATE INDEX idx_reviews_business_source
    ON public.reviews (business_id, source)
    WHERE deleted_at IS NULL;


-- ==========================================================================
-- SUBSCRIPTIONS
-- ==========================================================================

-- Subscription lookup by business
CREATE INDEX idx_subscriptions_business
    ON public.subscriptions (business_id);

-- Stripe webhook lookup
CREATE INDEX idx_subscriptions_stripe_sub_id
    ON public.subscriptions (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

-- Find expiring trials (for notification cron)
CREATE INDEX idx_subscriptions_trial_expiry
    ON public.subscriptions (trial_ends_at)
    WHERE plan = 'trial' AND status = 'active';


-- ==========================================================================
-- JOBS
-- ==========================================================================

-- The main polling query: n8n looks for pending jobs to process
-- This is THE most performance-critical index for throughput
CREATE INDEX idx_jobs_pending_poll
    ON public.jobs (scheduled_at, priority DESC)
    WHERE status = 'pending';

-- Job history for a business
CREATE INDEX idx_jobs_business_created
    ON public.jobs (business_id, created_at DESC);

-- Job status for a specific business (dashboard)
CREATE INDEX idx_jobs_business_status
    ON public.jobs (business_id, status);

-- Failed jobs for retry logic
CREATE INDEX idx_jobs_failed_retry
    ON public.jobs (status, retry_count)
    WHERE status = 'failed' AND retry_count < max_retries;

-- Jobs for a specific customer
CREATE INDEX idx_jobs_customer
    ON public.jobs (customer_id)
    WHERE customer_id IS NOT NULL;


-- ==========================================================================
-- SMS_LOG
-- ==========================================================================

-- Primary listing: SMS history for a business, newest first
CREATE INDEX idx_sms_log_business_created
    ON public.sms_log (business_id, created_at DESC);

-- Analytics: SMS stats by status and date range
CREATE INDEX idx_sms_log_business_status_created
    ON public.sms_log (business_id, status, created_at);

-- Provider callback lookup (status webhook with provider_message_id)
CREATE INDEX idx_sms_log_provider_message_id
    ON public.sms_log (provider_message_id)
    WHERE provider_message_id IS NOT NULL;

-- SMS for a specific customer
CREATE INDEX idx_sms_log_customer
    ON public.sms_log (customer_id)
    WHERE customer_id IS NOT NULL;

-- Monthly billing: count SMS per business per month
CREATE INDEX idx_sms_log_business_sent_at
    ON public.sms_log (business_id, sent_at)
    WHERE status IN ('sent', 'delivered');


-- ==========================================================================
-- EMAIL_LOG
-- ==========================================================================

CREATE INDEX idx_email_log_business_created
    ON public.email_log (business_id, created_at DESC);

CREATE INDEX idx_email_log_provider_message_id
    ON public.email_log (provider_message_id)
    WHERE provider_message_id IS NOT NULL;


-- ==========================================================================
-- SMS_TEMPLATES
-- ==========================================================================

-- Template resolution: find default for an industry
CREATE INDEX idx_sms_templates_industry_type
    ON public.sms_templates (industry, template_type)
    WHERE business_id IS NULL AND is_default = true AND deleted_at IS NULL;

-- Business-specific templates
CREATE INDEX idx_sms_templates_business
    ON public.sms_templates (business_id)
    WHERE business_id IS NOT NULL AND deleted_at IS NULL;


-- ==========================================================================
-- EMAIL_TEMPLATES
-- ==========================================================================

CREATE INDEX idx_email_templates_industry_type
    ON public.email_templates (industry, template_type)
    WHERE business_id IS NULL AND is_default = true AND deleted_at IS NULL;

CREATE INDEX idx_email_templates_business
    ON public.email_templates (business_id)
    WHERE business_id IS NOT NULL AND deleted_at IS NULL;


-- ==========================================================================
-- GOOGLE_TOKEN_REFRESH_LOG
-- ==========================================================================

-- Recent refresh attempts for a business
CREATE INDEX idx_google_token_log_business_created
    ON public.google_token_refresh_log (business_id, created_at DESC);


-- ==========================================================================
-- AUDIT_LOG
-- ==========================================================================

-- Lookup by table + record (e.g., "show audit trail for customer X")
CREATE INDEX idx_audit_log_table_record
    ON public.audit_log (table_name, record_id);

-- Lookup by business (e.g., "all changes in my business")
CREATE INDEX idx_audit_log_business_created
    ON public.audit_log (business_id, created_at DESC);

-- Cleanup: find old audit entries for purging
CREATE INDEX idx_audit_log_created_at
    ON public.audit_log (created_at);


-- ==========================================================================
-- ANALYTICS_EVENTS
-- ==========================================================================

-- Dashboard queries: events for a business in a time range
CREATE INDEX idx_analytics_events_business_type_created
    ON public.analytics_events (business_id, event_type, created_at DESC);

-- Time-based cleanup
CREATE INDEX idx_analytics_events_created_at
    ON public.analytics_events (created_at);
