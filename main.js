const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function createWindow () {
  const win = new BrowserWindow({
    width: 950,
    height: 700,
    title: "Criador de Etiquetas",
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Essencial para o require('electron') funcionar no HTML
    }
  });

  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- NOVO: Ouvinte para gerar o PDF ---
ipcMain.on('imprimir-pdf', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  // Gera o PDF usando as regras do @media print do seu CSS
  win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4'
  }).then(data => {
    // Salva na pasta temporária do sistema
    const pdfPath = path.join(os.tmpdir(), 'etiquetas-faama.pdf');
    fs.writeFileSync(pdfPath, data);
    
    // Pede pro SO abrir o arquivo com o programa padrão (Edge, Acrobat, etc)
    shell.openPath(pdfPath);
  }).catch(error => {
    console.error("Erro ao gerar PDF:", error);
  });
});