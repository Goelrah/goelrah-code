# Rahul Goel — AI Studio (VS Code Extension)

Private AI coding assistant extension that connects to your Ollama endpoint.

## Chat Participant

Type `@ai-studio` in VS Code chat to start a conversation.

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

- `AI Studio: Set Endpoint URL` — configure your Ollama server
- `AI Studio: Set Access Code` — store auth securely
- `AI Studio: Check Endpoint Health` — verify connectivity
- `AI Studio: Select Model` — pick from available models

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `aiStudio.endpointUrl` | `https://rahulollama.loca.lt` | Ollama endpoint |
| `aiStudio.model` | `llama3` | Default model |
| `aiStudio.systemPrompt` | (coding assistant) | System prompt |

## Install

```bash
cd vscode-extension
npm install
npm run build
npm run package
# Produces rahulgoel-ai-studio-0.1.0.vsix
code --install-extension rahulgoel-ai-studio-0.1.0.vsix
```

## Security

- Access code stored in VS Code SecretStorage (encrypted)
- Endpoint URL in settings (not a secret)
- No secrets in extension source code
- Private VSIX distribution — no marketplace needed
