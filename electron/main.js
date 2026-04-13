const { app, BrowserWindow, shell, ipcMain, protocol } = require('electron');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const url = require('url');

let mainWindow;
const SETUP_FLAG = path.join(app.getPath('userData'), '.setup-complete');

function getDistPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'dist');
  }
  return path.join(__dirname, '..', 'dist');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Rahul Goel — AI Studio',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 10 },
    backgroundColor: '#f4f3ef',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });

  // Check if setup is complete
  if (fs.existsSync(SETUP_FLAG)) {
    loadApp();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'wizard.html'));
  }

  // Open DevTools in dev mode for debugging
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function loadApp() {
  const distPath = getDistPath();
  const indexPath = path.join(distPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    // Fallback: try dev server
    mainWindow.loadURL('http://localhost:5173');
    return;
  }

  // Serve dist via a tiny local HTTP server so Vue Router works
  const mimeTypes = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  };

  const server = http.createServer((req, res) => {
    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);

    // SPA fallback: if file doesn't exist, serve index.html
    if (!fs.existsSync(filePath)) {
      filePath = indexPath;
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    mainWindow.loadURL(`http://127.0.0.1:${port}`);
  });

  // Clean up server on window close
  mainWindow.on('closed', () => { server.close(); });
}

// ─── IPC Handlers for wizard steps ───

ipcMain.handle('check-node', async () => {
  try {
    const ver = execSync('node -v', { encoding: 'utf8', timeout: 5000 }).trim();
    return { ok: true, version: ver };
  } catch {
    return { ok: false, error: 'Node.js not found' };
  }
});

ipcMain.handle('check-ollama', async () => {
  try {
    const ver = execSync('ollama --version', { encoding: 'utf8', timeout: 5000 }).trim();
    return { ok: true, version: ver };
  } catch {
    return { ok: false, error: 'Ollama not installed' };
  }
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
        } catch {
          resolve({ ok: false, error: 'Invalid response from Ollama' });
        }
      });
    });
    req.on('error', () => resolve({ ok: false, error: 'Ollama not running on localhost:11434' }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'Connection timed out' }); });
  });
});

ipcMain.handle('start-ollama', async () => {
  try {
    const child = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, OLLAMA_ORIGINS: '*' },
    });
    child.unref();
    await new Promise(r => setTimeout(r, 3000));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle('pull-model', async (_, model) => {
  return new Promise((resolve) => {
    const child = spawn('ollama', ['pull', model]);
    let output = '';
    child.stdout.on('data', (d) => { output += d.toString(); });
    child.stderr.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => {
      resolve({ ok: code === 0, output });
    });
    child.on('error', (e) => {
      resolve({ ok: false, output: e.message });
    });
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

ipcMain.handle('get-platform', async () => {
  return process.platform;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
