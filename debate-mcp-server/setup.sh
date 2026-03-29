#!/bin/bash
# Debate MCP Server - automatyczny setup
# Uruchom: bash debate-mcp-server/setup.sh (z katalogu Biurko-Mac-mini-claude)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MCP_CONFIG="$HOME/.claude/.mcp.json"
KEYS_FILE="$HOME/.claude/debate-mcp-keys.json"
DIST_PATH="$SCRIPT_DIR/dist/index.js"

echo "=== Debate MCP Server Setup ==="
echo ""

# 1. Node.js check
if ! command -v node &> /dev/null; then
    echo "[!] Node.js nie znaleziony. Instaluję przez brew..."
    if ! command -v brew &> /dev/null; then
        echo "[ERROR] Homebrew nie zainstalowany. Zainstaluj: https://brew.sh"
        exit 1
    fi
    brew install node
    echo "[OK] Node.js zainstalowany: $(node --version)"
else
    echo "[OK] Node.js: $(node --version)"
fi

# 2. npm install
echo ""
echo "[...] npm install..."
cd "$SCRIPT_DIR"
npm install
echo "[OK] Dependencies zainstalowane"

# 3. Build TypeScript
echo ""
echo "[...] npm run build..."
npm run build
echo "[OK] TypeScript skompilowany do dist/"

# 4. Konfiguracja MCP
echo ""

# Sprawdz plik z kluczami
if [ ! -f "$KEYS_FILE" ]; then
    echo "[!] Brak pliku z kluczami API: $KEYS_FILE"
    echo ""
    echo "    Skopiuj plik debate-mcp-keys.json z MacBook Air:"
    echo "    Na Air: cat ~/.claude/debate-mcp-keys.json"
    echo "    Na Mini: nano ~/.claude/debate-mcp-keys.json (wklej i zapisz)"
    echo ""
    echo "    Albo skopiuj z USB (jesli robiles backup)."
    echo "    Potem uruchom ten skrypt ponownie."
    echo ""

    # Stworz szablon
    cat > "$KEYS_FILE.template" <<'TMPL'
{
  "command": "node",
  "args": ["__DIST_PATH__"],
  "env": {
    "GEMINI_API_KEY": "WKLEJ_TUTAJ",
    "OPENAI_API_KEY": "WKLEJ_TUTAJ",
    "MOONSHOT_API_KEY": "WKLEJ_TUTAJ",
    "XAI_API_KEY": "WKLEJ_TUTAJ",
    "DEEPSEEK_API_KEY": "WKLEJ_TUTAJ",
    "PERPLEXITY_API_KEY": "WKLEJ_TUTAJ"
  }
}
TMPL
    sed -i '' "s|__DIST_PATH__|$DIST_PATH|" "$KEYS_FILE.template"
    echo "    Szablon: $KEYS_FILE.template"
    echo "    Wypelnij go i zmien nazwe na debate-mcp-keys.json"
    exit 1
fi

echo "[OK] Plik z kluczami: $KEYS_FILE"

# Popraw path w klucze do aktualnego dist
python3 -c "
import json
with open('$KEYS_FILE') as f:
    keys = json.load(f)
keys['args'] = ['$DIST_PATH']
with open('$KEYS_FILE', 'w') as f:
    json.dump(keys, f, indent=2)
"

# Dodaj do ~/.claude/.mcp.json
if [ -f "$MCP_CONFIG" ]; then
    python3 -c "
import json
with open('$MCP_CONFIG') as f:
    config = json.load(f)
with open('$KEYS_FILE') as f:
    debate = json.load(f)
if 'mcpServers' not in config:
    config['mcpServers'] = {}
config['mcpServers']['debate'] = debate
with open('$MCP_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
print('[OK] Debate MCP dodany do ~/.claude/.mcp.json')
"
else
    mkdir -p "$(dirname "$MCP_CONFIG")"
    python3 -c "
import json
with open('$KEYS_FILE') as f:
    debate = json.load(f)
config = {'mcpServers': {'debate': debate}}
with open('$MCP_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)
print('[OK] Utworzono ~/.claude/.mcp.json z Debate MCP')
"
fi

# 5. Test
echo ""
if [ -f "$DIST_PATH" ]; then
    echo "[OK] dist/index.js gotowy"
else
    echo "[ERROR] dist/index.js nie istnieje"
    exit 1
fi

echo ""
echo "=== GOTOWE ==="
echo ""
echo "Teraz:"
echo "  1. Zrestartuj Claude Code (zamknij i otworz ponownie)"
echo "  2. Wpisz: /debata-ai status"
echo "  3. Powinien zwrocic liste modeli"
echo ""
