// Import parts of electron to use
import { app, BrowserWindow, ipcMain } from 'electron'
import { MainThreadHandlers } from './MainThreadHandler'
import { MainApp } from './MainApp'
const path = require('path')
const url = require('url')

declare global {
  namespace NodeJS {
      interface Global {
          storeRedux: any
          mixerGenericConnection: any
          automationConnection: any
          huiRemoteConnection: any
      }
  }
}


// Keep a reference for dev mode
let dev = true

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
}

let mainWindow: any


// Event handler for incoming messages
ipcMain.on('from-renderer', (event, arg) => {
  console.log('MAIN RECEIVE :', arg)

  // Event emitter for sending asynchronous messages
  event.reply('to-renderer', 'response from main thread')
})



function createWindow() {
  // Define the browser window.
  let mainWindow = new BrowserWindow({
    width: 1024,
    height: 955,
    fullscreen: true,
    // frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, '/../../preload.js')
    }
  })
  // and load the index.html of the app.
  let indexPath

  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    })
  }

  let mainHandler = new MainThreadHandlers(mainWindow.webContents);
  let app = new MainApp(this.webContents)

  mainWindow.loadURL(indexPath)

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()

    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
