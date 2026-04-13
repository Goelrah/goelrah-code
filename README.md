<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="Velora AI" />
</p>

<h1 align="center">Velora AI Studio</h1>

<p align="center">
  <strong>Enterprise-grade private AI assistant. Runs 100% on your machine. Free forever.</strong>
</p>

<p align="center">
  <em>Est. April 2026 · Powered by <a href="https://goelrah.github.io/">Rahul Goel</a></em>
</p>

<p align="center">
  <a href="https://github.com/Goelrah/goelrah-code/releases/latest"><img src="https://img.shields.io/badge/Download-Latest%20Release-0d9488?style=for-the-badge&logo=github" alt="Download" /></a>
  <a href="https://goelrah.github.io/goelrah-code/"><img src="https://img.shields.io/badge/Website-Visit-6366f1?style=for-the-badge" alt="Website" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform" />
  <img src="https://img.shields.io/badge/AI-100%25%20Local-0d9488" alt="Local AI" />
  <img src="https://img.shields.io/badge/cost-$0%20forever-6366f1" alt="Free" />
</p>

---

## Why Velora AI?

| ChatGPT / Claude | Velora AI |
|---|---|
| ☁️ Cloud — your data goes to their servers | 🏠 **100% local** — nothing leaves your machine |
| 💰 $20/month subscription | 🆓 **Free forever** |
| 🔒 Rate limits, usage caps | ♾️ **Unlimited** — no caps, no throttling |
| 🌐 Requires internet | 📴 **Works offline** (after model download) |
| 🏢 Corporate owns your prompts | 🔐 **You own everything** |

## Download

| Platform | Download |
|----------|----------|
| 🍎 macOS | [Velora-AI-Studio.dmg](https://github.com/Goelrah/goelrah-code/releases/latest) |
| 🪟 Windows | [Velora-AI-Studio-Setup.exe](https://github.com/Goelrah/goelrah-code/releases/latest) |
| 🐧 Linux | [Velora-AI-Studio.AppImage](https://github.com/Goelrah/goelrah-code/releases/latest) |

> **First launch?** The built-in setup wizard installs everything for you — Ollama, AI models, all dependencies. Just click through.

## Features

- 💬 **Streaming chat** — responses appear word by word
- 🤖 **Multiple models** — switch between llama3, mistral, gemma, kimi, and more
- 🧠 **Thinking animation** — see the AI reason in real-time
- ⌨️ **Keyboard-first** — Cmd+K command palette, slash commands, shortcuts
- 📝 **27 prompt templates** — code review, testing, debugging, docs, security
- 🌙 **Dark & light mode**
- 🏷️ **Custom agent name** — personalize your assistant
- 💾 **Session history** — conversations saved locally
- 🔌 **VS Code extension** — use Velora AI right in your editor
- 🧙 **Setup wizard** — guided installation, zero terminal knowledge needed

## Quick Start

### Desktop App (Recommended)
1. Download from [Releases](https://github.com/Goelrah/goelrah-code/releases/latest)
2. Open the app → setup wizard guides you
3. Start chatting

### From Source
```bash
git clone https://github.com/Goelrah/goelrah-code.git
cd goelrah-code
./scripts/setup.sh    # macOS/Linux
.\scripts\setup.ps1   # Windows
```

### Browser Only
```bash
OLLAMA_ORIGINS="*" ollama serve   # Terminal 1
npm install && npm run dev         # Terminal 2
```

## How It Works

```
┌─────────────────────────────────┐
│  Your Computer                  │
│                                 │
│  Velora AI ←→ Ollama            │
│  (the UI)     (the AI brain)    │
│                                 │
│  No internet. No cloud.         │
│  No one sees your data.         │
└─────────────────────────────────┘
```

## Tech Stack

Vue 3 · TypeScript · Tailwind CSS · Vite · Electron · Ollama

## License

MIT — use it however you want.

---

<p align="center">
  <strong>Velora AI Studio · Est. April 2026</strong><br/>
  Powered by <a href="https://goelrah.github.io/">Rahul Goel</a> · Independent Consultant · 🇮🇳 Made in India
</p>

<p align="center">⭐ Star this repo if you find it useful!</p>
