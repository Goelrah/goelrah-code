# Rahul Goel — AI Studio

Private AI coding assistant deployed on GitHub Pages, connecting to your own Ollama endpoint.

**Powered by Rahul Goel — Independent Consultant**

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 — configure your endpoint in Settings.

## Deploy

Push to `main` → GitHub Actions builds and deploys to Pages automatically.

Set Pages source to "GitHub Actions" in repo Settings.

## Stack

- Vue 3 + Vite + TypeScript + Tailwind CSS
- Static SPA on GitHub Pages
- Browser → Ollama streaming (NDJSON)
- localStorage for sessions/preferences
- Obfuscated production build (terser + lightningcss)

## Docs

- [Architecture](docs/architecture.md)
- [PRD](docs/prd.md)
- [Deployment](docs/deployment.md)
- [Server Setup](docs/server-setup.md)
- [Ollama Integration](docs/ollama-integration.md)
- [Prompt Library](docs/prompt-library.md)
- [VS Code Extension](docs/vscode-extension.md)
