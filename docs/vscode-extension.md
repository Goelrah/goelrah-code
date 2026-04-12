# Rahul Goel AI Studio — VS Code Extension Architecture

## Overview

Separate project from the web app. Connects to the same Ollama endpoint. Registers `@ai-studio` chat participant with 6 slash commands.

## Architecture

```
VS Code
  └── AI Studio Extension
        ├── Chat Participant (@ai-studio)
        │     ├── /explain — editor selection + file content
        │     ├── /fix — selection + diagnostics
        │     ├── /test — selection or file
        │     ├── /review — selection + diagnostics
        │     ├── /commit — git diff (staged/unstaged)
        │     └── /askRepo — workspace metadata
        ├── Context Collectors
        │     ├── getEditorContext() — file, language, selection
        │     ├── getDiagnostics() — errors/warnings from language server
        │     ├── getWorkspaceContext() — project name, file count, git branch
        │     └── getGitDiff() — staged or unstaged changes
        ├── API Client
        │     ├── streamChat() — NDJSON streaming to Ollama
        │     ├── listModels() — GET /api/tags
        │     └── checkHealth() — connectivity test
        └── Commands
              ├── Set Endpoint URL
              ├── Set Access Code (SecretStorage)
              ├── Check Health
              └── Select Model (QuickPick from endpoint)
```

## Folder Tree

```
vscode-extension/
├── src/
│   ├── extension.ts      — activation, chat participant, commands
│   ├── api-client.ts     — Ollama streaming client
│   ├── commands.ts       — slash command handlers
│   ├── context.ts        — editor/diagnostics/workspace collectors
│   └── types.ts          — TypeScript interfaces
├── package.json          — extension manifest, contributions
├── tsconfig.json
├── .vscodeignore
├── .gitignore
└── README.md
```

## Config Model

| Setting | Type | Default | Stored In |
|---------|------|---------|-----------|
| `aiStudio.endpointUrl` | string | `https://rahulollama.loca.lt` | VS Code settings |
| `aiStudio.model` | string | `llama3` | VS Code settings |
| `aiStudio.systemPrompt` | string | (default prompt) | VS Code settings |
| Access code | string | — | VS Code SecretStorage (encrypted) |

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Token/code in settings.json | Medium | Access code uses SecretStorage, not settings |
| Extension captures sensitive code | Medium | User controls what's sent; no auto-scanning |
| Network errors to endpoint | Medium | Graceful error messages, health check command |
| VS Code Chat API changes | Low | Pin minimum VS Code version 1.90+ |
| Large files sent to model | Low | Selection preferred over full file; truncate at 8KB |

## Packaging

```bash
cd vscode-extension
npm install
npm run build
npm run package
# → rahulgoel-ai-studio-0.1.0.vsix
```

Install: `code --install-extension rahulgoel-ai-studio-0.1.0.vsix`

No marketplace publication needed. Distribute VSIX directly.
