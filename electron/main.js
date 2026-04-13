const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const urlModule = require('url');

let mainWindow;
let appServerPort = null;
const SETUP_FLAG = path.join(app.getPath('userData'), '.setup-complete');

function getDistPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'dist');
  }
  return path.join(__dirname, '..', 'dist');
}

// ─── Embedded app server (like VS Code / Slack / Discord) ───
// Binds to 127.0.0.1 on a random ephemeral port — NOT exposed externally
function startEmbeddedServer() {
  return new Promise((resolve, reject) => {
    const distPath = getDistPath();
    const indexPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      resolve(null);
      return;
    }

    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
      '.woff': 'font/woff',
      '.ttf': 'font/ttf',
    };

    const server = http.createServer((req, res) => {
      const parsed = urlModule.parse(req.url);
      let reqPath = decodeURIComponent(parsed.pathname || '/');
      let filePath = path.join(distPath, reqPath === '/' ? 'index.html' : reqPath);

      // SPA fallback — any non-file route serves index.html
      try {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = indexPath;
        }
      } catch {
        filePath = indexPath;
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=604800',
        });
        res.end(content);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });

    // Bind to loopback only, random port
    server.listen(0, '127.0.0.1', () => {
      appServerPort = server.address().port;
      resolve(appServerPort);
    });

    server.on('error', reject);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Velora AI Studio',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 12 },
    backgroundColor: '#0f172a',
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  // Show window when content is ready — native feel
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (fs.existsSync(SETUP_FLAG) && appServerPort) {
    loadApp();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'wizard.html'));
    mainWindow.once('ready-to-show', () => mainWindow.show());
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('page-title-updated', (event, title) => {
    if (mainWindow && title) mainWindow.setTitle(title);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function loadApp() {
  if (!mainWindow) return;
  if (appServerPort) {
    mainWindow.loadURL(`http://127.0.0.1:${appServerPort}`);
  }
}

// ─── IPC Handlers ───

ipcMain.handle('check-node', async () => {
  try {
    const ver = execSync('node -v', { encoding: 'utf8', timeout: 5000 }).trim();
    return { ok: true, version: ver };
  } catch { return { ok: false }; }
});

ipcMain.handle('check-ollama', async () => {
  try {
    const ver = execSync('ollama --version', { encoding: 'utf8', timeout: 5000 }).trim();
    return { ok: true, version: ver };
  } catch { return { ok: false }; }
});

ipcMain.handle('check-ollama-running', async () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11434/api/tags', { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const models = (parsed.models || []).map(m => m.name);
          resolve({ ok: true, models });
        } catch { resolve({ ok: false, error: 'Invalid response' }); }
      });
    });
    req.on('error', () => resolve({ ok: false, error: 'Not running' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
  });
});

ipcMain.handle('start-ollama', async () => {
  try {
    const child = spawn('ollama', ['serve'], {
      detached: true, stdio: 'ignore',
      env: { ...process.env, OLLAMA_ORIGINS: '*' },
    });
    child.unref();
    await new Promise(r => setTimeout(r, 3000));
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('pull-model', async (_, model) => {
  return new Promise((resolve) => {
    const child = spawn('ollama', ['pull', model]);
    let output = '';
    child.stdout.on('data', (d) => { output += d.toString(); });
    child.stderr.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => resolve({ ok: code === 0, output }));
    child.on('error', (e) => resolve({ ok: false, output: e.message }));
  });
});

ipcMain.handle('run-command', async (_, cmd) => {
  return new Promise((resolve) => {
    const child = spawn(cmd, [], { shell: true });
    let output = '';
    child.stdout.on('data', (d) => { output += d.toString(); });
    child.stderr.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => resolve({ ok: code === 0, output }));
    child.on('error', (e) => resolve({ ok: false, output: e.message }));
  });
});

ipcMain.handle('complete-setup', async () => {
  fs.writeFileSync(SETUP_FLAG, new Date().toISOString());
  loadApp();
  return { ok: true };
});

ipcMain.handle('reset-setup', async () => {
  if (fs.existsSync(SETUP_FLAG)) fs.unlinkSync(SETUP_FLAG);
  return { ok: true };
});

ipcMain.handle('get-platform', async () => process.platform);

// ─── App lifecycle ───
// Start embedded server FIRST, then create window
app.whenReady().then(async () => {
  await startEmbeddedServer();
  createWindow();
});

app.on('window-all-closed', () => { app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
