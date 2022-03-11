import { logger } from './utils/logger'
import { socketSubscribeVu, socketUnsubscribeVu } from './utils/vuServer'

import express from 'express'
import path from 'path'
import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'
const app = express()
const server = new Server(app)
const socketServer = new SocketServer(server)
const SERVER_PORT = 1176
const staticPath = path.join(
    path.dirname(require.resolve('client/package.json')),
    'dist'
)
logger.data(staticPath).debug('Express static file path:')
app.use('/', express.static(staticPath))
server.listen(SERVER_PORT)
logger.info(`Server started at http://localhost:${SERVER_PORT}`)

socketServer.on('connection', (socket: any) => {
    logger.info(`Client connected: ${socket.client.id}`)
    global.mainThreadHandler.socketServerHandlers(socket)

    socket.on('subscribe-vu-meter', () => {
        logger.debug('Socket subscribe vu')
        socketSubscribeVu(socket)
    })
    socket.on('disconnect', () => {
        socketUnsubscribeVu(socket)
    })
})

export const expressInit = () => {
    logger.info('Initialising WebServer')
}

export { socketServer }
