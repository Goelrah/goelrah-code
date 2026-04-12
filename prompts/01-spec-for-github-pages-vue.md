# 01 - Spec for GitHub Pages Vue app

```text
You are my principal software architect, frontend engineer, product designer, and deployment engineer.

I want you to create an original AI coding assistant web app called GOELRAH that is optimized specifically for static hosting on GitHub Pages using GitHub Actions.

IMPORTANT CONSTRAINTS:
- The website must be static-host friendly.
- Prefer Vue 3 + Vite + TypeScript.
- Deployment target is GitHub Pages only.
- Do not design this as a full-stack Next.js app.
- Do not rely on server-side code inside GitHub Pages.
- Do not rely on hidden secrets inside the frontend.
- Any real security must live on my own private server or reverse proxy.
- The UI should be original and inspired by premium AI coding assistant UX patterns, but not a deceptive clone of Claude Code.

PROJECT GOAL:
Create a premium static frontend that connects to my private Ollama-compatible endpoint.
Also plan a separate Phase 2 private VS Code extension that uses the same backend endpoint.

BRANDING:
- Product: GOELRAH
- Name to show in app: Rahul Goel
- Branding line: Powered by Rahul Goel - Independent Consultant
- Add tasteful watermark/branding in footer, settings, login gate, and empty states

PHASE 1 WEBSITE SCOPE:
Build a static Vue app with:
1. landing page
2. lightweight access gate screen (optional soft client-side passcode only if clearly marked as not real security)
3. main chat workspace UI
4. sessions/history sidebar using local state or browser storage if needed
5. settings panel for endpoint URL, model name, and UI options
6. prompt library page
7. about/help page
8. health/status panel that checks endpoint reachability from the browser

FEATURE REQUIREMENTS:
- streaming chat UI if browser-to-server streaming is possible
- configurable endpoint URL
- configurable model name
- original premium developer-tool UI
- dark and light mode
- keyboard shortcuts
- slash command UX
- command palette UX
- chat export/copy
- local persistence for non-sensitive preferences
- empty states and loading states
- endpoint status and error states

BACKEND ASSUMPTION:
My private server will host Ollama or a small proxy.
The frontend should call that server directly from the browser.
Design for:
- configurable base URL
- CORS awareness
- network failure handling
- timeout handling on the client
- no embedded secrets

SECURITY RULES:
- Explain clearly that GitHub Pages cannot securely hide secrets in frontend code.
- If a passcode gate is included, label it as a soft client-side gate only.
- Recommend true protection on my own server using reverse proxy auth, TLS, IP rules, or token validation.
- Keep the website architecture static and simple.

PHASE 2 VS CODE EXTENSION:
Create a separate plan and scaffold for a private VS Code extension that connects to the same backend.
Do not merge this into the GitHub Pages app architecture.

DELIVERABLES:
1. architecture overview
2. assumptions
3. tradeoffs
4. folder tree
5. phased build plan
6. deployment plan for GitHub Pages
7. server requirements for Ollama endpoint

NOW START:
First output:
- architecture overview
- constraints summary
- assumptions
- risks
- folder tree
- build phases
Then wait for approval.
```
