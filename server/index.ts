// Import parts of electron to use
import { MainThreadHandlers } from './MainThreadHandler'
import { logger } from './utils/logger'

const path = require('path')
const url = require('url')


declare global {
  namespace NodeJS {
      interface Global {
          mainThreadHandler: MainThreadHandlers
          socketServer: any
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

global.mainThreadHandler = new MainThreadHandlers()

server.on('connection', () => {
  app.get('/', (req: any, res: any) => {
    res.sendFile(path.resolve('dist/index.html'))
  })
})

global.socketServer.on('connection', ((socket: any) => {
    logger.info('Client connected :' + String(socket.client.id), {})
    global.mainThreadHandler.socketServerHandlers(socket)
  })
)