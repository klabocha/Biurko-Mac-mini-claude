# Debate MCP Server - Plan budowy

## Filozofia

**Wszystkie modele debatują ten sam temat.** Żadnej specjalizacji ról.
Każdy model ma inne dane treningowe, inne ograniczenia, inny "sposób myślenia".
Wartość pochodzi z **kolizji perspektyw**, nie z podziału pracy.

Gdybyśmy przydzielili każdemu modelowi osobny temat, dostalibyśmy N izolowanych
odpowiedzi syntetyzowanych przez jednego Claude -- to NIE jest debata.
Prawdziwa debata = wszyscy widzą to samo, każdy reaguje na argumenty innych.

---

## Architektura MCP

### Typ: MCP Server (TypeScript, stdio transport)

```
┌─────────────────────────────────────────────────┐
│                 Claude Code (host)               │
│                                                  │
│  Ty zadajesz pytanie → MCP Server orchestruje    │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Debate MCP Server │
        │                     │
        │  Tools:             │
        │  - debate()         │
        │  - quick_poll()     │
        │  - deep_dive()      │
        │  - add_model()      │
        │  - list_models()    │
        │  - generate_visuals()│ ← faza 2
        └──────────┬──────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐
│Claude  │  │  Grok 3  │  │ Kimi 2.5 │  ... + GPT o3, Gemini 2.5 Pro
│Opus 4.6│  │  (xAI)   │  │(Moonshot)│
└────────┘  └──────────┘  └──────────┘
```

### Protokół debaty (wielorundowy)

```
Runda 0 - NIEZALEŻNA ANALIZA
├── Pytanie trafia do WSZYSTKICH modeli równolegle
├── Każdy odpowiada NIE widząc odpowiedzi innych
└── Zbieramy N niezależnych perspektyw

Runda 1..N - KONFRONTACJA
├── Każdy model dostaje:
│   - Oryginalne pytanie
│   - WSZYSTKIE odpowiedzi z poprzedniej rundy (anonimowe lub z etykietą)
│   - Instrukcję: "Zidentyfikuj gdzie się zgadzasz, gdzie nie,
│     co inni zauważyli a ty nie, i zmień/podtrzymaj swoje stanowisko"
├── Modele odpowiadają równolegle
└── Powtarzamy aż do:
    - Konwergencji (modele przestają zmieniać zdanie)
    - Limitu rund (domyślnie 3)
    - Użytkownik przerywa

Runda FINALNA - SYNTEZA
├── Claude (jako host) dostaje PEŁNĄ historię debaty
├── Generuje:
│   - Punkty zgody (consensus)
│   - Punkty sporu (kontrowersje + argumenty każdej strony)
│   - Ślepe plamki (co ŻADEN model nie poruszył)
│   - Rekomendację z uzasadnieniem
└── Output wraca do użytkownika
```

### Tryby debaty

| Tryb | Rundy | Opis |
|------|-------|------|
| `quick_poll` | 1 (tylko R0) | Szybkie zebranie perspektyw, bez konfrontacji |
| `debate` | 3 (R0 + 2 konfrontacje + synteza) | Standardowa debata |
| `deep_dive` | 5+ (R0 + 4+ konfrontacje + synteza) | Głęboka analiza, np. strategia biznesowa, kwestie prawne |

### Konfiguracja modeli

**Podejście: indywidualne klucze API** (bez OpenRouter, bez prowizji)

```jsonc
// config.json
{
  "models": {
    "claude": {
      "provider": "anthropic",
      "model": "claude-opus-4-6",
      "api_key": "${ANTHROPIC_API_KEY}",
      "base_url": "https://api.anthropic.com"
    },
    "grok": {
      "provider": "openai-compatible",
      "model": "grok-3",
      "api_key": "${XAI_API_KEY}",
      "base_url": "https://api.x.ai/v1"
    },
    "kimi": {
      "provider": "openai-compatible",
      "model": "kimi-2.5",
      "api_key": "${MOONSHOT_API_KEY}",
      "base_url": "https://api.moonshot.cn/v1"
    },
    "gpt-o3": {
      "provider": "openai",
      "model": "o3",
      "api_key": "${OPENAI_API_KEY}",
      "base_url": "https://api.openai.com/v1"
    },
    "gemini": {
      "provider": "openai-compatible",
      "model": "gemini-2.5-pro",
      "api_key": "${GOOGLE_API_KEY}",
      "base_url": "https://generativelanguage.googleapis.com/v1beta/openai"
    }
  },
  "defaults": {
    "mode": "debate",
    "max_rounds": 3,
    "show_model_names": true,
    "language": "pl"
  }
}
```

**Dodawanie/usuwanie modeli dynamicznie:**
```
tool: add_model(name: "deepseek", provider: "openai-compatible", model: "deepseek-r1", base_url: "...", api_key_env: "DEEPSEEK_API_KEY")
tool: list_models() → pokazuje aktywne modele
```

---

## Faza 2: Grafika i Frontend (DO UZUPEŁNIENIA)

### Koncepcja

Debata o designie/grafice działa tak samo jak tekstowa:
1. Wszystkie modele dostają ten sam brief ("zaprojektuj landing page")
2. Każdy proponuje koncepcję (tekstowy opis + opcjonalnie kod/prompt graficzny)
3. Konfrontacja: modele widzą propozycje innych i krytykują/ulepszają
4. Po ustaleniu koncepcji → narzędzia graficzne generują wizualizacje

### Narzędzia graficzne (DO UZUPEŁNIENIA po sprawdzeniu na Mac mini)

Znane narzędzia użytkownika:
- [ ] **nanobanana** - (do potwierdzenia możliwości)
- [ ] **Figma MCP** - (do potwierdzenia wersji/konfiguracji)
- [ ] **Canva MCP** - (do potwierdzenia)
- [ ] ... inne (użytkownik poda listę z Mac mini)

### Tool: `generate_visuals()`

```
Po zakończeniu debaty tekstowej:
1. Bierze zwycięską koncepcję (lub top 2-3)
2. Generuje prompty dla narzędzi graficznych
3. Wywołuje dostępne narzędzia graficzne (Figma/Canva/nanobanana/DALL-E/etc.)
4. Zwraca warianty wizualne do porównania
```

**TODO:** Użytkownik sprawdzi na Mac mini:
- `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`
- Lista zainstalowanych MCP serwerów graficznych
- Klucze API do narzędzi graficznych

---

## Struktura projektu

```
debate-mcp-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # MCP server entry point (stdio)
│   ├── config.ts             # Ładowanie konfiguracji modeli
│   ├── providers/
│   │   ├── base.ts           # Interfejs LLMProvider
│   │   ├── anthropic.ts      # Claude (natywny SDK)
│   │   └── openai-compat.ts  # Grok, Kimi, GPT, Gemini (OpenAI SDK)
│   ├── debate/
│   │   ├── engine.ts         # Logika debaty (rundy, konfrontacja)
│   │   ├── prompts.ts        # Szablony promptów per runda
│   │   └── synthesis.ts      # Synteza finalna
│   ├── tools/
│   │   ├── debate.ts         # tool: debate()
│   │   ├── quick-poll.ts     # tool: quick_poll()
│   │   ├── deep-dive.ts      # tool: deep_dive()
│   │   ├── models.ts         # tools: add_model(), list_models()
│   │   └── visuals.ts        # tool: generate_visuals() [faza 2]
│   └── types.ts              # Typy TypeScript
├── config.json               # Konfiguracja modeli
└── README.md                 # Instrukcja instalacji
```

## Szablony promptów

### Runda 0 (niezależna analiza)
```
Jesteś ekspertem analizującym następujące zagadnienie.
Odpowiedz wyczerpująco, uwzględniając:
- Główne argumenty za i przeciw
- Ryzyka i szanse
- Perspektywę strategiczną, prawną, marketingową
- Konkretne rekomendacje

PYTANIE: {user_question}
```

### Runda 1+ (konfrontacja)
```
Przeanalizowałeś wcześniej poniższe zagadnienie. Oto Twoja poprzednia odpowiedź
oraz odpowiedzi {N} innych ekspertów.

TWOJA POPRZEDNIA ODPOWIEDŹ:
{own_previous_response}

ODPOWIEDZI INNYCH EKSPERTÓW:
{other_responses}

Teraz:
1. Zidentyfikuj punkty, w których inni mają rację a Ty się myliłeś
2. Zidentyfikuj punkty, w których podtrzymujesz swoje stanowisko i dlaczego
3. Wskaż co inni pominęli
4. Zaktualizuj swoją odpowiedź uwzględniając nowe perspektywy

ORYGINALNE PYTANIE: {user_question}
```

### Synteza finalna
```
Poniżej znajduje się pełna historia debaty {N} ekspertów na temat:
"{user_question}"

PEŁNA HISTORIA:
{full_debate_history}

Przygotuj syntezę:
1. KONSENSUS - w czym wszyscy się zgadzają
2. KONTROWERSJE - punkty sporu z argumentami każdej strony
3. ŚLEPE PLAMKI - ważne aspekty które żaden ekspert nie poruszył
4. EWOLUCJA MYŚLENIA - jak zmieniały się stanowiska w kolejnych rundach
5. REKOMENDACJA - co robić, z uzasadnieniem
```

---

## Instalacja (na Mac mini)

```bash
# 1. Klonuj repo
cd ~/Projects
git clone <repo-url> debate-mcp-server
cd debate-mcp-server

# 2. Instaluj zależności
npm install

# 3. Ustaw klucze API w .env
cp .env.example .env
# Edytuj .env:
# ANTHROPIC_API_KEY=sk-ant-...
# XAI_API_KEY=xai-...
# MOONSHOT_API_KEY=...
# OPENAI_API_KEY=sk-...
# GOOGLE_API_KEY=...

# 4. Zbuduj
npm run build

# 5. Dodaj do Claude Desktop / Claude Code
# W ~/.claude/settings.json lub claude_desktop_config.json:
{
  "mcpServers": {
    "debate": {
      "command": "node",
      "args": ["~/Projects/debate-mcp-server/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "...",
        "XAI_API_KEY": "...",
        "MOONSHOT_API_KEY": "...",
        "OPENAI_API_KEY": "...",
        "GOOGLE_API_KEY": "..."
      }
    }
  }
}
```

## Przykład użycia

```
Ty: /debate "Czy powinniśmy wejść na rynek niemiecki w Q3 2026?"

MCP → Runda 0 (równolegle):
  Claude: "Tak, ale z partnerem lokalnym bo..."
  Grok: "Nie teraz. Regulacje DSGVO się zaostrzają..."
  Kimi: "Tak, dane pokazują 23% wzrost w segmencie..."
  GPT-o3: "Zależy od struktury prawnej. GmbH vs oddział..."
  Gemini: "Trendy Google wskazują na spadek popytu w..."

MCP → Runda 1 (konfrontacja):
  Claude: "Grok ma rację co do DSGVO, zmieniam rekomendację na Q1 2027..."
  Grok: "Kimi pokazał dane których nie uwzględniłem, ale..."
  ...

MCP → Synteza:
  KONSENSUS: Rynek niemiecki jest atrakcyjny, ale timing jest kluczowy
  KONTROWERSJE: Q3 2026 vs Q1 2027 (regulacje vs okno rynkowe)
  ŚLEPE PLAMKI: Nikt nie poruszył kwestii rekrutacji lokalnego zespołu
  REKOMENDACJA: ...
```

---

## Status

- [x] Plan architektury
- [x] Protokół debaty
- [x] Szablony promptów
- [x] Struktura projektu
- [ ] **DO UZUPEŁNIENIA:** Lista narzędzi graficznych z Mac mini
- [ ] **DO UZUPEŁNIENIA:** Konfiguracja Figma/Canva/nanobanana MCP
- [ ] Implementacja Faza 1 (debata tekstowa)
- [ ] Implementacja Faza 2 (grafika)
- [ ] Testy
- [ ] Deployment na Mac mini
