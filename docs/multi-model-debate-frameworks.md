# Multi-Model AI Debate/Discussion Frameworks

Analiza frameworków do debat wielomodelowych z uwzględnieniem kompatybilności z Grok (xAI) i Kimi 2.5 (Moonshot AI).

Data analizy: 2026-03-25

---

## Kompatybilność Grok i Kimi 2.5

### Grok (xAI)

- **API**: Publiczne, `https://api.x.ai/v1` (konsola: `console.x.ai`)
- **OpenAI-compatible**: TAK -- drop-in replacement, wystarczy zmienić base_url i klucz
- **OpenRouter**: TAK -- prefix `x-ai/` (np. `x-ai/grok-4-1-fast`)
- **Najnowsze modele**:
  - `grok-4-1-fast-reasoning` / `grok-4-1-fast-non-reasoning` -- 2M kontekst
  - `grok-4-07-09` -- flagship, 256K kontekst
  - `grok-code-fast-1` -- zoptymalizowany do kodowania, 256K kontekst
- **Cennik** (per 1M tokenów):
  - Grok 4: $3.00 input / $15.00 output
  - Grok 4.1 Fast: $0.20 input / $0.50 output (ŚWIETNY do debat!)
  - Nowi użytkownicy: $25 darmowych kredytów + $150/mies. za data sharing

### Kimi K2.5 (Moonshot AI)

- **API**: Publiczne, `https://api.moonshot.ai/v1` (konsola: `platform.moonshot.ai`)
- **OpenAI-compatible**: TAK -- pełna kompatybilność z OpenAI SDK
- **OpenRouter**: TAK -- `moonshotai/kimi-k2.5`
- **Najnowsze modele**: `kimi-k2.5` (1T parametrów, 32B aktywnych, MoE)
- **Cennik** (per 1M tokenów):
  - Direct: $0.60 input / $2.50 output
  - OpenRouter: $0.45 input / $2.20 output
  - Context caching zmniejsza koszty inputu o 75%
- **Geo-restrickcje**: BRAK -- dostępny globalnie, też przez AWS Bedrock i NVIDIA NIM
- **Open-source**: Tak (Modified MIT License). Cursor Composer 2 jest zbudowany na Kimi K2.5.

---

## TOP 3 Rekomendowane frameworki (MCP serwery)

### 1. `blueman82/ai-counsel` (204 stars) -- NAJLEPSZA DEBATA

**Grok**: TAK (przez OpenRouter lub custom HTTP adapter z `base_url: https://api.x.ai/v1`)
**Kimi 2.5**: TAK (przez OpenRouter lub custom HTTP adapter z `base_url: https://api.moonshot.ai/v1`)

- Prawdziwa wielorundowa deliberacja z auto-konwergencją (stop przy 85%+ podobieństwie)
- Głosowanie z poziomem pewności (0.0-1.0)
- Modele widzą odpowiedzi innych i zmieniają zdanie
- Evidence-based: agenci mogą czytać pliki, przeszukiwać kod, uruchamiać komendy
- Convergence detection (TF-IDF, SentenceTransformer, Jaccard)
- 113+ testów, produkcyjny
- Wspiera: CLI tools (claude, codex, droid, gemini) + HTTP services (ollama, lmstudio, openrouter, nebius)

Konfiguracja Grok/Kimi:
```yaml
# config.yaml
adapters:
  grok:
    type: http
    base_url: https://api.x.ai/v1
    api_key_env: XAI_API_KEY
    model: grok-4-1-fast-non-reasoning
  kimi:
    type: http
    base_url: https://api.moonshot.ai/v1
    api_key_env: MOONSHOT_API_KEY
    model: kimi-k2.5
```

### 2. `spranab/brainstorm-mcp` (46 stars) -- NAJŁATWIEJSZY START

**Grok**: TAK (custom baseURL)
**Kimi 2.5**: TAK (custom baseURL)

- Instalacja: `npx -y brainstorm-mcp`
- Wysyłasz temat -> wszystkie modele odpowiadają równolegle -> widzą odpowiedzi innych -> kolejne rundy -> synteza
- Claude uczestniczy aktywnie obok innych modeli
- Odporny na awarie (jeden model padnie - reszta działa)
- Estymacja kosztów, per-model timeouts

Konfiguracja Grok/Kimi:
```json
{
  "grok": {
    "model": "grok-4-1-fast",
    "apiKeyEnv": "XAI_API_KEY",
    "baseURL": "https://api.x.ai/v1"
  },
  "kimi": {
    "model": "kimi-k2.5",
    "apiKeyEnv": "MOONSHOT_API_KEY",
    "baseURL": "https://api.moonshot.ai/v1"
  }
}
```

### 3. `religa/multi_mcp` -- NAJLEPSZY DO KODU

**Grok**: TAK (przez OpenRouter)
**Kimi 2.5**: TAK (przez OpenRouter)

- Explicit narzędzie `debate` -- niezależne odpowiedzi + krytyka + konsensus
- Też `compare`, `codereview`, `chat`
- Analiza bezpieczeństwa OWASP Top 10
- Wspiera: GPT, Claude, Gemini, OpenRouter + CLI (Gemini CLI, Codex CLI, Claude CLI)

---

## Inne warte uwagi frameworki

### Tier 1 -- Duże frameworki z capability debat

| Projekt | Stars | Grok/Kimi | Opis |
|---------|-------|-----------|------|
| **microsoft/autogen** | ~56,200 | TAK (model-agnostic) | Dedykowany wzorzec Multi-Agent Debate. Microsoft backing. |
| **crewAIInc/crewAI** | ~47,100 | TAK (multi-provider) | Role-playing agents. Debaty budowane na top. |
| **togethercomputer/MoA** | ~2,900 | Częściowo (Together API) | Layered Mixture-of-Agents. Pobił GPT-4o na AlpacaEval 2.0. |
| **OpenBMB/AgentVerse** | ~5,000 | Częściowo (OpenAI API) | Dedykowany tryb ChatEval debate. Web UI. |

### Tier 2 -- Dedykowane frameworki debat

| Projekt | Stars | Grok/Kimi | Opis |
|---------|-------|-----------|------|
| **Farama-Foundation/chatarena** | ~1,540 | TAK (Anthropic, OpenAI, local) | Game-theoretic environments (Werewolf, NLP Classroom). |
| **Skytliang/Multi-Agents-Debate** | ~539 | OpenAI only | Seminalny "tit for tat" debate. Angel vs Devil + Judge. |
| **composable-models/llm_multiagent_debate** | ~516 | OpenAI only | ICML 2024. Redukcja halucynacji. |

### Tier 3 -- MCP serwery

| Projekt | Stars | Grok/Kimi | Opis |
|---------|-------|-----------|------|
| **BeehiveInnovations/pal-mcp-server** | ~11,300 | TAK (OpenRouter) | Multi-model consensus ze stance steering. |
| **albinjal/multi-agent-debate-mcp** | ~16 | Custom endpoints | Formalna debata: register/argue/rebut/judge. |
| **pinkpixel-dev/mindbridge-mcp** | ~28 | TAK (OpenAI-compatible) | Route queries do wielu LLM, porównuj, second opinions. |
| **Shelpuk-AI-Technology-Consulting/lad_mcp_server** | ~20 | TAK (OpenRouter 200+) | Multi-model consensus do code review. |
| **elevanaltd/debate-hall-mcp** | ~7 | Konfigurowalny | 3 głosy PATHOS/ETHOS/LOGOS. Hash-chain audit. |
| **kstrikis/ephor-mcp-collaboration** | -- | Model-agnostic | "Council of Ephors" -- discuss, challenge, build. |

### Tier 4 -- Mniejsze projekty

| Projekt | Stars | Opis |
|---------|-------|------|
| **terry-li-hm/consilium** | ~2 | 5 frontier LLMs debate, Claude Opus judges. Rust. |
| **Bluear7878/Colosseum** | ~4 | Debate arena z 20+ personami. PDF raporty. |
| **Argus-Framework/argus-ai-debate** | ~5 | Bayesian reasoning, adversarial evidence. |
| **hereisSwapnil/ai-council** | ~3 | Multi-round z Ollama/OpenRouter. |
| **gyunggyung/Tiny-MoA** | ~25 | MoA na CPU only (16GB RAM). |

---

## Optymalne parametry debat (z badań naukowych)

| Parametr | Optimum | Źródło |
|----------|---------|--------|
| Liczba agentów | 3-5 (3 = sweet spot koszt/jakość) | Du et al. ICML 2024 |
| Liczba rund | 2-3 (po 3 malejące zwroty) | MAD, MoA |
| Najlepsze role | Proposer -> Critic -> Devil's Advocate -> Synthesizer | ChatArena |
| Anonimizacja | Tak -- redukuje bias wobec "marki" modelu | LLM Council |
| Końcowa synteza | Silny model czyta całą debatę (lepsze niż głosowanie) | MoA |
| Różne modele vs kopie | Różne modele +15-25% lepsze wyniki | MoA paper |
| Poprawa vs single model | +15-20% matematyka, +10-25% fakty | ICML 2024 |

---

## Estymacja kosztów miesięcznych (debaty z Grok + Kimi)

Założenia: ~100 debat/mies., 3 agentów, 3 rundy, ~2000 tokenów/runda

| Model | Rola w debacie | Koszt/mies. |
|-------|---------------|-------------|
| Claude (Max plan) | Moderator/Syntezator | $0 (wliczone) |
| Grok 4.1 Fast | Agent debatujący | ~$2-5 |
| Kimi K2.5 | Agent debatujący | ~$3-8 |
| DeepSeek V3 | Agent debatujący (opcja) | ~$1-3 |
| Lokalne (Ollama) | Agent debatujący (opcja) | $0 |
| **RAZEM** | | **~$5-16/mies.** |

vs OpenRouter z dużymi modelami: $50-300+/mies.

---

## Kluczowe artykuły naukowe

1. "Encouraging Divergent Thinking in LLMs through Multi-Agent Debate" (MAD) -- Skytliang et al.
2. "Improving Factuality and Reasoning through Multiagent Debate" -- Du et al. (ICML 2024)
3. "Multi-LLM Debate: Framework, Principals, and Interventions" -- OpenReview
4. "Mixture-of-Agents Enhances Large Language Model Capabilities" -- Wang et al. (arXiv:2406.04692)
5. "Agent4Debate" -- ICASSP 2026. Human-level competitive debate.

---

## Rekomendacja

**Zainstaluj `ai-counsel` jako MCP serwer w Claude Code** z konfiguracją:
- Claude Max (moderator/syntezator) -- $0
- Grok 4.1 Fast (szybki, tani, 2M kontekst) -- ~$0.20/$0.50 per 1M tokens
- Kimi K2.5 (silny MoE, open-source) -- ~$0.60/$2.50 per 1M tokens
- Opcjonalnie: lokalne modele przez Ollama -- $0

Wszystkie trzy modele (Claude, Grok, Kimi) są OpenAI-compatible, więc konfiguracja jest prosta.
