const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printTicket: (html) => ipcRenderer.invoke('print-ticket', html),
  printKitchen: (html) => ipcRenderer.invoke('print-kitchen', html),
  saveCSV: (csv, fileName) => ipcRenderer.invoke('save-csv', csv, fileName),
  getVersion: () => ipcRenderer.invoke('get-version')
});
