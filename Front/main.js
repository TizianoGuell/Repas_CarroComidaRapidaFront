const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Printing helpers
async function printHTML(html) {
  const win = new BrowserWindow({ show: false });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await win.webContents.print({ silent: false, printBackground: true });
  win.close();
}

ipcMain.handle('print-ticket', (event, html) => printHTML(html));
ipcMain.handle('print-kitchen', (event, html) => printHTML(html));

// Save CSV file
ipcMain.handle('save-csv', async (event, csv, fileName = 'export.csv') => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: fileName
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, csv);
    return true;
  }
  return false;
});

// Expose app version
ipcMain.handle('get-version', () => app.getVersion());
