# Debate MCP Server

Serwer MCP (Model Context Protocol) do prowadzenia wielomodelowych debat AI. Zadajesz pytanie - kilka modeli AI analizuje je niezaleznie, a potem konfrontuje swoje stanowiska w kolejnych rundach. Na koncu otrzymujesz synteze z konsensusem, kontrowersjami i rekomendacja.

## Szybki start

```bash
# W Claude Code wpisz:
/debata-ai on          # wlacza serwer (wymaga restartu Claude Code)
/debata-ai status      # sprawdza czy dziala
/debata-ai Czy warto inwestowac w AI w medycynie?
```

## Jak dziala

```
Pytanie uzytkownika
        |
   Runda 0: Niezalezna analiza
   (kazdy model odpowiada osobno)
        |
   Runda 1-N: Konfrontacja
   (modele widza odpowiedzi innych i aktualizuja stanowisko)
        |
   Synteza: Konsensus, kontrowersje, slepe plamki, rekomendacja
```

## Dostepne modele

| Model | Provider | API |
|---|---|---|
| GPT o3 | OpenAI | openai.com |
| Gemini 2.5 Pro | Google | generativelanguage.googleapis.com |
| Grok 4.1 Fast | xAI | api.x.ai |
| Kimi k2.5 | Moonshot | api.moonshot.ai |
| DeepSeek Chat | DeepSeek | api.deepseek.com |
| Perplexity Sonar Pro | Perplexity | api.perplexity.ai |

Serwer laduje tylko modele, dla ktorych sa ustawione klucze API. Minimum 2 modele sa wymagane do debaty.

## Komenda /debata-ai

Globalna komenda Claude Code dostepna w kazdym projekcie.

### Zarzadzanie serwerem

```
/debata-ai on       # Wlacza MCP w ~/.claude/.mcp.json (wymaga restartu Claude Code)
/debata-ai off      # Wylacza MCP (wymaga restartu Claude Code)
/debata-ai status   # Sprawdza czy MCP dziala i jakie modele sa aktywne
```

### Uruchamianie debaty

```
/debata-ai Czy AI zastapi lekarzy?
/debata-ai          # Pyta o temat interaktywnie
```

Workflow po wpisaniu tematu:
1. Sprawdza czy MCP dziala (jesli nie - informuje o `/debata-ai on`)
2. Pokazuje dostepne modele
3. Pyta o tryb (quick_poll / debate / deep_dive)
4. Pyta o wybor modeli (wszystkie lub wybrane)
5. Pokazuje szacunek kosztow i czeka na potwierdzenie
6. Uruchamia debate i wyswietla wyniki

### Szacunkowe koszty

| Tryb | Rundy | Koszt (6 modeli) | Kiedy uzywac |
|---|---|---|---|
| `quick_poll` | 1 (bez konfrontacji) | ~$0.02-0.05 | Szybki przeglad opinii |
| `debate` | 3 (1 + 2 konfrontacje) | ~$0.05-0.15 | Standardowa analiza |
| `deep_dive` | 5 (1 + 4 konfrontacje) | ~$0.15-0.40 | Strategiczne decyzje |

## Narzedzia MCP

### `debate`
Standardowa debata wielorundowa (3 rundy: 1 niezalezna + 2 konfrontacje).

```
debate(question: "Czy warto inwestowac w AI w sektorze medycznym?")
```

### `quick_poll`
Szybki poll - zbiera niezalezne opinie bez konfrontacji (1 runda).

```
quick_poll(question: "Najlepszy framework frontend 2026?")
```

### `deep_dive`
Rozszerzona debata z 5+ rundami. Do strategii biznesowych, kwestii prawnych, zlozonych decyzji.

```
deep_dive(question: "Strategia wejscia na rynek niemiecki")
```

### `add_model`
Dodaj nowy model w runtime.

```
add_model(name: "mistral", provider: "openai-compatible", model: "mistral-large", baseUrl: "https://api.mistral.ai/v1", apiKeyEnv: "MISTRAL_API_KEY")
```

### `list_models`
Pokaz liste aktywnych modeli.

## Parametry debaty

| Parametr | Opis | Domyslnie |
|---|---|---|
| `question` | Pytanie/temat do debaty | wymagane |
| `mode` | `quick_poll` / `debate` / `deep_dive` | `debate` |
| `models` | Lista nazw modeli (podzbiur) | wszystkie |

## Instalacja (od zera)

```bash
cd debate-mcp-server
npm install
npm run build
```

## Konfiguracja

### Opcja 1: Komenda /debata-ai (zalecana)

```
/debata-ai on
# Zrestartuj Claude Code
```

Komenda automatycznie dodaje serwer do `~/.claude/.mcp.json` z kluczami z `~/.claude/debate-mcp-keys.json`.

### Opcja 2: Reczna rejestracja globalna

Plik `~/.claude/.mcp.json`:

```json
{
  "mcpServers": {
    "debate": {
      "command": "node",
      "args": ["/Users/konradlabochamacmini/Dev/Biurko-Mac-mini-claude/debate-mcp-server/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "...",
        "OPENAI_API_KEY": "...",
        "MOONSHOT_API_KEY": "...",
        "XAI_API_KEY": "...",
        "DEEPSEEK_API_KEY": "...",
        "PERPLEXITY_API_KEY": "..."
      }
    }
  }
}
```

### Opcja 3: Rejestracja per projekt

Plik `.claude/.mcp.json` w katalogu projektu (ten sam format co powyzej).

## Pliki konfiguracyjne

| Plik | Opis |
|---|---|
| `~/.claude/.mcp.json` | Globalna rejestracja MCP (wlaczanie/wylaczanie serwera) |
| `~/.claude/debate-mcp-keys.json` | Backup kluczy API (uzywany przez `/debata-ai on`) |
| `~/.claude/commands/debata-ai.md` | Definicja komendy `/debata-ai` |
| `debate-mcp-server/.env` | Lokalne klucze API (alternatywa dla env w .mcp.json) |

## Architektura

```
src/
  index.ts              # Serwer MCP - rejestracja narzedzi
  config.ts             # Konfiguracja modeli z env
  types.ts              # Typy TypeScript
  providers/
    base.ts             # Abstrakcyjna klasa BaseProvider
    anthropic.ts        # Provider Anthropic (natywne SDK)
    openai-compat.ts    # Provider OpenAI-compatible (GPT, Gemini, Grok, Kimi, DeepSeek, Perplexity)
    factory.ts          # Factory createProvider()
  debate/
    engine.ts           # Silnik debaty - rundy, konfrontacje
    prompts.ts          # Prompty systemowe i uzytkownika
    synthesis.ts        # Synteza wynikow debaty
  tools/
    debate.ts           # Tool handler debate/quick_poll/deep_dive
    models.ts           # Tool handler add_model/list_models
    visuals.ts          # Stub Fazy 2 - wizualizacje
```

## Technologie

- TypeScript + Node.js (ESM)
- MCP SDK (`@modelcontextprotocol/sdk`)
- Anthropic SDK (`@anthropic-ai/sdk`)
- OpenAI SDK (`openai`) - jako klient OpenAI-compatible dla Gemini, Grok, Kimi, DeepSeek, Perplexity
- Zod - walidacja inputow
- dotenv - konfiguracja

## Status

- [x] Faza 1: Silnik debaty, providery, narzedzia MCP (6 modeli)
- [x] Globalna rejestracja MCP w ~/.claude/.mcp.json
- [x] Komenda /debata-ai z trybami on/off/status + workflow debaty
- [x] Backup kluczy API w ~/.claude/debate-mcp-keys.json
- [ ] Faza 2: Wizualizacje (Nano Banana, Figma, Kapture)
- [ ] Testy end-to-end z prawdziwymi API
