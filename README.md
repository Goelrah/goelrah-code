<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="AI Studio" />
</p>

<h1 align="center">Rahul Goel — AI Studio</h1>

<p align="center">
  <strong>Your own private ChatGPT. Runs 100% on your machine. Free forever.</strong>
</p>

<p align="center">
  <a href="https://github.com/goelrah/goelrah-code/releases/latest"><img src="https://img.shields.io/badge/Download-Latest%20Release-da7756?style=for-the-badge&logo=github" alt="Download" /></a>
  <a href="https://goelrah.github.io/goelrah-code/"><img src="https://img.shields.io/badge/Live%20Demo-Try%20Now-2d8a56?style=for-the-badge" alt="Demo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform" />
  <img src="https://img.shields.io/badge/AI-100%25%20Local-green" alt="Local AI" />
  <img src="https://img.shields.io/badge/cost-$0%20forever-orange" alt="Free" />
</p>

---

## Why AI Studio?

| ChatGPT / Claude | AI Studio |
|---|---|
| ☁️ Cloud — your data goes to their servers | 🏠 **100% local** — nothing leaves your machine |
| 💰 $20/month subscription | 🆓 **Free forever** |
| 🔒 Rate limits, usage caps | ♾️ **Unlimited** — no caps, no throttling |
| 🌐 Requires internet | 📴 **Works offline** (after model download) |
| 🏢 Corporate owns your prompts | 🔐 **You own everything** |

## Download

| Platform | Download | Size |
|----------|----------|------|
| 🍎 macOS | [AI-Studio.dmg](https://github.com/goelrah/goelrah-code/releases/latest) | ~80MB |
| 🪟 Windows | [AI-Studio-Setup.exe](https://github.com/goelrah/goelrah-code/releases/latest) | ~80MB |
| 🐧 Linux | [AI-Studio.AppImage](https://github.com/goelrah/goelrah-code/releases/latest) | ~80MB |

> **First launch?** The built-in setup wizard installs everything for you — Ollama, AI models, all dependencies. Just click through.

## Screenshots

<p align="center">
  <img src="docs/screenshots/chat.png" width="700" alt="Chat Interface" />
</p>

<details>
<summary>More screenshots</summary>

| Setup Wizard | Model Selector | Dark Mode |
|---|---|---|
| <img src="docs/screenshots/wizard.png" width="250" /> | <img src="docs/screenshots/models.png" width="250" /> | <img src="docs/screenshots/dark.png" width="250" /> |

</details>

## Features

- 💬 **Streaming chat** — responses appear word by word, just like ChatGPT
- 🤖 **Multiple models** — switch between llama3, mistral, gemma, kimi, and more
- 🎨 **Beautiful UI** — clean, warm design inspired by the best AI tools
- ⌨️ **Keyboard-first** — Cmd+K command palette, slash commands, shortcuts
- 📝 **27 prompt templates** — code review, testing, debugging, docs, security
- 🌙 **Dark & light mode**
- 💾 **Session history** — conversations saved locally, never lost
- 📤 **Export chats** — download as markdown
- 🔌 **VS Code extension** — use AI Studio right in your editor
- 🧙 **Setup wizard** — guided installation, zero terminal knowledge needed

## Quick Start (2 minutes)

### Option A: Desktop App (Recommended)
1. Download from [Releases](https://github.com/goelrah/goelrah-code/releases/latest)
2. Open the app
3. Follow the setup wizard — it handles everything
4. Start chatting

### Option B: Run from Source
```bash
git clone https://github.com/goelrah/goelrah-code.git
cd goelrah-code
./scripts/setup.sh    # macOS/Linux
# or
.\scripts\setup.ps1   # Windows PowerShell
```

### Option C: Browser Only
```bash
npm install && npm run dev
```
Open http://localhost:5173 (requires Ollama running separately)

## How It Works

```
┌─────────────────────────────────┐
│  Your Computer                  │
│                                 │
│  AI Studio ←→ Ollama            │
│  (the UI)     (the AI brain)    │
│                                 │
│  No internet. No cloud.         │
│  No one sees your data.         │
└─────────────────────────────────┘
```

AI Studio is just a beautiful frontend. [Ollama](https://ollama.com) runs the AI models locally on your CPU/GPU. The setup wizard installs both automatically.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command palette |
| `⌘N` | New chat |
| `⌘B` | Toggle sidebar |
| `⌘J` | Toggle theme |
| `/` | Focus input |

## Slash Commands

| Command | Action |
|---------|--------|
| `/clear` | Clear conversation |
| `/model llama3` | Switch model |
| `/export` | Download chat |
| `/new` | New session |

## Recommended Models

```bash
ollama pull kimi-k2.5:cloud    # Smart, cloud-connected
ollama pull llama3.1:8b         # Fast, local, 8B params
ollama pull qwen2.5-coder:3b   # Tiny, great for code
ollama pull mistral             # Balanced 7B
```

## Tech Stack

Vue 3 · TypeScript · Tailwind CSS · Vite · Electron · Ollama

## Contributing

PRs welcome! See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details.

## License

MIT — use it however you want.

---

<p align="center">
  <strong>Built by <a href="https://github.com/goelrah">Rahul Goel</a></strong><br/>
  Independent Consultant
</p>

<p align="center">
  ⭐ Star this repo if you find it useful!
</p>
