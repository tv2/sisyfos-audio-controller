const sockets: Array<any> = []

export function socketSubscribeOutputLevel(socket: any) {
    const i = sockets.indexOf(socket)
    if (i === -1) {
        sockets.push(socket)
    }
}

export function socketUnsubscribeOutputLevel(socket: any) {
    const i = sockets.indexOf(socket)
    if (i >= 0) {
        sockets.splice(i, 1)
    }
}

export function sendChLevelsToOuputServer(
    mixerIndex: number,
    channelIndex: number,
    level: number
) {
    sockets.forEach((socket) => {
        socket.emit('outputLevel', mixerIndex, channelIndex, level)
    })
}
