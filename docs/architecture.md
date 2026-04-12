# GOELRAH — Architecture Document (Static Vue App)

## 1. System Overview

GOELRAH is a static single-page application deployed on GitHub Pages. It provides a terminal-style AI coding assistant UI that connects directly from the browser to your private Ollama-compatible endpoint.

```
┌─────────────────────────────────────────────┐
│  GitHub Pages (Static)                      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  GOELRAH SPA (Vue 3 + Vite)          │  │
│  │                                       │  │
│  │  Browser fetch() ──────────────────┐  │  │
│  └───────────────────────────────────┼──┘  │
└──────────────────────────────────────┼──────┘
                                       │ HTTPS
                                       ▼
┌─────────────────────────────────────────────┐
│  Your Private Server                        │
│                                             │
│  ┌────────────┐     ┌───────────────────┐   │
│  │ Caddy/Nginx│────►│ Ollama :11434     │   │
│  │ :443       │     └───────────────────┘   │
│  │ TLS + CORS │                             │
│  │ + Auth     │                             │
│  └────────────┘                             │
└─────────────────────────────────────────────┘
```

## 2. Frontend Architecture

```
src/
├── main.ts              ← App entry, router, global state
├── App.vue              ← Root component, theme provider
├── router/              ← Vue Router (hash mode for GitHub Pages)
├── views/               ← Page-level components
├── components/          ← Reusable UI components
├── composables/         ← Reactive state hooks
├── services/            ← API client, storage
├── types/               ← TypeScript interfaces
├── data/                ← Static prompt library data
└── assets/              ← CSS, fonts
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vue 3 Composition API | Lightweight, reactive, great DX |
| Build | Vite | Fast builds, native ESM, static output |
| Styling | Tailwind CSS | Utility-first, terminal aesthetic |
| Routing | Vue Router (hash mode) | GitHub Pages compatible, no server config |
| State | Composables + reactive() | Simple, no extra dependency |
| Persistence | localStorage | Sessions, settings, preferences |
| Streaming | fetch() + ReadableStream | Native browser API, NDJSON parsing |
| Fonts | JetBrains Mono / system monospace | Terminal aesthetic |

## 3. UI Design Direction — Terminal-Style Interface

The UI follows a dense, dark, terminal-first coding assistant aesthetic:

- Near-black background (#0d0d0d / #1a1a1a)
- Monospace font throughout (JetBrains Mono)
- `>` cursor-style input prompt
- Streaming text that appears token-by-token
- Minimal chrome — no decorative borders, shadows, or gradients
- Compact spacing, high information density
- Left sidebar: session list, minimal navigation
- Main area: full-width chat with code blocks
- Code blocks: syntax highlighted, copy button, language label
- Status indicators: model name, connection status, token count
- Keyboard-first: all actions accessible via keyboard
- No marketing fluff — pure tool interface

### Color Palette
```
Background:     #0d0d0d (primary), #1a1a1a (sidebar/panels)
Surface:        #262626 (cards, inputs)
Border:         #333333
Text primary:   #e5e5e5
Text secondary: #737373
Text muted:     #525252
Accent:         #c084fc (purple, for highlights/links)
Success:        #4ade80
Warning:        #fbbf24
Error:          #f87171
User message:   #e5e5e5 (white text, no bubble)
AI message:     #a3a3a3 (slightly dimmer)
Code bg:        #1e1e1e
```

## 4. Data Flow

### Chat Message Flow
```
User types message
    │
    ▼
ChatInput emits message
    │
    ▼
useChat composable:
  1. Add user message to session
  2. Save to localStorage
  3. Call ollamaClient.chat()
    │
    ▼
ollamaClient:
  1. POST to {endpoint}/api/chat
  2. Parse NDJSON stream via ReadableStream
  3. Yield tokens via callback
    │
    ▼
useChat receives tokens:
  1. Append to assistant message
  2. Trigger reactive update
  3. On done: save complete message to localStorage
```

### Settings Flow
```
User configures in Settings:
  - Endpoint URL → localStorage
  - Model name → localStorage
  - Theme → localStorage + CSS class
  - System prompt → localStorage

ollamaClient reads from settings composable at call time.
No secrets stored. URL is user-visible and user-configured.
```

## 5. What Lives Where

| Concern | Location | Notes |
|---------|----------|-------|
| UI rendering | GitHub Pages (static) | Vue SPA |
| Chat history | Browser localStorage | Per-session, exportable |
| User preferences | Browser localStorage | Theme, model, endpoint |
| AI inference | Your private server | Ollama |
| TLS termination | Your private server | Caddy/Nginx |
| CORS handling | Your private server | Reverse proxy config |
| Authentication | Your private server | Basic auth, token, IP rules |
| Rate limiting | Your private server | Reverse proxy config |
| Secrets | Your private server | Never in frontend |

## 6. GitHub Pages Deployment

- Build: `vite build` → outputs to `dist/`
- Deploy: GitHub Actions pushes `dist/` to `gh-pages` branch
- Routing: Hash mode (`/#/chat`) — no server-side routing needed
- Base path: Configured in `vite.config.ts` to match repo name
- Custom domain: Optional, configured in GitHub repo settings
