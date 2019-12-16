// Import parts of electron to use
import { MainThreadHandlers } from './MainThreadHandler'
import { MainApp } from './MainApp'
import { MixerProtocolPresets, MixerProtocolList } from './constants/MixerProtocolPresets'
import { Store } from 'redux'
import { MixerGenericConnection } from './utils/MixerConnection';
import { AutomationConnection } from './utils/AutomationConnection';
import { IMixerProtocolGeneric } from './constants/MixerProtocolInterface';


const path = require('path')
const url = require('url')


declare global {
  namespace NodeJS {
      interface Global {
          storeRedux: Store
          mainApp: MainApp
          mixerGenericConnection: MixerGenericConnection
          automationConnection: AutomationConnection
          huiRemoteConnection: any
          socketServer: any
          mixerProtocol: any
          mixerProtocolPresets: { [key: string]: IMixerProtocolGeneric; }
          mixerProtocolList: {value: string; label: string}[]
          navigator: any // Workaround for WebMidi
          performance: any // Workaround for WebMidi
      }
  }
}

const express = require('express')
var app = express();
app.use( '/' , express.static(path.join(__dirname ,'..')))
var server = require('http').Server(app);
global.socketServer = require('socket.io')(server);


server.listen(1176);

global.mixerProtocolPresets = MixerProtocolPresets
global.mixerProtocolList = MixerProtocolList

let mainThreadHandler = new MainThreadHandlers();
global.mainApp = new MainApp()

// Keep a reference for dev mode
/*
let dev = true

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
*/

server.on('connection', () => {
  app.get('/', (req: any, res: any) => {
    res.sendFile(path.resolve('dist/index.html'))
  })
})

global.socketServer.on('connection', ((socket: any) => {
    console.log('Client connected :', socket.client.id)
    mainThreadHandler.socketServerHandlers(socket)
  })
)