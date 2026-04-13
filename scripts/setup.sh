#!/bin/bash
# ============================================================
# Rahul Goel — AI Studio: Setup Wizard
# Detects your OS and walks you through everything step by step
# ============================================================

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

MODEL="kimi-k2.5:cloud"

print_header() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   ${BOLD}Rahul Goel — AI Studio Setup Wizard${NC}${CYAN}        ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
  echo ""
}

print_step() {
  echo -e "\n${BOLD}${GREEN}[$1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"
  echo -e "${CYAN}─────────────────────────────────────${NC}"
}

print_ok() {
  echo -e "  ${GREEN}✓${NC} $1"
}

print_warn() {
  echo -e "  ${YELLOW}⚠${NC} $1"
}

print_fail() {
  echo -e "  ${RED}✗${NC} $1"
}

detect_os() {
  case "$(uname -s)" in
    Darwin*) OS="mac" ;;
    Linux*)  OS="linux" ;;
    *)       OS="unknown" ;;
  esac
  echo -e "  Detected: ${BOLD}$(uname -s) $(uname -m)${NC}"
}

TOTAL_STEPS=6

# ─── Start ───
print_header
detect_os

if [ "$OS" = "unknown" ]; then
  print_fail "Unsupported OS. This wizard supports macOS and Linux."
  echo "  For Windows, see SETUP.md for manual instructions."
  exit 1
fi

# ─── Step 1: Check Node.js ───
print_step 1 "Checking Node.js"

if command -v node &> /dev/null; then
  NODE_VER=$(node -v)
  print_ok "Node.js $NODE_VER found"
else
  print_fail "Node.js not found"
  if [ "$OS" = "mac" ]; then
    echo "  Install with: brew install node"
    echo "  Or download from: https://nodejs.org"
  else
    echo "  Install with: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
  fi
  echo ""
  read -p "  Press Enter after installing Node.js, or Ctrl+C to exit..."
fi

# ─── Step 2: Install Ollama ───
print_step 2 "Installing Ollama"

if command -v ollama &> /dev/null; then
  print_ok "Ollama already installed: $(ollama --version 2>/dev/null || echo 'version unknown')"
else
  print_warn "Ollama not found. Installing..."
  if [ "$OS" = "mac" ]; then
    if command -v brew &> /dev/null; then
      echo "  Running: brew install ollama"
      brew install ollama
    else
      echo "  Download from: https://ollama.com/download/mac"
      echo "  Or install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
      read -p "  Press Enter after installing Ollama..."
    fi
  else
    echo "  Running: curl -fsSL https://ollama.com/install.sh | sh"
    curl -fsSL https://ollama.com/install.sh | sh
  fi
fi

# ─── Step 3: Start Ollama ───
print_step 3 "Starting Ollama server"

if curl -s --max-time 3 http://localhost:11434/api/tags > /dev/null 2>&1; then
  print_ok "Ollama is already running on localhost:11434"
else
  print_warn "Ollama not running. Starting in background..."
  OLLAMA_ORIGINS="*" ollama serve &> /dev/null &
  OLLAMA_PID=$!
  sleep 3

  if curl -s --max-time 3 http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_ok "Ollama started (PID: $OLLAMA_PID)"
  else
    print_fail "Could not start Ollama. Try running 'ollama serve' manually."
    exit 1
  fi
fi

# ─── Step 4: Pull model ───
print_step 4 "Pulling model: $MODEL"

MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null)
if echo "$MODELS" | grep -q "$MODEL"; then
  print_ok "Model $MODEL already available"
else
  echo "  Running: ollama pull $MODEL"
  echo "  This may take a few minutes depending on your connection..."
  echo ""
  ollama pull "$MODEL"
  print_ok "Model $MODEL pulled successfully"
fi

echo ""
echo "  Available models:"
curl -s http://localhost:11434/api/tags | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for m in data.get('models', []):
        size = m.get('size', 0)
        if size > 1e9:
            size_str = f'{size/1e9:.1f}GB'
        elif size > 1e6:
            size_str = f'{size/1e6:.0f}MB'
        else:
            size_str = 'cloud'
        print(f'    • {m[\"name\"]:30s} {size_str}')
except:
    print('    (could not parse model list)')
" 2>/dev/null || echo "    (python3 not available for formatting)"

# ─── Step 5: Install app dependencies ───
print_step 5 "Installing AI Studio dependencies"

if [ -f "package.json" ]; then
  echo "  Running: npm install"
  npm install --silent
  print_ok "Dependencies installed"
else
  print_fail "package.json not found. Are you in the project root?"
  exit 1
fi

# ─── Step 6: Launch ───
print_step 6 "Ready to launch!"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ${BOLD}Setup complete!${NC}${GREEN}                             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}To start AI Studio:${NC}"
echo -e "    ${CYAN}npm run dev${NC}"
echo -e "    Then open ${BOLD}http://localhost:5173${NC}"
echo ""
echo -e "  ${BOLD}To start as desktop app:${NC}"
echo -e "    ${CYAN}cd electron && npm install && cd ..${NC}"
echo -e "    ${CYAN}npm run electron:start${NC}"
echo ""
echo -e "  ${BOLD}Model:${NC} $MODEL"
echo -e "  ${BOLD}Endpoint:${NC} http://localhost:11434"
echo ""
echo -e "  ${YELLOW}Tip:${NC} Keep 'ollama serve' running in a separate terminal."
echo ""

read -p "  Launch AI Studio now? [Y/n] " LAUNCH
if [ "$LAUNCH" != "n" ] && [ "$LAUNCH" != "N" ]; then
  echo ""
  echo -e "  Starting dev server..."
  npm run dev
fi
