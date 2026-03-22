# AutoKlient - Zadania Manualne (Konrad)

Ponizej lista zadan ktore MUSISZ wykonac osobiscie - Claude nie ma do nich dostepu.
Kazde zadanie ma priorytet i moment w ktorym jest potrzebne.

---

## PRZED FAZA 1 (zanim zaczniemy kodowac)

### Z1. Kup domene autoklient.pl
- Wejdz na OVH.pl lub Cloudflare Registrar
- Kup domene autoklient.pl (~50 PLN/rok)
- Jesli niedostepna: autoklient.com.pl lub autoklient.app
- **Potrzebne przed:** Faza 1 (Cloudflare setup)

### Z2. Sprawdz umowe z Edwards Lifesciences
- Przeczytaj klauzule non-compete / moonlighting / IP assignment
- Upewnij sie ze SaaS niezwiazany z medtech nie jest objety
- Jesli jest watpliwosc - skonsultuj z prawnikiem pracy
- **Potrzebne przed:** launch publiczny

### Z3. Porozmawiaj z Katarzyna (wspolniczka S.C.)
- Poinformuj o nowym projekcie SaaS pod ESKULAP S.C.
- Potrzebna zgoda na dodanie PKD 62.01.Z jesli nie ma
- Omow rozdzielenie ksiegowosci (przychody SaaS 12% vs apteka 3%)
- **Potrzebne przed:** pierwsze przychody

### Z4. Zaloz wizytowke Google Business dla ESKULAP
- Wejdz na business.google.com
- Dodaj "Punkt Apteczny Eskulap, Wierzchowisko"
- Zweryfikuj (telefon lub karta pocztowa)
- Po 60 dniach mozna zlozyc wniosek o Google Business Profile API
- **Potrzebne przed:** Faza 5 (ale im wczesniej tym lepiej - 60 dni!)

---

## FAZA 1 - SETUP INFRASTRUKTURY

### Z5. Zaloz konto SMSAPI.pl
- Wejdz na smsapi.pl -> Zaloz konto (biznesowe)
- Dane firmy: ESKULAP S.C. lub nowa JDG
- Zarejestruj nadawce alfanumerycznego "AutoKlient" (1-3 dni weryfikacji)
- Doladuj konto testowe (min. 50 PLN na start)
- **Wynik:** API token (OAuth Bearer) -> przekaz Claude
- **Prompt dla Claude w Brave:**
  ```
  Wejdz na panel.smsapi.pl -> Ustawienia -> API -> Tokeny.
  Skopiuj OAuth Bearer Token. To jest SMSAPI_API_TOKEN.
  Zapisz go bezpiecznie - bedziemy go potrzebowac w .env.local
  ```

### Z6. Utworz projekt Supabase
- Wejdz na supabase.com -> New Project
- Nazwa: autoklient
- Region: **eu-central-1 (Frankfurt)** - WAZNE dla RODO!
- Haslo bazy: wygeneruj silne i zapisz
- Plan: Free na czas developmentu, Pro ($25/mies) PRZED beta testami
- **Wynik:** Project URL + anon key + service_role key -> przekaz Claude
- **Prompt dla Claude w Brave:**
  ```
  Wejdz na supabase.com/dashboard -> Project Settings -> API.
  Skopiuj:
  1. Project URL (np. https://xxxxx.supabase.co)
  2. anon public key
  3. service_role secret key (NIE UDOSTEPNIAJ PUBLICZNIE)
  Zapisz je - bedziemy potrzebowac w .env.local
  ```

### Z7. Dodaj domene do Cloudflare
- Wejdz na dash.cloudflare.com
- Add site -> wpisz autoklient.pl
- Zmien nameservery u rejestratora na te z Cloudflare
- Wlacz Email Routing: kontakt@autoklient.pl -> klabocha@gmail.com
- **Potrzebne przed:** deployment

### Z8. Zaloz konto Resend
- Wejdz na resend.com -> Sign up
- Dodaj domene autoklient.pl (DNS verification w Cloudflare)
- **Wynik:** API key -> przekaz Claude
- **Prompt dla Claude w Brave:**
  ```
  Wejdz na resend.com/api-keys -> Create API Key.
  Nazwa: autoklient-production
  Permission: Full access
  Skopiuj klucz (zaczyna sie od re_...)
  ```

### Z9. Zaloz konto Sentry
- Wejdz na sentry.io -> Sign up (darmowy plan)
- Utworz projekt: Platform = Next.js, nazwa = autoklient
- **Wynik:** DSN -> przekaz Claude
- **Prompt dla Claude w Brave:**
  ```
  Wejdz na sentry.io -> Settings -> Projects -> autoklient -> Client Keys (DSN).
  Skopiuj DSN (zaczyna sie od https://...@....ingest.sentry.io/...)
  ```

### Z10. Przygotuj VPS Hetzner dla n8n
- Wejdz na hetzner.com -> Cloud -> New Server
- Lokalizacja: Falkenstein lub Nuremberg (EU)
- Typ: CX22 (2 vCPU, 4 GB RAM, ~6 EUR/mies)
- OS: Ubuntu 24.04
- SSH key: dodaj swoj klucz
- **Wynik:** IP serwera + SSH dostep -> przekaz Claude
- **Prompt dla Claude w Brave:**
  ```
  Polacz sie przez SSH: ssh root@{IP_SERWERA}
  Zainstaluj Docker:
  curl -fsSL https://get.docker.com | sh
  Sprawdz: docker --version
  Przekaz mi IP serwera - skonfigurujesz n8n przez docker-compose.
  ```

### Z11. Aktywuj Przelewy24 sandbox
- Zaloguj sie na panel.przelewy24.pl (Merchant 384533)
- Wejdz w Ustawienia -> Dane techniczne
- Sprawdz czy masz dostep do sandbox (sandbox.przelewy24.pl)
- Jesli nie -> skontaktuj sie z P24 dzialem technicznym
- **WAZNE:** Zapytaj o aktywacje platnosci cyklicznych (recurring)
  - Powiedz ze potrzebujesz: card-on-file + BLIK recurring
  - Oni musza to wlaczyc po swojej stronie
- **Wynik:** Merchant ID sandbox + CRC key + API key -> przekaz Claude

---

## FAZA 3 - PO ZBUDOWANIU CORE

### Z12. Zarejestruj aplikacje w Google Cloud Console
- Wejdz na console.cloud.google.com
- Nowy projekt: AutoKlient
- Wlacz API: Places API (New)
- Utworz credentials: API Key (z ograniczeniem do Places API)
- **Wynik:** Google Places API Key -> przekaz Claude
- **Prompt dla Claude w Brave:**
  ```
  Wejdz na console.cloud.google.com -> APIs & Services -> Credentials.
  Create Credentials -> API Key.
  Ogranicz klucz do: Places API (New).
  Skopiuj klucz.
  ```

### Z13. Skonfiguruj UptimeRobot
- Wejdz na uptimerobot.com -> Sign up (free)
- Dodaj monitory:
  1. HTTP(s): https://app.autoklient.pl (co 5 min)
  2. HTTP(s): https://{IP_VPS}:5678 (n8n, co 5 min)
  3. HTTP(s): https://app.autoklient.pl/api/health (co 5 min)
- Alert kontakt: Twoj email + opcjonalnie SMS
- **Potrzebne przed:** beta testy

---

## FAZA 5 - PRZED BETA TESTAMI

### Z14. Upgrade Supabase do Pro
- Panel Supabase -> Billing -> Upgrade to Pro ($25/mies)
- KRYTYCZNE: Free tier pauzuje projekt po 1 tyg nieaktywnosci!
- **Potrzebne przed:** beta testy z prawdziwymi uzytkownikami

### Z15. Przygotuj dokumenty prawne
- Regulamin uslug (wygeneruj przez ChatGPT + szablon LegalGeek.pl)
- Polityka prywatnosci (RODO)
- Umowa powierzenia danych (DPA) - szablon dla klientow B2B
- Zgoda SMS zgodna z PKE 2024
- **Prompt dla ChatGPT:**
  ```
  Jestem wlascicielem SaaS o nazwie AutoKlient (autoklient.pl).
  Usuga: platforma do automatyzacji SMS i zarzadzania opiniami Google
  dla malych firm w Polsce. Cena: 199-349 PLN/mies. Forma prawna: JDG
  lub S.C. Wygeneruj:
  1. Regulamin uslug (po polsku, zgodny z prawem polskim 2026)
  2. Polityke prywatnosci (RODO, dane w EU - Supabase Frankfurt)
  3. Szablon DPA (umowa powierzenia przetwarzania danych)
  4. Tresc checkboxa zgody na SMS marketing (zgodna z PKE 2024)
  Uwzglednij: AI generuje tresci (disclaimer), 14-dniowy trial,
  platnosci P24, sub-procesorzy: Supabase, SMSAPI, Anthropic, Resend.
  ```

### Z16. Znajdz 10 beta testerow w Czestochowie
- Osobiscie odwiedz:
  - 3-4 szkoly jazdy
  - 2-3 biura nieruchomosci
  - 2-3 firmy instalacyjne (PV/pompy/klima)
- Propozycja: "3 miesiace za darmo w zamian za feedback"
- Zbierz: nazwa firmy, email, telefon, link Google Maps
- **Potrzebne przed:** launch

### Z17. Stworz logo
- Canva.com lub Looka.com
- Styl: prosty, niebieski (#2563EB), nowoczesny
- Formaty: SVG (web), PNG 512x512 (PWA icon), PNG 192x192
- Favicon 32x32 i 16x16
- **Potrzebne przed:** beta testy

---

## PODSUMOWANIE KOLEJNOSCI

| Kiedy | Zadania | Czas |
|-------|---------|------|
| **DZIS** | Z1 (domena), Z4 (Google Business) | 30 min |
| **Przed Faza 1** | Z2 (Edwards), Z3 (Katarzyna) | rozmowy |
| **Faza 1** | Z5-Z11 (konta: SMSAPI, Supabase, Cloudflare, Resend, Sentry, Hetzner, P24) | 2-3h |
| **Faza 3** | Z12 (Google Cloud), Z13 (UptimeRobot) | 30 min |
| **Faza 5** | Z14 (Supabase Pro), Z15 (prawo), Z16 (beta), Z17 (logo) | 1-2 dni |

**UWAGA:** Po wykonaniu kazdego zadania przekaz wyniki (API keys, IP adresy, itp.)
do Claude - bede ich potrzebowal do konfiguracji w kodzie (.env.local).
NIE wklejaj kluczy API w czat publiczny - uzyj .env.local lub Supabase Vault.
