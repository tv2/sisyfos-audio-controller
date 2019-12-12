// Import parts of electron to use
import { MainThreadHandlers } from './MainThreadHandler'
import { MainApp } from './MainApp'
import { MixerProtocolPresets, MixerProtocolList } from './constants/MixerProtocolPresets'
const path = require('path')
const url = require('url')


declare global {
  namespace NodeJS {
      interface Global {
          storeRedux: any
          mixerGenericConnection: any
          automationConnection: any
          huiRemoteConnection: any
          socketServer: any
          mixerProtocol: any
          mixerProtocolPresets: any
          mixerProtocolList: any
          navigator: any // Workaround for WebMidi
          performance: any // Workaround for WebMidi
      }
  }
}

var app = require('express')();
var server = require('http').Server(app);
global.socketServer = require('socket.io')(server);

server.listen(1176);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

global.socketServer.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

global.mixerProtocolPresets = MixerProtocolPresets
global.mixerProtocolList = MixerProtocolList

// Keep a reference for dev mode
let dev = true
let mainThreadHandler: any
let mainApp: any

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
}

function createWindow() {
  // Define the browser window.
  global.socketServer = new BrowserWindow({
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

  // Don't show until we are ready and loaded
  global.socketServer.once('ready-to-show', () => {
    global.socketServer.show()

    // Open the DevTools automatically if developing
    if (dev) {
      global.socketServer.webContents.openDevTools()
    }
  })
  return indexPath
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  let indexPath = createWindow()
  
  mainThreadHandler = new MainThreadHandlers();
  mainApp = new MainApp()

  global.socketServer.loadURL(indexPath)
})

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
  if (global.socketServer === null) {
    createWindow()
  }
})

