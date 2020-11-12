export enum VuType {
    Channel = 'vuChannel',
    Reduction = 'vuReduction',
}

const sockets: Array<any> = []

export function socketSubscribeVu(socket: any) {
    const i = sockets.indexOf(socket)
    if (i === -1) {
        sockets.push(socket)
    }
}

export function socketUnsubscribeVu(socket: any) {
    const i = sockets.indexOf(socket)
    if (i) {
        sockets.splice(i, 1)
    }
}

export function sendVuLevel(
    faderIndex: number,
    type: VuType,
    channelIndex: number,
    level: number
) {
    sockets.forEach((socket) => {
        socket.emit(type, faderIndex, channelIndex, level)
    })
}
