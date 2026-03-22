-- ============================================================================
-- AutoKlient Database Schema - Migration 009
-- Seed Data: System Default Templates + Development Test Data
-- ============================================================================
-- This migration seeds:
--   1. System-wide default SMS templates (per industry)
--   2. System-wide default email templates
--   3. (DEV ONLY) Test business, customers, and jobs - wrapped in DO block
--      that checks for a 'seed_dev_data' setting
-- ============================================================================

-- ==========================================================================
-- SYSTEM DEFAULT SMS TEMPLATES
-- ==========================================================================
-- These templates have business_id = NULL and is_default = true.
-- Users see these as starting points and can clone/customize them.

-- ---------------------------------------------------------------------------
-- UNIVERSAL TEMPLATES (industry = NULL, apply to all industries)
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

-- Universal review request
(NULL,
 'Prosba o opinie - uniwersalna',
 'Domyslny szablon prosby o opinie, pasuje do kazdej branzy.',
 NULL,
 'Czesc {customer_name}! Dziekujemy za skorzystanie z uslug {business_name}. Bedzie nam bardzo milo, jesli zostawisz nam opinie: {review_link}',
 'review_request',
 true),

-- Universal follow-up
(NULL,
 'Przypomnienie o opinii - uniwersalne',
 'Przypomnienie wysylane po {followup_days} dniach od pierwszej prosby.',
 NULL,
 'Hej {customer_name}, pamietasz o nas? Twoja opinia jest dla nas bardzo wazna. Zajmie Ci to tylko chwile: {review_link} Dziekujemy! {business_name}',
 'review_followup',
 true),

-- Universal thank you
(NULL,
 'Podziekowanie za opinie - uniwersalne',
 'Wysylane automatycznie po wykryciu nowej opinii.',
 NULL,
 'Dziekujemy za Twoja opinie, {customer_name}! Cenimy sobie Twoje zdanie. Pozdrawiamy, {business_name}',
 'review_thank_you',
 true);

-- ---------------------------------------------------------------------------
-- OSK (Osrodek Szkolenia Kierowcow) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - OSK',
 'Dla szkol jazdy. Wysylane po zdaniu egzaminu.',
 'osk',
 'Gratulacje {customer_name}! Cieszymy sie, ze zdales egzamin z {business_name}! Zostaw nam opinie i pomoz innym kursantom wybrac dobra szkole jazdy: {review_link}',
 'review_request',
 true),

(NULL,
 'Przypomnienie - OSK',
 'Follow-up dla szkol jazdy.',
 'osk',
 'Hej {customer_name}! Mamy nadzieje, ze juz jedzisz za kolkiem! Jesli masz chwile, zostaw nam krotka opinie - pomoze to innym kursantom: {review_link} {business_name}',
 'review_followup',
 true);

-- ---------------------------------------------------------------------------
-- NIERUCHOMOSCI (Real Estate) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - nieruchomosci',
 'Dla biur nieruchomosci. Wysylane po finalizacji transakcji.',
 'nieruchomosci',
 'Dzien dobry {customer_name}! Dziekujemy za zaufanie przy transakcji z {business_name}. Bardzo prosimy o Twoja opinie: {review_link} Pomoze to innym klientom.',
 'review_request',
 true),

(NULL,
 'Przypomnienie - nieruchomosci',
 'Follow-up dla biur nieruchomosci.',
 'nieruchomosci',
 '{customer_name}, czy mozemy liczyc na Twoja opinie o wspolpracy z {business_name}? Kilka slow od Ciebie to dla nas duzo: {review_link}',
 'review_followup',
 true);

-- ---------------------------------------------------------------------------
-- INSTALACJE (Installations - HVAC, plumbing, electrical) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - instalacje',
 'Dla firm instalacyjnych. Wysylane po zakonczeniu prac.',
 'instalacje',
 'Dzien dobry {customer_name}! Dziekujemy za zlecenie dla {business_name}. Jesli jestes zadowolony z naszej pracy, prosimy o krotka opinie: {review_link}',
 'review_request',
 true),

(NULL,
 'Przypomnienie - instalacje',
 'Follow-up dla firm instalacyjnych.',
 'instalacje',
 'Witaj {customer_name}! Mamy nadzieje, ze wszystko dziala sprawnie. Jesli masz chwile, Twoja opinia o {business_name} bardzo nam pomoze: {review_link}',
 'review_followup',
 true);

-- ---------------------------------------------------------------------------
-- AUTO SERWIS (Auto Service) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - auto serwis',
 'Dla warsztatow samochodowych.',
 'auto_serwis',
 'Czesc {customer_name}! Dziekujemy za wizyte w {business_name}. Mamy nadzieje, ze auto jest w swietnej formie! Zostaw nam opinie: {review_link}',
 'review_request',
 true),

(NULL,
 'Przypomnienie - auto serwis',
 'Follow-up dla warsztatow.',
 'auto_serwis',
 '{customer_name}, jak sie spisuje auto po wizycie w {business_name}? Twoja opinia pomoze innym kierowcom: {review_link} Dziekujemy!',
 'review_followup',
 true);

-- ---------------------------------------------------------------------------
-- GASTRONOMIA (Restaurants) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - gastronomia',
 'Dla restauracji i lokali gastronomicznych.',
 'gastronomia',
 'Dziekujemy za wizyte w {business_name}, {customer_name}! Mamy nadzieje, ze smakowalo. Zostaw nam opinie: {review_link}',
 'review_request',
 true),

(NULL,
 'Przypomnienie - gastronomia',
 'Follow-up dla restauracji.',
 'gastronomia',
 'Hej {customer_name}! Pamietasz jak bylo u nas w {business_name}? Podziel sie wrażeniami: {review_link} Dziekujemy!',
 'review_followup',
 true);

-- ---------------------------------------------------------------------------
-- ZDROWIE I URODA (Health & Beauty) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - zdrowie i uroda',
 'Dla salonow kosmetycznych, fryzjerskich, SPA.',
 'zdrowie_uroda',
 'Czesc {customer_name}! Dziekujemy za wizyte w {business_name}. Jesli jestes zadowolona/y, prosimy o opinie: {review_link}',
 'review_request',
 true),

(NULL,
 'Przypomnienie - zdrowie i uroda',
 'Follow-up dla salonow.',
 'zdrowie_uroda',
 '{customer_name}, mamy nadzieje, ze efekt wizyty w {business_name} dalej Cie cieszy! Zostaw nam krotka opinie: {review_link}',
 'review_followup',
 true);

-- ---------------------------------------------------------------------------
-- EDUKACJA (Education) TEMPLATES
-- ---------------------------------------------------------------------------

INSERT INTO public.sms_templates (business_id, name, description, industry, message_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - edukacja',
 'Dla szkol, korepetytorow, centrow edukacyjnych.',
 'edukacja',
 'Dzien dobry {customer_name}! Dziekujemy za udzial w zajęciach {business_name}. Twoja opinia pomoze nam sie rozwijac: {review_link}',
 'review_request',
 true),

(NULL,
 'Przypomnienie - edukacja',
 'Follow-up dla placowek edukacyjnych.',
 'edukacja',
 '{customer_name}, jak oceniasz zajecia w {business_name}? Podziel sie opinia: {review_link} Dziekujemy za kazdą wskazowke!',
 'review_followup',
 true);


-- ==========================================================================
-- SYSTEM DEFAULT EMAIL TEMPLATES
-- ==========================================================================

INSERT INTO public.email_templates (business_id, name, description, industry, subject_template, body_template, template_type, is_default) VALUES

(NULL,
 'Prosba o opinie - email uniwersalny',
 'Domyslny email z prosba o opinie.',
 NULL,
 'Jak oceniasz {business_name}?',
 '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<h2>Czesc {customer_name}!</h2>
<p>Dziekujemy za skorzystanie z uslug <strong>{business_name}</strong>.</p>
<p>Twoja opinia jest dla nas niezwykle wazna. Czy mozesz poswiecic chwile na zostawienie recenzji?</p>
<p style="text-align: center; margin: 30px 0;">
  <a href="{review_link}" style="background-color: #4285f4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;">Zostaw opinie</a>
</p>
<p>Dziekujemy!<br>{business_name}</p>
</div>',
 'review_request',
 true),

(NULL,
 'Miesięczny raport - email',
 'Szablon miesiecznego raportu z opiniami.',
 NULL,
 'Raport miesieczny - {business_name}',
 '<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
<h2>Raport miesieczny</h2>
<p>Oto podsumowanie opinii dla <strong>{business_name}</strong>.</p>
<p>Szczegoly raportu dostepne w panelu AutoKlient.</p>
</div>',
 'monthly_report',
 true);


-- ==========================================================================
-- DEVELOPMENT TEST DATA
-- ==========================================================================
-- Only inserted when running in development/local environment.
-- In production, this block is skipped.
--
-- To insert dev data, run:
--   SET app.environment = 'development';
-- before running this migration, or use Supabase seed.sql instead.
-- ==========================================================================

DO $$
DECLARE
    v_env text;
    v_test_user_id uuid;
    v_business_id uuid;
    v_customer1_id uuid;
    v_customer2_id uuid;
    v_customer3_id uuid;
BEGIN
    -- Check if we should seed dev data
    v_env := coalesce(current_setting('app.environment', true), 'production');
    IF v_env != 'development' THEN
        RAISE NOTICE 'Skipping dev seed data (app.environment = %)', v_env;
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding development test data...';

    -- We need a user from auth.users. In dev, use the first user or skip.
    SELECT id INTO v_test_user_id FROM auth.users LIMIT 1;
    IF v_test_user_id IS NULL THEN
        RAISE NOTICE 'No auth.users found. Skipping dev seed. Create a user first.';
        RETURN;
    END IF;

    -- Test business: OSK "Auto Szkoła Mistrz"
    INSERT INTO public.businesses (id, owner_id, name, industry, phone, email, google_place_id, google_review_link, settings)
    VALUES (
        gen_random_uuid(),
        v_test_user_id,
        'Auto Szkola Mistrz',
        'osk',
        '+48501234567',
        'kontakt@autoszkolamistrz.pl',
        'ChIJexample123',
        'https://g.page/r/example/review',
        '{"sms_sender_name": "AutoMistrz", "review_request_delay_hours": 24, "followup_enabled": true, "followup_delay_days": 7, "timezone": "Europe/Warsaw"}'::jsonb
    )
    RETURNING id INTO v_business_id;

    -- Test customers
    INSERT INTO public.customers (id, business_id, name, phone, email, sms_consent, sms_consent_at, tags, source)
    VALUES
        (gen_random_uuid(), v_business_id, 'Jan Kowalski', '+48600111222', 'jan@example.com', true, now(), ARRAY['kurs_B', 'zdal'], 'manual'),
        (gen_random_uuid(), v_business_id, 'Anna Nowak', '+48600333444', 'anna@example.com', true, now(), ARRAY['kurs_B'], 'import'),
        (gen_random_uuid(), v_business_id, 'Piotr Wisniewski', '+48600555666', NULL, false, NULL, ARRAY['kurs_A'], 'manual')
    RETURNING id INTO v_customer3_id;

    -- Get the first two customer IDs
    SELECT id INTO v_customer1_id FROM public.customers WHERE business_id = v_business_id AND name = 'Jan Kowalski';
    SELECT id INTO v_customer2_id FROM public.customers WHERE business_id = v_business_id AND name = 'Anna Nowak';

    -- Test reviews
    INSERT INTO public.reviews (business_id, customer_id, source, reviewer_name, rating, review_text, review_date)
    VALUES
        (v_business_id, v_customer1_id, 'google', 'Jan K.', 5, 'Swietna szkola jazdy! Instruktor bardzo cierpliwy.', now() - interval '7 days'),
        (v_business_id, NULL, 'google', 'Marta Z.', 4, 'Dobra szkola, polecam.', now() - interval '14 days'),
        (v_business_id, NULL, 'google', 'Tomek W.', 3, 'OK, ale moglby byc lepszy kontakt.', now() - interval '30 days');

    -- Test job (pending SMS)
    INSERT INTO public.jobs (business_id, type, status, customer_id, payload, scheduled_at)
    VALUES (
        v_business_id,
        'send_sms',
        'pending',
        v_customer2_id,
        jsonb_build_object(
            'customer_id', v_customer2_id,
            'phone', '+48600333444',
            'message_text', 'Test: Czesc Anna! Zostaw opinie: https://g.page/r/example/review'
        ),
        now() + interval '1 hour'
    );

    RAISE NOTICE 'Dev seed data created. Business ID: %', v_business_id;
END;
$$;
