# GOELRAH — Product Requirements Document (Static Vue App)

## 1. Product Summary

GOELRAH is a static web-based AI coding assistant with a terminal-style interface, deployed on GitHub Pages. It connects to a user-configured private Ollama endpoint for LLM inference.

**Brand:** GOELRAH | **Owner:** Rahul Goel — Independent Consultant

## 2. User Stories

### Access & Navigation
| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a user, I want a landing page that introduces GOELRAH | P0 |
| US-02 | As a user, I want an optional soft access gate with clear "not real security" warning | P1 |
| US-03 | As a user, I want a terminal-style app shell with sidebar and chat area | P0 |

### Chat & AI
| ID | Story | Priority |
|----|-------|----------|
| US-04 | As a user, I want to type messages in a `>` prompt and see streaming AI responses | P0 |
| US-05 | As a user, I want to configure which Ollama endpoint and model to use | P0 |
| US-06 | As a user, I want to stop a streaming response mid-generation | P0 |
| US-07 | As a user, I want to see code blocks with syntax highlighting and copy buttons | P0 |
| US-08 | As a user, I want to set a system prompt for my conversation | P1 |
| US-09 | As a user, I want to retry a failed message | P1 |
| US-10 | As a user, I want to copy/export entire conversations | P1 |

### Sessions
| ID | Story | Priority |
|----|-------|----------|
| US-11 | As a user, I want to create new chat sessions | P0 |
| US-12 | As a user, I want to see my session history in the sidebar | P0 |
| US-13 | As a user, I want to rename and delete sessions | P1 |
| US-14 | As a user, I want sessions persisted in localStorage | P0 |

### Settings & Config
| ID | Story | Priority |
|----|-------|----------|
| US-15 | As a user, I want to configure endpoint URL in settings | P0 |
| US-16 | As a user, I want to select/change the model | P0 |
| US-17 | As a user, I want dark and light mode (dark default) | P0 |
| US-18 | As a user, I want to test endpoint connectivity from the UI | P1 |

### UX
| ID | Story | Priority |
|----|-------|----------|
| US-19 | As a user, I want a command palette (Cmd+K) | P1 |
| US-20 | As a user, I want slash commands in the input | P1 |
| US-21 | As a user, I want keyboard shortcuts for common actions | P1 |
| US-22 | As a user, I want loading/streaming indicators | P0 |
| US-23 | As a user, I want clear error states when the endpoint is unreachable | P0 |
| US-24 | As a user, I want a prompt library to browse and use templates | P1 |

## 3. Acceptance Criteria

### AC-01: Chat Streaming
- When user sends a message, the app POSTs to `{endpoint}/api/chat` with streaming enabled.
- Tokens appear in the UI as they arrive with < 100ms perceived latency per chunk.
- When the endpoint is unreachable, a clear error message is shown with retry option.
- When user clicks stop, the fetch is aborted and partial response is preserved.

### AC-02: Endpoint Configuration
- User can set endpoint URL and model name in settings.
- Settings are persisted in localStorage.
- A "Test Connection" button verifies the endpoint and shows model count.
- No secrets are stored or required in the frontend.

### AC-03: Sessions
- Sessions are stored in localStorage with UUID, title, messages, timestamps.
- Sidebar shows session list sorted by most recent.
- User can create, rename, delete, and switch sessions.
- Auto-title is generated from first user message.

### AC-04: Terminal UI
- Dark background (#0d0d0d), monospace font throughout.
- Input area uses `>` prompt character.
- Messages render as plain text / markdown with code blocks.
- Code blocks have language label, copy button, dark background.
- No decorative UI elements — pure terminal aesthetic.
- Compact spacing, high density.

### AC-05: GitHub Pages Deployment
- `vite build` produces static files in `dist/`.
- GitHub Actions workflow builds and deploys to GitHub Pages.
- Hash-mode routing works without server configuration.
- Base path is configurable for project pages.

### AC-06: Soft Access Gate
- Optional passcode screen stored in localStorage.
- Bold warning: "This is a client-side gate only. It does not provide real security. Protect your endpoint on your server."
- Can be disabled in settings.

## 4. Views & Routes

| Route | View | Description |
|-------|------|-------------|
| `#/` | Landing | Intro page with branding |
| `#/gate` | Gate | Optional soft passcode screen |
| `#/chat` | Chat | Main chat workspace |
| `#/chat/:id` | Chat | Chat with specific session |
| `#/prompts` | Prompts | Prompt library browser |
| `#/settings` | Settings | Endpoint, model, theme config |
| `#/health` | Health | Endpoint status and diagnostics |
| `#/about` | About | Help, branding, credits |

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| First paint | < 1s (static site) |
| Bundle size | < 500KB gzipped |
| Streaming first token | < 500ms (network dependent) |
| Browser support | Chrome, Firefox, Safari (latest 2) |
| Accessibility | Keyboard navigable, focus visible, ARIA labels |
| Offline | Settings/sessions available; chat requires endpoint |
