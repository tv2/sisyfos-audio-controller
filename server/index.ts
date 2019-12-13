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

const express = require('express')
var app = express();
app.use( '/' , express.static(path.join(__dirname ,'/..' ,'dist')))
var server = require('http').Server(app);
global.socketServer = require('socket.io')(server);


server.listen(1176);

global.mixerProtocolPresets = MixerProtocolPresets
global.mixerProtocolList = MixerProtocolList

// Keep a reference for dev mode
let dev = true
let mainThreadHandler = new MainThreadHandlers();
let mainApp = new MainApp()

/*if (dev && process.argv.indexOf('--noDevServer') === -1) {
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

//global.socketServer.on('connection', (socket: any) => {
server.on('connection', (socket: any) => {

  app.get('/', (req: any, res: any) => {
    console.log('Path :', path.resolve('../dist/index.html'))

    res.sendFile(path.resolve('dist/index.html'))
  })

  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data: any) {
    console.log(data);
  })
})

