-- ============================================================================
-- AutoKlient Database Schema - Migration 008
-- Triggers: updated_at, soft-delete, audit logging, business logic
-- ============================================================================

-- ==========================================================================
-- UPDATED_AT TRIGGERS
-- ==========================================================================
-- Automatically set updated_at = now() on every UPDATE.

CREATE TRIGGER trg_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_sms_templates_updated_at
    BEFORE UPDATE ON public.sms_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ==========================================================================
-- SOFT-DELETE TRIGGERS
-- ==========================================================================
-- Intercept DELETE and convert to UPDATE SET deleted_at = now().
-- Tables with soft-delete: businesses, customers, reviews, sms_templates, email_templates
--
-- DECISION (question C): We use deleted_at column instead of archive tables because:
--   1. Simpler queries (just add WHERE deleted_at IS NULL)
--   2. Easy restore (SET deleted_at = NULL)
--   3. Partial unique indexes handle the UNIQUE constraint problem
--   4. RLS policies already filter out deleted rows
--   5. Archive tables would require maintaining duplicate schemas

CREATE TRIGGER trg_businesses_soft_delete
    BEFORE DELETE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.soft_delete();

CREATE TRIGGER trg_customers_soft_delete
    BEFORE DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.soft_delete();

CREATE TRIGGER trg_reviews_soft_delete
    BEFORE DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.soft_delete();

CREATE TRIGGER trg_sms_templates_soft_delete
    BEFORE DELETE ON public.sms_templates
    FOR EACH ROW EXECUTE FUNCTION public.soft_delete();

CREATE TRIGGER trg_email_templates_soft_delete
    BEFORE DELETE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.soft_delete();


-- ==========================================================================
-- AUDIT LOG TRIGGERS
-- ==========================================================================
-- Trigger-based auditing for compliance-critical tables.
-- Fires AFTER the operation so it doesn't block the actual write.
-- Uses SECURITY DEFINER to bypass RLS when inserting into audit_log.
--
-- Audited tables: businesses, customers, subscriptions, sms_templates
-- NOT audited: jobs (too noisy), sms_log/email_log (already immutable),
--              analytics_events (too noisy), google_token_refresh_log (diagnostic)

CREATE TRIGGER trg_businesses_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_customers_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_subscriptions_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_sms_templates_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.sms_templates
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();


-- ==========================================================================
-- BUSINESS LOGIC TRIGGERS
-- ==========================================================================

-- ---------------------------------------------------------------------------
-- Subscription protection: prevent downgrade if usage exceeds new plan limits
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_subscription_downgrade()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_customer_count integer;
BEGIN
    -- Only check when plan is being changed to a lower tier
    IF OLD.plan IS DISTINCT FROM NEW.plan THEN
        -- Check customer count against new limit
        SELECT count(*) INTO v_customer_count
        FROM public.customers
        WHERE business_id = NEW.business_id AND deleted_at IS NULL;

        IF v_customer_count > NEW.customers_limit THEN
            RAISE EXCEPTION 'Cannot downgrade: you have % customers but the % plan allows only %',
                v_customer_count, NEW.plan, NEW.customers_limit;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_subscriptions_protect_downgrade
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.protect_subscription_downgrade();


-- ---------------------------------------------------------------------------
-- SMS sending guard: check subscription limits before creating send_sms job
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_sms_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_sub record;
BEGIN
    -- Only check for send_sms jobs
    IF NEW.type != 'send_sms' THEN
        RETURN NEW;
    END IF;

    SELECT s.sms_limit_monthly, s.sms_used_this_month, s.status
    INTO v_sub
    FROM public.subscriptions s
    WHERE s.business_id = NEW.business_id
    AND s.status IN ('active', 'past_due')
    LIMIT 1;

    IF v_sub IS NULL THEN
        RAISE EXCEPTION 'No active subscription for business %', NEW.business_id;
    END IF;

    IF v_sub.status = 'past_due' THEN
        RAISE EXCEPTION 'Subscription is past due. Please update payment method.';
    END IF;

    IF v_sub.sms_used_this_month >= v_sub.sms_limit_monthly THEN
        RAISE EXCEPTION 'Monthly SMS limit reached (% of %). Upgrade your plan.',
            v_sub.sms_used_this_month, v_sub.sms_limit_monthly;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_jobs_check_sms_limit
    BEFORE INSERT ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.check_sms_limit();


-- ---------------------------------------------------------------------------
-- Auto-increment SMS counter when sms_log records a successful send
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_sms_counter()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only count on initial insert with 'sent' or 'delivered' status
    IF NEW.status IN ('sent', 'delivered') THEN
        UPDATE public.subscriptions
        SET sms_used_this_month = sms_used_this_month + 1
        WHERE business_id = NEW.business_id
        AND status IN ('active', 'past_due');
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sms_log_increment_counter
    AFTER INSERT ON public.sms_log
    FOR EACH ROW EXECUTE FUNCTION public.increment_sms_counter();


-- ---------------------------------------------------------------------------
-- Auto-create subscription on business creation (trial plan)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.subscriptions (business_id, plan, status)
    VALUES (NEW.id, 'trial', 'active');

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_businesses_auto_subscription
    AFTER INSERT ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.auto_create_trial_subscription();


-- ---------------------------------------------------------------------------
-- Prevent hard-delete on audit_log (safety net)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_audit_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only service_role can delete audit logs (for retention cleanup)
    IF NOT public.is_service_role() THEN
        RAISE EXCEPTION 'Audit log entries cannot be deleted by users.';
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_audit_log_prevent_delete
    BEFORE DELETE ON public.audit_log
    FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_delete();
