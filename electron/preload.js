const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wizard', {
  checkNode: () => ipcRenderer.invoke('check-node'),
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  checkOllamaRunning: () => ipcRenderer.invoke('check-ollama-running'),
  startOllama: () => ipcRenderer.invoke('start-ollama'),
  pullModel: (model) => ipcRenderer.invoke('pull-model', model),
  runCommand: (cmd, args) => ipcRenderer.invoke('run-command', cmd, args),
  completeSetup: () => ipcRenderer.invoke('complete-setup'),
  resetSetup: () => ipcRenderer.invoke('reset-setup'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
});
