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
    ▼              ▼              ▼           ▼              ▼              ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌───────────┐
│ GPT o3 │  │Grok 4.1  │  │ Kimi 2.5 │  │Gemini  │  │ DeepSeek │  │Perplexity │
│(OpenAI)│  │  (xAI)   │  │(Moonshot)│  │2.5 Pro │  │  Chat    │  │ Sonar Pro │
└────────┘  └──────────┘  └──────────┘  └────────┘  └──────────┘  └───────────┘
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
      "model": "grok-4-1-fast",
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

## Faza 2: Grafika i Frontend

### Koncepcja

Debata o designie/grafice dziala tak samo jak tekstowa:
1. Wszystkie modele dostaja ten sam brief ("zaprojektuj landing page")
2. Kazdy proponuje koncepcje (tekstowy opis + opcjonalnie kod/prompt graficzny)
3. Konfrontacja: modele widza propozycje innych i krytykuja/ulepszaja
4. Po ustaleniu koncepcji -> narzedzia graficzne generuja wizualizacje

### Narzedzia graficzne (sprawdzone na Mac mini)

| Narzedzie | MCP Server | Mozliwosci | Uzycie w debacie |
|-----------|-----------|------------|-------------------|
| **Nano Banana** | `nano-banana` | Gemini image gen: `generate_image`, `edit_image`, `continue_editing` | Generowanie koncepcji wizualnych z promptow tekstowych, iteracja na obrazach |
| **Figma MCP** | `claude.ai Figma` | `create_new_file`, `generate_diagram`, `get_design_context`, `get_screenshot`, `use_figma` | Diagramy architektoniczne, wireframy, design systemy, eksport screenshotow |
| **Kapture MCP** | `kapture` | `screenshot`, `navigate`, `click`, `dom` (Brave browser) | Screenshoty istniejacych stron do analizy, capture referencji wizualnych |
| **Playwright MCP** | `playwright` | `browser_take_screenshot`, `browser_navigate`, `browser_snapshot` | Automatyczne screenshoty, testowanie wygladu stron |
| ~~Canva MCP~~ | - | NIEDOSTEPNY | - |

### Tool: `generate_visuals()`

```
Po zakonczeniu debaty tekstowej o designie:

1. ZBIERZ koncepcje zwycieska (lub top 2-3 z debaty)
   - Wyodrebnij: kolorystyka, layout, typografia, key elements

2. GENERUJ obrazy przez Nano Banana MCP
   - Uzyj `generate_image` z promptem opartym na zwycieskiej koncepcji
   - Jesli potrzebna iteracja: `edit_image` lub `continue_editing`
   - Output: PNG/JPG koncepcji wizualnej

3. GENERUJ diagramy/wireframy przez Figma MCP
   - `generate_diagram` dla flowchartow i architektur
   - `create_new_file` + `use_figma` dla wireframow komponentow
   - `get_screenshot` do eksportu wynikow jako obrazy

4. ZBIERZ referencje przez Kapture/Playwright
   - Jesli debata dotyczy redesignu: `screenshot` obecnej strony
   - Jesli debata dotyczy konkurencji: `navigate` + `screenshot` stron konkurencji

5. ZWROC wyniki do uzytkownika:
   - Obraz(y) z Nano Banana (koncepcja wizualna)
   - Screenshot(y) z Figma (wireframe/diagram)
   - Opcjonalnie: screenshoty referencyjne
   - Podsumowanie: ktory model zaproponowal co, co zostalo zsyntetyzowane
```

### Strategia narzedzi per typ debaty

| Typ debaty | Nano Banana | Figma | Kapture/Playwright |
|-----------|-------------|-------|--------------------|
| Landing page design | Koncepcje hero, CTA | Wireframe layoutu | Screenshot konkurencji |
| Logo/branding | Warianty logo | - | - |
| Architektura systemu | - | Diagram C4/flowchart | - |
| UX/UI review | - | Wireframe alternatyw | Screenshot obecnego UI |
| Infografika | Warianty graficzne | Diagram danych | - |

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

## Komenda /debata-ai

Globalna komenda Claude Code (`~/.claude/commands/debata-ai.md`) z pelnym workflow:

```
/debata-ai on          # Wlacza MCP serwer w ~/.claude/.mcp.json
/debata-ai off         # Wylacza MCP serwer
/debata-ai status      # Sprawdza stan i dostepne modele
/debata-ai <pytanie>   # Uruchamia debate z interaktywnym wyborem trybu/modeli
```

Workflow debaty:
1. Sprawdza czy MCP dziala (jesli nie -> informuje o `/debata-ai on`)
2. Wyswietla dostepne modele
3. Pyta o tryb: quick_poll ($0.02-0.05) / debate ($0.05-0.15) / deep_dive ($0.15-0.40)
4. Pyta o modele (wszystkie lub wybrane)
5. Pokazuje potwierdzenie kosztow - wymaga `tak` przed startem
6. Uruchamia debate i prezentuje wyniki

Pliki:
- `~/.claude/commands/debata-ai.md` - definicja komendy
- `~/.claude/debate-mcp-keys.json` - backup kluczy API (uzywany przez on/off)
- `~/.claude/.mcp.json` - globalna rejestracja MCP

---

## Status

- [x] Plan architektury
- [x] Protokol debaty
- [x] Szablony promptow
- [x] Struktura projektu
- [x] Lista narzedzi graficznych z Mac mini (Nano Banana, Figma MCP, Kapture, Playwright)
- [x] Konfiguracja narzedzi graficznych w Fazie 2
- [x] Implementacja Faza 1 (debata tekstowa) - 6 modeli: GPT, Gemini, Kimi, Grok, DeepSeek, Perplexity
- [x] Deployment globalny - MCP w ~/.claude/.mcp.json, klucze w debate-mcp-keys.json
- [x] Komenda /debata-ai z trybami on/off/status + interaktywny workflow debaty
- [ ] Implementacja Faza 2 (grafika) - stub gotowy, logika do napisania
- [ ] Testy end-to-end z prawdziwymi API
