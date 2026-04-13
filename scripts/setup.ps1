# ============================================================
# Rahul Goel — AI Studio: Setup Wizard (Windows)
# Run in PowerShell: .\scripts\setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$MODEL = "kimi-k2.5:cloud"

function Write-Header {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║   Rahul Goel — AI Studio Setup Wizard        ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step($num, $total, $msg) {
    Write-Host ""
    Write-Host "  [$num/$total] $msg" -ForegroundColor Green
    Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray
}

function Write-Ok($msg) { Write-Host "    ✓ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    ⚠ $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "    ✗ $msg" -ForegroundColor Red }

$TOTAL = 6

Write-Header
Write-Host "  Detected: Windows $([System.Environment]::OSVersion.Version)" -ForegroundColor Gray

# ─── Step 1: Check Node.js ───
Write-Step 1 $TOTAL "Checking Node.js"

try {
    $nodeVer = node -v 2>$null
    Write-Ok "Node.js $nodeVer found"
} catch {
    Write-Fail "Node.js not found"
    Write-Host "    Download from: https://nodejs.org" -ForegroundColor Yellow
    Write-Host "    Or run: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
    Read-Host "    Press Enter after installing Node.js"
}

# ─── Step 2: Install Ollama ───
Write-Step 2 $TOTAL "Checking Ollama"

$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollamaPath) {
    Write-Ok "Ollama found at $($ollamaPath.Source)"
} else {
    Write-Warn "Ollama not found. Installing..."
    Write-Host "    Download from: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "    Or run: winget install Ollama.Ollama" -ForegroundColor Yellow
    Read-Host "    Press Enter after installing Ollama"
}

# ─── Step 3: Start Ollama ───
Write-Step 3 $TOTAL "Starting Ollama server"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
    Write-Ok "Ollama is running on localhost:11434"
} catch {
    Write-Warn "Ollama not running. Starting..."
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
        Write-Ok "Ollama started"
    } catch {
        Write-Fail "Could not start Ollama. Run 'ollama serve' manually."
        exit 1
    }
}

# ─── Step 4: Pull model ───
Write-Step 4 $TOTAL "Pulling model: $MODEL"

$tags = (Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 5).Content
if ($tags -match $MODEL) {
    Write-Ok "Model $MODEL already available"
} else {
    Write-Host "    Running: ollama pull $MODEL" -ForegroundColor Gray
    Write-Host "    This may take a few minutes..." -ForegroundColor Gray
    & ollama pull $MODEL
    Write-Ok "Model pulled"
}

Write-Host ""
Write-Host "    Available models:" -ForegroundColor Gray
& ollama list

# ─── Step 5: Install dependencies ───
Write-Step 5 $TOTAL "Installing AI Studio dependencies"

if (Test-Path "package.json") {
    Write-Host "    Running: npm install" -ForegroundColor Gray
    & npm install --silent
    Write-Ok "Dependencies installed"
} else {
    Write-Fail "package.json not found. Are you in the project root?"
    exit 1
}

# ─── Step 6: Done ───
Write-Step 6 $TOTAL "Ready to launch!"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Setup complete!                             ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "    To start AI Studio:" -ForegroundColor White
Write-Host "      npm run dev" -ForegroundColor Cyan
Write-Host "      Then open http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "    To start as desktop app:" -ForegroundColor White
Write-Host "      cd electron; npm install; cd .." -ForegroundColor Cyan
Write-Host "      npm run electron:start" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Model: $MODEL" -ForegroundColor Gray
Write-Host "    Endpoint: http://localhost:11434" -ForegroundColor Gray
Write-Host ""

$launch = Read-Host "    Launch AI Studio now? [Y/n]"
if ($launch -ne "n" -and $launch -ne "N") {
    & npm run dev
}
