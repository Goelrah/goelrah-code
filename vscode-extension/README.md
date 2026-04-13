# Velora AI — VS Code Extension

Enterprise-grade private AI coding assistant for VS Code. Connects to your local Ollama endpoint.

**Powered by [Rahul Goel](https://goelrah.github.io/) · Est. April 2026**

## Usage

Type `@velora` in VS Code chat to start a conversation.

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/explain` | Explain selected code or active file |
| `/fix` | Fix errors using selection + diagnostics |
| `/test` | Generate unit tests |
| `/review` | Code review for correctness, security, performance |
| `/commit` | Generate commit message from git diff |
| `/askRepo` | Ask questions about the workspace |

## Commands

- `Velora AI: Set Endpoint URL` — configure your Ollama server
- `Velora AI: Set Access Code` — store auth securely
- `Velora AI: Check Endpoint Health` — verify connectivity
- `Velora AI: Select Model` — pick from available models

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `velora.endpointUrl` | `http://localhost:11434` | Ollama endpoint |
| `velora.model` | `kimi-k2.5:cloud` | Default model |
| `velora.systemPrompt` | (coding assistant) | System prompt |

## Install

```bash
cd vscode-extension
npm install
npm run build
npm run package
# Produces velora-ai-0.1.0.vsix
code --install-extension velora-ai-0.1.0.vsix
```

## Prerequisites

- Ollama running locally: `OLLAMA_ORIGINS="*" ollama serve`
- At least one model pulled: `ollama pull kimi-k2.5:cloud`

## Security

- Access code stored in VS Code SecretStorage (encrypted)
- No secrets in extension source code
- Private VSIX distribution — no marketplace needed
