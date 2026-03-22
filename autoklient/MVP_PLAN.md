# AutoKlient MVP - Plan Implementacji

## Wizja produktu

AutoKlient to SaaS do automatyzacji zbierania opinii Google dla malych firm w Polsce.
Klient loguje sie, podlacza swoj Google Business Profile, a system automatycznie
wysyla SMS/email do klientow z prosba o opinie.

**Model biznesowy:** 199-349 PLN/msc, 14 dni trial, platnosci przez Przelewy24.

---

## Tech Stack

| Warstwa | Technologia | Uzasadnienie |
|---------|------------|--------------|
| Frontend | Next.js 14 (App Router) | SSR, dobre SEO, stabilny ekosystem |
| Styling | Tailwind CSS + shadcn/ui | Szybki development, gotowe komponenty |
| Backend/DB | Supabase (Frankfurt) | Auth, Postgres, RLS, realtime - wszystko w jednym |
| Automatyzacja | n8n na Hetzner VPS (CX22) | Self-hosted, wizualny workflow builder, tani |
| SMS | SMSAPI.pl | Polski provider, sender name, DLR callbacks |
| Email | Resend | Prosty API, dobra dostarczosc |
| Platnosci | Przelewy24 (P24) | Standard w Polsce, recurring payments |
| DNS/CDN | Cloudflare | Free tier, email routing, DDoS protection |
| Monitoring | Sentry + UptimeRobot | Error tracking + uptime monitoring |
| Hosting frontend | Vercel | Zero-config deploy Next.js |

---

## Architektura

```
[Klient/Przegladarka]
        |
   [Vercel - Next.js App]
        |
   [Supabase]
   ├── Auth (email/password + magic link)
   ├── Postgres (RLS, 12 tabel)
   └── Edge Functions (webhooks)
        |
   [n8n na Hetzner]
   ├── Cron: sprawdz nowe reviews co 6h
   ├── Cron: wyslij zaplanowane SMS/email
   ├── Webhook: P24 payment callbacks
   └── Webhook: SMSAPI DLR callbacks
```

### Kluczowe decyzje architektoniczne

1. **Szyfrowanie tokenow Google** - AES-256-GCM na warstwie aplikacji, klucze w env vars
2. **Multi-tenancy** - Supabase RLS z helper function `get_user_business_ids()`
3. **Soft delete** - kolumna `deleted_at` dla RODO compliance (businesses, customers, reviews)
4. **Audit log** - trigger-based, automatyczny, 2 lata retencji
5. **Jobs vs Logs** - jobs = tymczasowa kolejka, sms_log/email_log = immutable audit trail

---

## Baza danych

12 tabel z pelnym RLS, zdefiniowane w 9 migracjach (`supabase/migrations/001-009`):

| Tabela | Opis |
|--------|------|
| businesses | Firmy uzytkownikow |
| customers | Klienci firm (odbiorcy SMS) |
| reviews | Opinie Google pobrane z API |
| subscriptions | Subskrypcje i billing |
| jobs | Kolejka zadan (SMS/email do wyslania) |
| sms_log | Log wyslanych SMS (immutable) |
| email_log | Log wyslanych emaili (immutable) |
| sms_templates | Szablony SMS z zmiennymi |
| email_templates | Szablony email |
| google_token_refresh_log | Log odswiezania tokenow Google |
| audit_log | Pelny audit trail (INSERT/UPDATE/DELETE) |
| analytics_events | Zdarzenia analityczne |

Pelna dokumentacja decyzji: `supabase/SCHEMA_DECISIONS.md`

---

## Fazy implementacji

### FAZA 0: Przygotowanie (Konrad - manualne)
> Szczegoly w `TWOJE_ZADANIA.md`

- [ ] Kupno domeny autoklient.pl
- [ ] Sprawdzenie umowy z Edwards (non-compete)
- [ ] Rozmowa z Katarzyna (spolka)
- [ ] Zalozenie Google Business Profile dla ESKULAP (60 dni na API!)
- [ ] Rejestracja SMSAPI.pl, Supabase, Cloudflare, Resend, Sentry

**Blocker:** Bez Google Business Profile nie ma dostepu do Places API.

---

### FAZA 1: Fundament (Claude - kod)
**Cel:** Dzialajacy szkielet z auth i dashboardem.

#### 1.1 Projekt Next.js
```bash
npx create-next-app@latest autoklient-app --typescript --tailwind --app --src-dir
cd autoklient-app
npx shadcn@latest init
```

Struktura katalogow:
```
src/
├── app/
│   ├── (auth)/          # login, register, forgot-password
│   ├── (dashboard)/     # glowny panel po zalogowaniu
│   │   ├── page.tsx     # dashboard overview
│   │   ├── customers/   # lista klientow
│   │   ├── reviews/     # opinie Google
│   │   ├── campaigns/   # kampanie SMS/email
│   │   ├── templates/   # szablony wiadomosci
│   │   └── settings/    # ustawienia konta
│   ├── (marketing)/     # landing page, cennik
│   └── api/             # API routes (webhooks)
├── components/
│   ├── ui/              # shadcn components
│   └── dashboard/       # dashboard-specific components
├── lib/
│   ├── supabase/        # client + server helpers
│   ├── encryption.ts    # AES-256-GCM for Google tokens
│   └── utils.ts
└── types/
```

#### 1.2 Supabase Auth
- Email/password registration
- Magic link login
- Middleware do ochrony routes `/dashboard/*`
- Supabase Auth helpers dla Next.js (SSR)

#### 1.3 Onboarding flow
1. Rejestracja -> email verification
2. Dodaj firme (nazwa, adres, telefon)
3. Podlacz Google Business Profile (OAuth2)
4. Wybierz plan (14 dni trial)

#### 1.4 Dashboard MVP
- Statystyki: ile SMS wyslano, ile opinii, srednia ocena
- Lista klientow z wyszukiwarka
- Lista ostatnich opinii

**Deliverable:** Uzytkownik moze sie zarejestrowac, dodac firme, zobaczyc pusty dashboard.

---

### FAZA 2: Core features (Claude - kod)
**Cel:** Automatyzacja SMS i pobieranie opinii.

#### 2.1 Google Business Profile integration
- OAuth2 flow (consent screen -> token -> refresh)
- Przechowywanie tokenow (AES-256-GCM encrypted w Supabase)
- Pobieranie opinii z Places API (New) - `reviews` endpoint
- Cron w n8n: co 6h sprawdz nowe opinie

#### 2.2 System SMS
- Integracja z SMSAPI.pl (REST API)
- Szablony z zmiennymi: `{imie}`, `{firma}`, `{link_opinia}`
- Kolejka jobs: uzytkownik planuje wysylke -> job w DB -> n8n przetwarza
- DLR callbacks (delivery reports) -> aktualizacja sms_log
- Limity: max 100 SMS/dzien/firme (ochrona przed spamem)

#### 2.3 System Email
- Integracja z Resend API
- Szablony HTML z zmiennymi
- Email jako fallback / uzupelnienie SMS

#### 2.4 n8n Workflows
Workflow 1: **Review Poller**
- Trigger: cron co 6h
- Dla kazdej aktywnej firmy: sprawdz nowe opinie
- Zapisz do tabeli `reviews`
- Wyslij notyfikacje do wlasciciela

Workflow 2: **SMS Sender**
- Trigger: cron co 5 min
- Pobierz pending jobs z tabeli `jobs`
- Wyslij przez SMSAPI
- Zaktualizuj status job + sms_log

Workflow 3: **Webhook Receiver**
- SMSAPI DLR callbacks
- P24 payment callbacks

**Deliverable:** System automatycznie pobiera opinie i wysyla SMS.

---

### FAZA 3: Billing (Claude - kod)
**Cel:** Platnosci i zarzadzanie subskrypcjami.

#### 3.1 Przelewy24 integracja
- Sandbox testing
- Checkout flow: wybierz plan -> redirect do P24 -> callback -> aktywuj subskrypcje
- Recurring payments (jesli P24 wspiera) lub manual renewal reminder
- Webhook handler dla statusow platnosci

#### 3.2 Plany cenowe
| Plan | Cena | SMS/msc | Firmy |
|------|------|---------|-------|
| Starter | 199 PLN | 500 | 1 |
| Business | 279 PLN | 1500 | 3 |
| Premium | 349 PLN | 5000 | 10 |

#### 3.3 Trial management
- 14 dni darmowego trial
- Email reminder: 3 dni, 1 dzien przed koncem
- Soft block po koncu trial (dashboard read-only, brak SMS)

**Deliverable:** Uzytkownik moze zaplacic i ma aktywna subskrypcje.

---

### FAZA 4: Polish & Landing Page (Claude - kod)
**Cel:** Marketing i dopracowanie UX.

#### 4.1 Landing page (marketing)
- Hero: "Zbieraj opinie Google na autopilocie"
- Jak to dziala (3 kroki)
- Cennik
- FAQ
- CTA -> rejestracja

#### 4.2 UX improvements
- Responsive design (mobile-first)
- Loading states, error handling
- Toast notifications
- Empty states z helpful messaging

#### 4.3 Email transakcyjne
- Welcome email po rejestracji
- Trial ending reminder
- Payment confirmation
- Weekly summary (ile opinii, ile SMS)

**Deliverable:** Gotowa strona marketingowa i dopracowany UX.

---

### FAZA 5: Beta launch (Konrad + Claude)
**Cel:** 10 beta testerow z Czestochowy.

- [ ] Upgrade Supabase do Pro ($25/msc)
- [ ] Dokumenty prawne (regulamin, polityka prywatnosci, RODO DPA)
- [ ] Logo (Canva/Looka)
- [ ] Znalezc 10 beta testerow (szkoly jazdy, nieruchomosci, instalatorzy)
- [ ] Setup UptimeRobot monitoring
- [ ] Zbierac feedback, iterowac

**Deliverable:** 10 firm aktywnie korzysta z systemu.

---

## Koszty miesieczne (szacunek MVP)

| Usluga | Koszt |
|--------|-------|
| Supabase Pro | $25 (~100 PLN) |
| Hetzner CX22 (n8n) | ~20 PLN |
| Vercel (free tier) | 0 PLN |
| Cloudflare (free tier) | 0 PLN |
| Domena autoklient.pl | ~50 PLN/rok |
| Sentry (free tier) | 0 PLN |
| SMSAPI (pay per SMS) | ~0.07 PLN/SMS |
| Resend (free tier 3k/msc) | 0 PLN |
| **Razem (bez SMS)** | **~130 PLN/msc** |

Breakeven: 1 klient na planie Starter (199 PLN) pokrywa koszty infrastruktury.

---

## Ryzyka i mitygacja

| Ryzyko | Prawdopodobienstwo | Mitygacja |
|--------|-------------------|-----------|
| Google API rate limits | Srednie | Polling co 6h, cache, exponential backoff |
| SMSAPI problemy z dostarczalnnoscia | Niskie | DLR monitoring, fallback na email |
| P24 nie wspiera recurring | Srednie | Manual renewal + email reminder |
| RODO skarga | Niskie | Audit log, soft delete, DPA, consent tracking |
| Non-compete z Edwards | Srednie | Sprawdzic umowe PRZED startem (Z2) |

---

## Kolejnosc pracy Claude'a

Po zakonczeniu Fazy 0 przez Konrada, Claude implementuje w kolejnosci:

1. **Scaffold Next.js + Supabase auth** (Faza 1.1-1.2)
2. **Onboarding flow** (Faza 1.3)
3. **Dashboard UI** (Faza 1.4)
4. **Google OAuth + review polling** (Faza 2.1)
5. **SMS system + n8n workflows** (Faza 2.2, 2.4)
6. **Email system** (Faza 2.3)
7. **P24 billing** (Faza 3)
8. **Landing page** (Faza 4.1)
9. **Polish & emails** (Faza 4.2-4.3)

Kazdy krok konczy sie dzialajacym deploymentem na Vercel.

---

## Pliki w repozytorium

```
autoklient/
├── MVP_PLAN.md              # <- ten dokument
├── TWOJE_ZADANIA.md         # zadania manualne dla Konrada
└── supabase/
    ├── SCHEMA_DECISIONS.md  # decyzje architektoniczne DB
    └── migrations/
        ├── 001_extensions_and_functions.sql
        ├── 002_core_tables.sql
        ├── 003_operational_tables.sql
        ├── 004_sms_templates.sql
        ├── 005_audit_and_analytics.sql
        ├── 006_rls_policies.sql
        ├── 007_indexes.sql
        ├── 008_triggers.sql
        └── 009_seed_data.sql
```
