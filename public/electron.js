const path = require('path')

const { app, BrowserWindow } = require('electron')
const server = require('../dist/server/index.js')

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        minWidth: 1000,
        minHeight: 800,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    win.loadURL('http://localhost:1176/?settings=1')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
