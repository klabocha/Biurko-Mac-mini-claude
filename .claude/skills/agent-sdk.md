# Claude Agent SDK - Dokumentacja referencyjna

## Przegląd

Claude Agent SDK (wcześniej Claude Code SDK) pozwala budować autonomicznych agentów AI
z wbudowanymi narzędziami do czytania plików, uruchamiania komend, edycji kodu i więcej.

**Pakiety:**
- TypeScript: `@anthropic-ai/claude-agent-sdk`
- Python: `claude-agent-sdk`

## Instalacja

```bash
# TypeScript
npm install @anthropic-ai/claude-agent-sdk

# Python
pip install claude-agent-sdk
```

## Uwierzytelnianie

```bash
export ANTHROPIC_API_KEY=your-api-key

# Alternatywne providery:
# Amazon Bedrock:    CLAUDE_CODE_USE_BEDROCK=1 + AWS credentials
# Google Vertex AI:  CLAUDE_CODE_USE_VERTEX=1 + GCP credentials
# Microsoft Azure:   CLAUDE_CODE_USE_FOUNDRY=1 + Azure credentials
```

## Podstawowe użycie

### Python

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Znajdź i napraw błąd w auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"]),
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

### TypeScript

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Znajdź i napraw błąd w auth.py",
  options: { allowedTools: ["Read", "Edit", "Bash"] }
})) {
  if ("result" in message) console.log(message.result);
}
```

## Wbudowane narzędzia

| Narzędzie         | Opis                                           |
|-------------------|-------------------------------------------------|
| **Read**          | Czytanie dowolnego pliku                        |
| **Write**         | Tworzenie nowych plików                         |
| **Edit**          | Precyzyjna edycja istniejących plików           |
| **Bash**          | Komendy terminala, skrypty, operacje git        |
| **Glob**          | Wyszukiwanie plików po wzorcu (`**/*.ts`)       |
| **Grep**          | Przeszukiwanie zawartości plików (regex)        |
| **WebSearch**     | Wyszukiwanie w internecie                       |
| **WebFetch**      | Pobieranie i parsowanie stron internetowych     |
| **AskUserQuestion** | Pytania do użytkownika z opcjami wielokrotnego wyboru |
| **Task**          | Uruchamianie subagentów                         |

## Subagenci

Definiowanie wyspecjalizowanych agentów delegowanych przez agenta głównego.
Wymagane: `Task` w `allowedTools`.

### Python

```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async for message in query(
    prompt="Użyj agenta code-reviewer do przeglądu kodu",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep", "Task"],
        agents={
            "code-reviewer": AgentDefinition(
                description="Ekspert od przeglądu kodu pod kątem jakości i bezpieczeństwa.",
                prompt="Analizuj jakość kodu i zasugeruj ulepszenia.",
                tools=["Read", "Glob", "Grep"],
            )
        },
    ),
):
    if hasattr(message, "result"):
        print(message.result)
```

### TypeScript

```typescript
for await (const message of query({
  prompt: "Użyj agenta code-reviewer do przeglądu kodu",
  options: {
    allowedTools: ["Read", "Glob", "Grep", "Task"],
    agents: {
      "code-reviewer": {
        description: "Ekspert od przeglądu kodu pod kątem jakości i bezpieczeństwa.",
        prompt: "Analizuj jakość kodu i zasugeruj ulepszenia.",
        tools: ["Read", "Glob", "Grep"]
      }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

## Hooki (Hooks)

Uruchamianie niestandardowego kodu w kluczowych punktach cyklu życia agenta.

**Dostępne hooki:** `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`

### Python - przykład logowania zmian

```python
from datetime import datetime
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher

async def log_file_change(input_data, tool_use_id, context):
    file_path = input_data.get("tool_input", {}).get("file_path", "unknown")
    with open("./audit.log", "a") as f:
        f.write(f"{datetime.now()}: zmodyfikowano {file_path}\n")
    return {}

async for message in query(
    prompt="Zrefaktoryzuj utils.py",
    options=ClaudeAgentOptions(
        permission_mode="acceptEdits",
        hooks={
            "PostToolUse": [
                HookMatcher(matcher="Edit|Write", hooks=[log_file_change])
            ]
        },
    ),
):
    if hasattr(message, "result"):
        print(message.result)
```

### TypeScript - przykład logowania zmian

```typescript
import { query, HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { appendFile } from "fs/promises";

const logFileChange: HookCallback = async (input) => {
  const filePath = (input as any).tool_input?.file_path ?? "unknown";
  await appendFile("./audit.log", `${new Date().toISOString()}: zmodyfikowano ${filePath}\n`);
  return {};
};

for await (const message of query({
  prompt: "Zrefaktoryzuj utils.py",
  options: {
    permissionMode: "acceptEdits",
    hooks: {
      PostToolUse: [{ matcher: "Edit|Write", hooks: [logFileChange] }]
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

## MCP (Model Context Protocol)

Podłączanie zewnętrznych systemów: baz danych, przeglądarek, API.

```python
# Python - Playwright MCP
async for message in query(
    prompt="Otwórz example.com i opisz co widzisz",
    options=ClaudeAgentOptions(
        mcp_servers={
            "playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}
        }
    ),
):
    if hasattr(message, "result"):
        print(message.result)
```

```typescript
// TypeScript - Playwright MCP
for await (const message of query({
  prompt: "Otwórz example.com i opisz co widzisz",
  options: {
    mcpServers: {
      playwright: { command: "npx", args: ["@playwright/mcp@latest"] }
    }
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

## Uprawnienia (Permissions)

Kontrola dostępu do narzędzi: `bypassPermissions`, `acceptEdits`.

```python
# Agent tylko do odczytu
async for message in query(
    prompt="Przejrzyj kod pod kątem najlepszych praktyk",
    options=ClaudeAgentOptions(
        allowed_tools=["Read", "Glob", "Grep"],
        permission_mode="bypassPermissions"
    ),
):
    if hasattr(message, "result"):
        print(message.result)
```

## Sesje (Sessions)

Utrzymywanie kontekstu między wieloma zapytaniami.

```python
session_id = None

# Pierwsze zapytanie - przechwycenie session_id
async for message in query(
    prompt="Przeczytaj moduł uwierzytelniania",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Glob"]),
):
    if hasattr(message, "subtype") and message.subtype == "init":
        session_id = message.session_id

# Wznowienie z pełnym kontekstem
async for message in query(
    prompt="Teraz znajdź wszystkie miejsca, które go wywołują",
    options=ClaudeAgentOptions(resume=session_id),
):
    if hasattr(message, "result"):
        print(message.result)
```

## Konfiguracja oparta na plikach

Ustaw `setting_sources=["project"]` (Python) / `settingSources: ['project']` (TypeScript).

| Funkcja          | Opis                                    | Lokalizacja                  |
|------------------|-----------------------------------------|------------------------------|
| Skills           | Wyspecjalizowane umiejętności w Markdown | `.claude/skills/SKILL.md`    |
| Slash commands   | Komendy skrótowe                        | `.claude/commands/*.md`      |
| Memory           | Kontekst i instrukcje projektu          | `CLAUDE.md`                  |
| Plugins          | Rozszerzenia programowe                 | opcja `plugins`              |

## Porównanie z innymi narzędziami

- **Agent SDK vs Client SDK** - Client SDK wymaga ręcznej implementacji pętli narzędzi. Agent SDK obsługuje narzędzia autonomicznie.
- **Agent SDK vs CLI** - CLI do interaktywnej pracy, SDK do CI/CD, aplikacji produkcyjnych i automatyzacji.

## Repozytoria i zasoby

- TypeScript SDK: `@anthropic-ai/claude-agent-sdk` (npm)
- Python SDK: `claude-agent-sdk` (PyPI)
- Przykłady agentów: github.com/anthropics/claude-agent-sdk-demos
