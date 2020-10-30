import { vuServer } from '../expressHandler'

export enum VuType {
    Channel = 'channel',
    Reduction = 'reduction',
}

export function sendVuLevel(
    faderIndex: number,
    type: VuType,
    channelIndex: number,
    level: number
) {
    vuServer.emit(type, faderIndex, channelIndex, level)
}
