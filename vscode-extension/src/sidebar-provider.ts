import * as vscode from 'vscode';
import { ApiClient } from './api-client';

export class VeloraSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'velora.chatView';
  private _view?: vscode.WebviewView;
  private client: ApiClient;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly secrets: vscode.SecretStorage,
  ) {
    const cfg = vscode.workspace.getConfiguration('velora');
    this.client = new ApiClient(cfg.get('endpointUrl') ?? 'http://localhost:11434');
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      const cfg = vscode.workspace.getConfiguration('velora');
      this.client.setEndpoint(cfg.get('endpointUrl') ?? 'http://localhost:11434');
      const model = cfg.get<string>('model') ?? 'kimi-k2.5:cloud';
      const systemPrompt = cfg.get<string>('systemPrompt') ?? '';

      if (msg.type === 'send') {
        const messages: Array<{ role: string; content: string }> = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        if (msg.history) {
          for (const m of msg.history) {
            messages.push({ role: m.role, content: m.content });
          }
        }
        messages.push({ role: 'user', content: msg.text });

        try {
          let full = '';
          for await (const chunk of this.client.streamChat({ model, messages, stream: true })) {
            full += chunk;
            webviewView.webview.postMessage({ type: 'token', content: full });
          }
          webviewView.webview.postMessage({ type: 'done', content: full });
        } catch (err) {
          webviewView.webview.postMessage({ type: 'error', content: (err as Error).message });
        }
      }

      if (msg.type === 'getModels') {
        try {
          const models = await this.client.listModels();
          webviewView.webview.postMessage({ type: 'models', models: models.map(m => m.name) });
        } catch {
          webviewView.webview.postMessage({ type: 'models', models: [] });
        }
      }
    });
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--vscode-font-family);font-size:13px;color:var(--vscode-foreground);background:var(--vscode-sideBar-background);display:flex;flex-direction:column;height:100vh;overflow:hidden}
.header{padding:10px 12px;border-bottom:1px solid var(--vscode-panel-border);display:flex;align-items:center;gap:8px;flex-shrink:0}
.header .logo{width:20px;height:20px;background:linear-gradient(135deg,#0d9488,#6366f1);border-radius:5px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700}
.header .title{font-size:12px;font-weight:600}
.header .powered{font-size:10px;color:var(--vscode-descriptionForeground);margin-left:auto}
.messages{flex:1;overflow-y:auto;padding:8px 12px}
.msg{margin-bottom:10px}
.msg .role{font-size:11px;font-weight:600;margin-bottom:2px;color:var(--vscode-descriptionForeground)}
.msg .role.user{color:var(--vscode-textLink-foreground)}
.msg .role.assistant{color:#0d9488}
.msg .text{font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
.msg .text code{background:var(--vscode-textCodeBlock-background);padding:1px 4px;border-radius:3px;font-family:var(--vscode-editor-font-family);font-size:12px}
.msg .text pre{background:var(--vscode-textCodeBlock-background);padding:8px;border-radius:6px;margin:6px 0;overflow-x:auto}
.msg .text pre code{background:none;padding:0}
.thinking{font-size:11px;color:var(--vscode-descriptionForeground);font-style:italic;padding:4px 0}
.thinking .dots{display:inline-flex;gap:2px}
.thinking .dots span{width:4px;height:4px;border-radius:50%;background:#0d9488;animation:bounce 1.4s ease-in-out infinite}
.thinking .dots span:nth-child(2){animation-delay:0.2s}
.thinking .dots span:nth-child(3){animation-delay:0.4s}
@keyframes bounce{0%,80%,100%{opacity:0.3}40%{opacity:1}}
.error{color:var(--vscode-errorForeground);font-size:12px;padding:6px 0}
.input-area{border-top:1px solid var(--vscode-panel-border);padding:8px;flex-shrink:0}
.input-row{display:flex;gap:6px;align-items:flex-end}
textarea{flex:1;resize:none;border:1px solid var(--vscode-input-border);background:var(--vscode-input-background);color:var(--vscode-input-foreground);border-radius:6px;padding:6px 8px;font-family:var(--vscode-font-family);font-size:13px;min-height:32px;max-height:120px;outline:none}
textarea:focus{border-color:var(--vscode-focusBorder)}
button{background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-weight:500;white-space:nowrap}
button:hover{background:var(--vscode-button-hoverBackground)}
button:disabled{opacity:0.5;cursor:default}
button.ghost{background:transparent;color:var(--vscode-foreground);border:1px solid var(--vscode-input-border)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:20px;color:var(--vscode-descriptionForeground)}
.empty .icon{width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:700;margin-bottom:12px}
.empty h3{font-size:14px;color:var(--vscode-foreground);margin-bottom:4px}
.empty p{font-size:12px;line-height:1.5}
</style>
</head>
<body>
<div class="header">
  <div class="logo">V</div>
  <span class="title">Velora AI</span>
  <span class="powered">by Rahul Goel</span>
</div>

<div class="messages" id="messages">
  <div class="empty" id="empty">
    <div class="icon">V</div>
    <h3>Velora AI</h3>
    <p>Ask anything about your code.<br>Powered by local Ollama.</p>
  </div>
</div>

<div class="input-area">
  <div class="input-row">
    <textarea id="input" rows="1" placeholder="Ask Velora AI..." autofocus></textarea>
    <button id="sendBtn" onclick="send()">Send</button>
  </div>
</div>

<script>
const vscode = acquireVsCodeApi();
const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const emptyEl = document.getElementById('empty');
let history = [];
let streaming = false;

function send() {
  const text = inputEl.value.trim();
  if (!text || streaming) return;
  inputEl.value = '';
  inputEl.style.height = 'auto';
  emptyEl.style.display = 'none';

  addMessage('user', text);
  history.push({ role: 'user', content: text });

  streaming = true;
  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  // Add thinking indicator
  const thinkEl = document.createElement('div');
  thinkEl.className = 'thinking';
  thinkEl.id = 'thinking';
  thinkEl.innerHTML = '<span class="dots"><span></span><span></span><span></span></span> Thinking...';
  messagesEl.appendChild(thinkEl);
  scrollBottom();

  // Add assistant placeholder
  const msgEl = document.createElement('div');
  msgEl.className = 'msg';
  msgEl.innerHTML = '<div class="role assistant">Velora AI</div><div class="text" id="streaming-text"></div>';
  messagesEl.appendChild(msgEl);

  vscode.postMessage({ type: 'send', text, history: history.slice(0, -1) });
}

function addMessage(role, text) {
  const el = document.createElement('div');
  el.className = 'msg';
  el.innerHTML = '<div class="role ' + role + '">' + (role === 'user' ? 'You' : 'Velora AI') + '</div><div class="text">' + escapeHtml(text) + '</div>';
  messagesEl.appendChild(el);
  scrollBottom();
}

function escapeHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function scrollBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

window.addEventListener('message', (e) => {
  const msg = e.data;
  const thinkEl = document.getElementById('thinking');
  const streamEl = document.getElementById('streaming-text');

  if (msg.type === 'token' && streamEl) {
    if (thinkEl) thinkEl.remove();
    streamEl.textContent = msg.content;
    scrollBottom();
  }

  if (msg.type === 'done') {
    if (thinkEl) thinkEl.remove();
    if (streamEl) {
      streamEl.removeAttribute('id');
      history.push({ role: 'assistant', content: msg.content });
    }
    streaming = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
    scrollBottom();
  }

  if (msg.type === 'error') {
    if (thinkEl) thinkEl.remove();
    if (streamEl) {
      streamEl.innerHTML = '<span class="error">Error: ' + escapeHtml(msg.content) + '</span>';
      streamEl.removeAttribute('id');
    }
    streaming = false;
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send';
  }
});

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});
</script>
</body>
</html>`;
  }
}
