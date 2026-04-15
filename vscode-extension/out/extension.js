"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const http = __importStar(require("http"));
function httpPost(url, body) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = http.request({
            hostname: parsed.hostname,
            port: parsed.port || 80,
            path: parsed.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000,
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.write(body);
        req.end();
    });
}
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const req = http.get({
            hostname: parsed.hostname,
            port: parsed.port || 80,
            path: parsed.pathname,
            timeout: 10000,
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}
class ChatViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        const config = vscode.workspace.getConfiguration('velora');
        const model = config.get('model') || 'kimi-k2.5:cloud';
        webviewView.webview.html = getHtml(model);
        webviewView.webview.onDidReceiveMessage(async (msg) => {
            if (msg.type === 'chat') {
                const cfg = vscode.workspace.getConfiguration('velora');
                const ep = cfg.get('endpointUrl') || 'http://localhost:11434';
                const mdl = cfg.get('model') || 'kimi-k2.5:cloud';
                try {
                    const result = await httpPost(`${ep}/api/chat`, JSON.stringify({
                        model: mdl,
                        messages: msg.messages,
                        stream: false,
                    }));
                    const data = JSON.parse(result);
                    webviewView.webview.postMessage({
                        type: 'response',
                        content: data.message?.content || 'No response',
                    });
                }
                catch (err) {
                    webviewView.webview.postMessage({
                        type: 'error',
                        content: err.message || 'Connection failed',
                    });
                }
            }
        });
    }
}
function getHtml(model) {
    return `<!DOCTYPE html>
<html>
<head>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--vscode-font-family);font-size:13px;color:var(--vscode-foreground);background:var(--vscode-sideBar-background);display:flex;flex-direction:column;height:100vh}
.hdr{padding:8px 10px;border-bottom:1px solid var(--vscode-panel-border);font-weight:600;font-size:12px;display:flex;align-items:center;gap:6px}
.hdr .dot{width:8px;height:8px;border-radius:50%;background:#0d9488}
.msgs{flex:1;overflow-y:auto;padding:8px 10px}
.msg{margin-bottom:8px}
.msg .who{font-size:11px;font-weight:600;margin-bottom:2px;opacity:0.6}
.msg .who.user{color:var(--vscode-textLink-foreground)}
.msg .who.ai{color:#0d9488}
.msg .txt{white-space:pre-wrap;word-break:break-word;line-height:1.5}
.ld{font-size:11px;color:var(--vscode-descriptionForeground);padding:4px 10px}
.ia{padding:8px 10px;border-top:1px solid var(--vscode-panel-border)}
.ir{display:flex;gap:4px}
textarea{flex:1;resize:none;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);border-radius:4px;padding:6px;font-size:13px;font-family:var(--vscode-font-family);outline:none;min-height:28px;max-height:100px}
textarea:focus{border-color:var(--vscode-focusBorder)}
button{background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:4px;padding:6px 10px;cursor:pointer;font-size:12px}
button:hover{background:var(--vscode-button-hoverBackground)}
button:disabled{opacity:0.5}
.ft{padding:4px 10px;text-align:center;font-size:10px;color:var(--vscode-descriptionForeground)}
.ft a{color:var(--vscode-textLink-foreground);text-decoration:none}
</style>
</head>
<body>
<div class="hdr"><div class="dot"></div>Velora AI<span style="margin-left:auto;font-weight:400;font-size:10px;opacity:0.5">${model}</span></div>
<div class="msgs" id="m"></div>
<div class="ld" id="ld" style="display:none">Thinking...</div>
<div class="ia"><div class="ir"><textarea id="i" rows="1" placeholder="Ask anything..."></textarea><button id="b" onclick="s()">Send</button></div></div>
<div class="ft">Powered by <a href="https://goelrah.github.io/">Rahul Goel</a></div>
<script>
const vs=acquireVsCodeApi(),m=document.getElementById('m'),i=document.getElementById('i'),b=document.getElementById('b'),l=document.getElementById('ld');
let h=[];
function s(){const t=i.value.trim();if(!t)return;i.value='';a('user',t);h.push({role:'user',content:t});b.disabled=true;l.style.display='block';vs.postMessage({type:'chat',messages:h})}
function a(w,t){const d=document.createElement('div');d.className='msg';d.innerHTML='<div class="who '+w+'">'+(w==='user'?'You':'Velora AI')+'</div><div class="txt"></div>';d.querySelector('.txt').textContent=t;m.appendChild(d);m.scrollTop=m.scrollHeight}
window.addEventListener('message',e=>{const d=e.data;if(d.type==='response'){a('ai',d.content);h.push({role:'assistant',content:d.content})}if(d.type==='error')a('ai','Error: '+d.content);b.disabled=false;l.style.display='none'});
i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();s()}});
</script>
</body>
</html>`;
}
function activate(context) {
    const provider = new ChatViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('velora.chat', provider));
    context.subscriptions.push(vscode.commands.registerCommand('velora.checkHealth', async () => {
        const cfg = vscode.workspace.getConfiguration('velora');
        const ep = cfg.get('endpointUrl') || 'http://localhost:11434';
        try {
            const result = await httpGet(`${ep}/api/tags`);
            const data = JSON.parse(result);
            vscode.window.showInformationMessage(`Velora AI: Connected ✓ — ${data.models?.length || 0} models`);
        }
        catch {
            vscode.window.showErrorMessage('Velora AI: Cannot reach endpoint');
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map