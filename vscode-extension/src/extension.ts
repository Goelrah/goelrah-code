import * as vscode from 'vscode';
import { ApiClient } from './api-client';
import { handleSlashCommand } from './commands';

let client: ApiClient;

function getConfig() {
  const cfg = vscode.workspace.getConfiguration('aiStudio');
  return {
    endpoint: cfg.get<string>('endpointUrl') ?? 'https://rahulollama.loca.lt',
    model: cfg.get<string>('model') ?? 'kimi-k2.5:cloud',
    systemPrompt: cfg.get<string>('systemPrompt') ?? '',
  };
}

export function activate(context: vscode.ExtensionContext) {
  const cfg = getConfig();
  client = new ApiClient(cfg.endpoint);

  // Re-read config on change
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('aiStudio')) {
      const c = getConfig();
      client.setEndpoint(c.endpoint);
    }
  });

  // --- Chat Participant ---
  const participant = vscode.chat.createChatParticipant('ai-studio', async (request, chatContext, response, token) => {
    const cfg = getConfig();
    client.setEndpoint(cfg.endpoint);

    let systemPrompt = cfg.systemPrompt;
    let userMessage = request.prompt;

    // Handle slash commands
    if (request.command) {
      const result = await handleSlashCommand(request.command, request.prompt);
      systemPrompt = result.systemPrompt || systemPrompt;
      userMessage = result.userMessage;
    }

    // Build messages from chat history
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });

    for (const turn of chatContext.history) {
      if (turn instanceof vscode.ChatRequestTurn) {
        messages.push({ role: 'user', content: turn.prompt });
      } else if (turn instanceof vscode.ChatResponseTurn) {
        const parts = turn.response.map((p) => {
          if (p instanceof vscode.ChatResponseMarkdownPart) return p.value.value;
          return '';
        });
        messages.push({ role: 'assistant', content: parts.join('') });
      }
    }

    messages.push({ role: 'user', content: userMessage });

    // Stream response
    const controller = new AbortController();
    token.onCancellationRequested(() => controller.abort());

    try {
      for await (const chunk of client.streamChat(
        { model: cfg.model, messages, stream: true },
        controller.signal,
      )) {
        response.markdown(chunk);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      response.markdown(`\n\n**Error:** ${(err as Error).message}`);
    }
  });

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icon.png');
  context.subscriptions.push(participant);

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand('aiStudio.setEndpoint', async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Enter your Ollama endpoint URL',
        value: getConfig().endpoint,
        placeHolder: 'https://your-server.com',
      });
      if (url) {
        await vscode.workspace.getConfiguration('aiStudio').update('endpointUrl', url, true);
        vscode.window.showInformationMessage(`AI Studio: Endpoint set to ${url}`);
      }
    }),

    vscode.commands.registerCommand('aiStudio.setAccessCode', async () => {
      const code = await vscode.window.showInputBox({
        prompt: 'Enter access code (stored in VS Code SecretStorage)',
        password: true,
      });
      if (code) {
        await context.secrets.store('aiStudio.accessCode', code);
        vscode.window.showInformationMessage('AI Studio: Access code saved securely.');
      }
    }),

    vscode.commands.registerCommand('aiStudio.checkHealth', async () => {
      const cfg = getConfig();
      client.setEndpoint(cfg.endpoint);
      const h = await client.checkHealth();
      if (h.ok) {
        vscode.window.showInformationMessage(`AI Studio: Connected ✓ — ${h.models} models, ${h.latency}ms`);
      } else {
        vscode.window.showErrorMessage(`AI Studio: ${h.error}`);
      }
    }),

    vscode.commands.registerCommand('aiStudio.selectModel', async () => {
      const cfg = getConfig();
      client.setEndpoint(cfg.endpoint);
      try {
        const models = await client.listModels();
        const pick = await vscode.window.showQuickPick(
          models.map((m) => ({ label: m.name, description: `${(m.size / 1e9).toFixed(1)}GB` })),
          { placeHolder: 'Select a model' },
        );
        if (pick) {
          await vscode.workspace.getConfiguration('aiStudio').update('model', pick.label, true);
          vscode.window.showInformationMessage(`AI Studio: Model set to ${pick.label}`);
        }
      } catch (err) {
        vscode.window.showErrorMessage(`AI Studio: Could not fetch models — ${(err as Error).message}`);
      }
    }),
  );
}

export function deactivate() {}
