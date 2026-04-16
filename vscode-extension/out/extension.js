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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// ─── HTTP helpers ───
function ollamaStream(endpoint, body, onToken, onDone, onError) {
    const url = new URL(endpoint);
    const data = JSON.stringify(body);
    const req = http.request({ hostname: url.hostname, port: url.port || 80, path: url.pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }, timeout: 120000 }, (res) => {
        let buffer = '';
        res.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (!line.trim())
                    continue;
                try {
                    const p = JSON.parse(line);
                    if (p.message?.content)
                        onToken(p.message.content);
                    if (p.done)
                        onDone();
                }
                catch { }
            }
        });
        res.on('end', onDone);
    });
    req.on('error', (e) => onError(e.message));
    req.on('timeout', () => { req.destroy(); onError('Timeout'); });
    req.write(data);
    req.end();
}
function ollamaGet(endpoint) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);
        http.get({ hostname: url.hostname, port: url.port || 80, path: url.pathname, timeout: 10000 }, (res) => {
            let buf = '';
            res.on('data', (c) => { buf += c; });
            res.on('end', () => { try {
                resolve(JSON.parse(buf));
            }
            catch {
                reject(new Error('Bad response'));
            } });
        }).on('error', reject);
    });
}
// ─── Workspace ───
function getRoot() { return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; }
function getFileTree(dir, depth = 3, prefix = '') {
    if (depth <= 0)
        return '';
    let r = '';
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true }).filter(e => !e.name.startsWith('.') && !['node_modules', 'dist', 'out', '__pycache__'].includes(e.name)).sort((a, b) => a.isDirectory() === b.isDirectory() ? a.name.localeCompare(b.name) : a.isDirectory() ? -1 : 1);
        for (let i = 0; i < entries.length && i < 50; i++) {
            const e = entries[i], last = i === entries.length - 1;
            r += prefix + (last ? '└── ' : '├── ') + e.name + (e.isDirectory() ? '/' : '') + '\n';
            if (e.isDirectory())
                r += getFileTree(path.join(dir, e.name), depth - 1, prefix + (last ? '    ' : '│   '));
        }
    }
    catch { }
    return r;
}
function getEditorCtx() {
    const ed = vscode.window.activeTextEditor;
    if (!ed)
        return '';
    const doc = ed.document, sel = ed.selection;
    let c = `\n[File: ${path.basename(doc.fileName)}] [${doc.languageId}]\n`;
    if (!sel.isEmpty)
        c += `[Selected lines ${sel.start.line + 1}-${sel.end.line + 1}]\n\`\`\`${doc.languageId}\n${doc.getText(sel)}\n\`\`\`\n`;
    else {
        const l = doc.getText().split('\n');
        c += `[Content${l.length > 100 ? ` (100/${l.length})` : ''}]\n\`\`\`${doc.languageId}\n${l.slice(0, 100).join('\n')}\n\`\`\`\n`;
    }
    const d = vscode.languages.getDiagnostics(doc.uri);
    if (d.length) {
        c += '[Diagnostics]\n';
        for (const x of d.slice(0, 10))
            c += `- L${x.range.start.line + 1}: [${vscode.DiagnosticSeverity[x.severity]}] ${x.message}\n`;
    }
    return c;
}
async function execTool(text) {
    const root = getRoot();
    if (!root)
        return null;
    let m = text.match(/```create:(.+?)\n([\s\S]*?)```/);
    if (m) {
        const fp = path.join(root, m[1].trim());
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        fs.writeFileSync(fp, m[2]);
        const doc = await vscode.workspace.openTextDocument(fp);
        await vscode.window.showTextDocument(doc);
        return `✓ Created: ${m[1].trim()}`;
    }
    m = text.match(/```edit:(.+?)\n([\s\S]*?)```/);
    if (m) {
        const fp = path.join(root, m[1].trim());
        fs.writeFileSync(fp, m[2]);
        const doc = await vscode.workspace.openTextDocument(fp);
        await vscode.window.showTextDocument(doc);
        return `✓ Updated: ${m[1].trim()}`;
    }
    m = text.match(/```delete:(.+?)```/);
    if (m) {
        const fp = path.join(root, m[1].trim());
        if (fs.existsSync(fp)) {
            fs.unlinkSync(fp);
            return `✓ Deleted: ${m[1].trim()}`;
        }
        return `✗ Not found: ${m[1].trim()}`;
    }
    return null;
}
// ─── Sidebar ───
class ChatView {
    constructor(uri) {
        this.uri = uri;
    }
    resolveWebviewView(v) {
        v.webview.options = { enableScripts: true };
        const cfg = vscode.workspace.getConfiguration('velora');
        v.webview.html = getHtml(cfg.get('model') || 'kimi-k2.5:cloud');
        v.webview.onDidReceiveMessage(async (msg) => {
            const cfg = vscode.workspace.getConfiguration('velora');
            const ep = cfg.get('endpointUrl') || 'http://localhost:11434';
            // Fetch models
            if (msg.type === 'getModels') {
                try {
                    const data = await ollamaGet(`${ep}/api/tags`);
                    const models = (data.models || []).map((m) => ({ name: m.name, size: m.size }));
                    v.webview.postMessage({ type: 'models', models, current: cfg.get('model') || 'kimi-k2.5:cloud' });
                }
                catch {
                    v.webview.postMessage({ type: 'models', models: [], current: cfg.get('model') || 'kimi-k2.5:cloud' });
                }
                return;
            }
            // Change model
            if (msg.type === 'setModel') {
                await cfg.update('model', msg.model, true);
                v.webview.postMessage({ type: 'modelChanged', model: msg.model });
                return;
            }
            // Chat
            if (msg.type !== 'chat')
                return;
            const mdl = cfg.get('model') || 'kimi-k2.5:cloud';
            const root = getRoot();
            v.webview.postMessage({ type: 'status', text: '📂 Scanning workspace...' });
            let sys = `You are Velora AI, an enterprise coding assistant with workspace access.\nWORKSPACE: ${root ? path.basename(root) : 'none'}\n${root ? 'FILES:\n' + getFileTree(root, 2) : ''}\nYou can create/edit/delete files:\n- \`\`\`create:path\\ncontent\`\`\`\n- \`\`\`edit:path\\ncontent\`\`\`\n- \`\`\`delete:path\`\`\``;
            const ectx = getEditorCtx();
            if (ectx) {
                v.webview.postMessage({ type: 'status', text: '📄 Reading active file...' });
                sys += ectx;
            }
            v.webview.postMessage({ type: 'status', text: `🤖 Asking ${mdl}...` });
            let full = '';
            ollamaStream(`${ep}/api/chat`, { model: mdl, messages: [{ role: 'system', content: sys }, ...msg.messages], stream: true }, (tok) => { full += tok; v.webview.postMessage({ type: 'token', content: full }); }, async () => {
                const tool = await execTool(full);
                if (tool) {
                    v.webview.postMessage({ type: 'status', text: '🔧 ' + tool });
                    full += '\n\n' + tool;
                }
                v.webview.postMessage({ type: 'done', content: full });
            }, (err) => { v.webview.postMessage({ type: 'error', content: err }); });
        });
    }
}
function getHtml(model) {
    return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--vscode-font-family);font-size:13px;color:var(--vscode-foreground);background:var(--vscode-sideBar-background);display:flex;flex-direction:column;height:100vh}
.hdr{padding:6px 10px;border-bottom:1px solid var(--vscode-panel-border);display:flex;align-items:center;gap:6px}
.hdr .dot{width:8px;height:8px;border-radius:50%;background:#0d9488}
.hdr .name{font-weight:600;font-size:12px}
.model-sel{margin-left:auto;position:relative}
.model-btn{background:var(--vscode-input-background);border:1px solid var(--vscode-input-border);border-radius:4px;padding:2px 8px;font-size:11px;color:var(--vscode-foreground);cursor:pointer;display:flex;align-items:center;gap:4px}
.model-btn:hover{border-color:var(--vscode-focusBorder)}
.model-btn svg{width:10px;height:10px;fill:currentColor;opacity:0.5}
.model-dd{display:none;position:absolute;right:0;top:100%;margin-top:4px;background:var(--vscode-dropdown-background);border:1px solid var(--vscode-dropdown-border);border-radius:4px;min-width:180px;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,0.2);max-height:200px;overflow-y:auto}
.model-dd.open{display:block}
.model-dd .item{padding:6px 10px;font-size:11px;cursor:pointer;display:flex;justify-content:space-between}
.model-dd .item:hover{background:var(--vscode-list-hoverBackground)}
.model-dd .item.active{color:#0d9488;font-weight:600}
.model-dd .item .sz{opacity:0.5;font-size:10px}
.msgs{flex:1;overflow-y:auto;padding:8px 10px}
.msg{margin-bottom:10px}
.msg .who{font-size:11px;font-weight:600;margin-bottom:2px;opacity:0.6}
.msg .who.user{color:var(--vscode-textLink-foreground)}
.msg .who.ai{color:#0d9488}
.msg .txt{white-space:pre-wrap;word-break:break-word;line-height:1.5}
.msg .txt code{background:var(--vscode-textCodeBlock-background);padding:1px 4px;border-radius:3px;font-family:var(--vscode-editor-font-family);font-size:12px}
.msg .txt pre{background:var(--vscode-textCodeBlock-background);padding:8px;border-radius:6px;margin:4px 0;overflow-x:auto}
.msg .txt pre code{background:none;padding:0}
.st{font-size:11px;padding:4px 10px;color:var(--vscode-descriptionForeground);display:flex;align-items:center;gap:6px}
.st .sp{width:12px;height:12px;border:2px solid var(--vscode-descriptionForeground);border-top-color:#0d9488;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ia{padding:8px 10px;border-top:1px solid var(--vscode-panel-border)}
.ir{display:flex;gap:4px}
textarea{flex:1;resize:none;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);border-radius:4px;padding:6px;font-size:13px;font-family:var(--vscode-font-family);outline:none;min-height:28px;max-height:100px}
textarea:focus{border-color:var(--vscode-focusBorder)}
button{background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:none;border-radius:4px;padding:6px 10px;cursor:pointer;font-size:12px}
button:hover{background:var(--vscode-button-hoverBackground)}
button:disabled{opacity:0.5}
.ft{padding:4px 10px;text-align:center;font-size:10px;color:var(--vscode-descriptionForeground)}
.ft a{color:var(--vscode-textLink-foreground);text-decoration:none}
</style></head><body>
<div class="hdr">
  <div class="dot"></div>
  <span class="name">Velora AI</span>
  <div class="model-sel">
    <div class="model-btn" id="modelBtn" onclick="toggleModels()">
      <span id="modelName">${model.replace(':latest', '')}</span>
      <svg viewBox="0 0 10 6"><path d="M0 0l5 6 5-6z"/></svg>
    </div>
    <div class="model-dd" id="modelDd"></div>
  </div>
</div>
<div class="msgs" id="m"></div>
<div class="st" id="st" style="display:none"><div class="sp"></div><span id="stxt"></span></div>
<div class="ia"><div class="ir"><textarea id="i" rows="1" placeholder="Ask about your code..."></textarea><button id="b" onclick="send()">Send</button></div></div>
<div class="ft">Powered by <a href="https://goelrah.github.io/">Rahul Goel</a> · <a href="https://buymeacoffee.com/goelrah">☕ Donate</a></div>
<script>
const vs=acquireVsCodeApi(),m=document.getElementById('m'),i=document.getElementById('i'),b=document.getElementById('b'),st=document.getElementById('st'),stxt=document.getElementById('stxt');
const modelBtn=document.getElementById('modelBtn'),modelName=document.getElementById('modelName'),modelDd=document.getElementById('modelDd');
let h=[],streaming=false,streamEl=null,ddOpen=false;

function send(){
  const t=i.value.trim();if(!t||streaming)return;
  i.value='';i.style.height='auto';
  addMsg('user',t);h.push({role:'user',content:t});
  streaming=true;b.disabled=true;
  const d=document.createElement('div');d.className='msg';
  d.innerHTML='<div class="who ai">Velora AI</div><div class="txt" id="stream"></div>';
  m.appendChild(d);streamEl=document.getElementById('stream');
  vs.postMessage({type:'chat',messages:h});
}

function addMsg(w,t){
  const d=document.createElement('div');d.className='msg';
  const txt=document.createElement('div');txt.className='txt';txt.textContent=t;
  d.innerHTML='<div class="who '+w+'">'+(w==='user'?'You':'Velora AI')+'</div>';
  d.appendChild(txt);m.appendChild(d);m.scrollTop=m.scrollHeight;
}

function showSt(t){st.style.display='flex';stxt.textContent=t}
function hideSt(){st.style.display='none'}

// Model selector
function toggleModels(){
  ddOpen=!ddOpen;
  if(ddOpen){modelDd.classList.add('open');vs.postMessage({type:'getModels'})}
  else modelDd.classList.remove('open');
}

function selectModel(name){
  vs.postMessage({type:'setModel',model:name});
  modelName.textContent=name.replace(':latest','');
  modelDd.classList.remove('open');ddOpen=false;
}

document.addEventListener('click',function(e){
  if(!e.target.closest('.model-sel')){modelDd.classList.remove('open');ddOpen=false}
});

window.addEventListener('message',e=>{
  const d=e.data;
  if(d.type==='models'){
    modelDd.innerHTML='';
    if(d.models.length===0){modelDd.innerHTML='<div class="item" style="opacity:0.5">No models found</div>';return}
    d.models.forEach(function(m){
      const div=document.createElement('div');
      div.className='item'+(m.name===d.current?' active':'');
      const sz=m.size>1e9?(m.size/1e9).toFixed(1)+'GB':m.size>1e6?Math.round(m.size/1e6)+'MB':'cloud';
      div.innerHTML='<span>'+m.name.replace(':latest','')+'</span><span class="sz">'+sz+'</span>';
      div.onclick=function(){selectModel(m.name)};
      modelDd.appendChild(div);
    });
  }
  if(d.type==='modelChanged'){modelName.textContent=d.model.replace(':latest','')}
  if(d.type==='status'){showSt(d.text)}
  if(d.type==='token'&&streamEl){hideSt();streamEl.textContent=d.content;m.scrollTop=m.scrollHeight}
  if(d.type==='done'){hideSt();if(streamEl){streamEl.removeAttribute('id');streamEl=null}h.push({role:'assistant',content:d.content});streaming=false;b.disabled=false;m.scrollTop=m.scrollHeight}
  if(d.type==='error'){hideSt();if(streamEl){streamEl.textContent='Error: '+d.content;streamEl.removeAttribute('id');streamEl=null}else addMsg('ai','Error: '+d.content);streaming=false;b.disabled=false}
});

i.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
i.addEventListener('input',()=>{i.style.height='auto';i.style.height=Math.min(i.scrollHeight,100)+'px'});
</script></body></html>`;
}
function activate(ctx) {
    ctx.subscriptions.push(vscode.window.registerWebviewViewProvider('velora.chat', new ChatView(ctx.extensionUri)));
    ctx.subscriptions.push(vscode.commands.registerCommand('velora.checkHealth', async () => {
        const ep = vscode.workspace.getConfiguration('velora').get('endpointUrl') || 'http://localhost:11434';
        try {
            const d = await ollamaGet(`${ep}/api/tags`);
            vscode.window.showInformationMessage(`Velora AI: ✓ ${d.models?.length || 0} models`);
        }
        catch {
            vscode.window.showErrorMessage('Velora AI: Cannot reach endpoint');
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map