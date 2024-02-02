import { logger } from './utils/logger'
import { socketSubscribeVu, socketUnsubscribeVu } from './utils/vuServer'
import { socketSubscribeOutputLevel, socketUnsubscribeOutputLevel } from './utils/outputLevelServer'

import express from 'express'
import path from 'path'
import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'
const ROOT_PATH = process.env.ROOT_PATH ?? '/'
const SOCKET_SERVER_PATH =
    ROOT_PATH + (ROOT_PATH.endsWith('/') ? '' : '/') + 'socket.io/'
const app = express()
const server = new Server(app)
const socketServer = new SocketServer(server, {
    path: SOCKET_SERVER_PATH,
})
const SERVER_PORT = 1176
const staticPath = path.join(
    path.dirname(require.resolve('client/package.json')),
    'dist'
)
logger.data(staticPath).debug('Express static file path:')
app.use(ROOT_PATH, express.static(staticPath))
server.listen(SERVER_PORT)
logger.info(`Server started at http://localhost:${SERVER_PORT}${ROOT_PATH}`)

socketServer.on('connection', (socket: any) => {
    logger.info(`Client connected: ${socket.client.id}`)
    global.mainThreadHandler.socketServerHandlers(socket)

    socket.on('subscribe-vu-meter', () => {
        logger.debug('Socket subscribe vu')
        socketSubscribeVu(socket)
    })
    socket.on('subscribe-output-level', () => {
        logger.debug('Socket subscribe output')
        socketSubscribeOutputLevel(socket)
    })
    socket.on('disconnect', () => {
        socketUnsubscribeVu(socket)
        socketUnsubscribeOutputLevel(socket)
    })
})

export const expressInit = () => {
    logger.info('Initialising WebServer')
}

export { socketServer }
