const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
const SETUP_FLAG = path.join(app.getPath('userData'), '.setup-complete');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Rahul Goel — AI Studio',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    backgroundColor: '#f4f3ef',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Check if setup is complete
  if (fs.existsSync(SETUP_FLAG)) {
    loadApp();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'wizard.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function loadApp() {
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }
}

// ─── IPC Handlers for wizard steps ───

ipcMain.handle('check-node', async () => {
  try {
    const ver = execSync('node -v', { encoding: 'utf8' }).trim();
    return { ok: true, version: ver };
  } catch {
    return { ok: false, error: 'Node.js not found' };
  }
});

ipcMain.handle('check-ollama', async () => {
  try {
    const ver = execSync('ollama --version', { encoding: 'utf8' }).trim();
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
    const child = spawn('ollama', ['serve'], { detached: true, stdio: 'ignore' });
    child.unref();
    // Wait for it to start
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
  return process.platform; // 'darwin', 'win32', 'linux'
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
