import { logger } from './utils/logger'

const express = require('express')
const path = require('path')
const app = express();
const server = require('http').Server(app);
const socketServer = require('socket.io')(server);
const SERVER_PORT = 1176

app.use( '/' , express.static(path.join(__dirname ,'..')))
server.listen(SERVER_PORT);
logger.info(`Server started at http://localhost:${SERVER_PORT}`)

server.on('connection', () => {
    app.get('/', (req: any, res: any) => {
      res.sendFile(path.resolve('dist/index.html'))
    })
  })

socketServer.on('connection', ((socket: any) => {
      logger.info('Client connected :' + String(socket.client.id), {})
      global.mainThreadHandler.socketServerHandlers(socket)
    })
)

export const expressInit = () => {
    logger.info('Initialising WebServer')
}

export { socketServer }
