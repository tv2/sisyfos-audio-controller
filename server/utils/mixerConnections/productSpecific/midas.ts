import { store, state } from '../../../reducers/store'
import { socketServer } from '../../../expressHandler'

import {
    storeVuLevel,
    storeVuReductionLevel,
} from '../../../reducers/faderActions'
import { SOCKET_SET_ALL_VU } from '../../../constants/SOCKET_IO_DISPATCHERS'
import { faders, IVuMeters } from '../../../reducers/fadersReducer'

export const midasMeter = (mixerIndex: number, message: any) => {
    const DATA_OFFSET = 4
    let uint8bytes = Uint8Array.from(message[0])
    let dataview = new DataView(uint8bytes.buffer)
    let level: number
    let reductionLevel: number
    let assignedFader: number
    let vuMeters: number[] = new Array(Number(state.settings[0].numberOfFaders))
    let vuReductionMeters: number[] = new Array(
        Number(state.settings[0].numberOfFaders)
    )
    let numberOfChannels =
        state.settings[0].mixers[mixerIndex].numberOfChannelsInType[0]

    for (let i = 0; i < numberOfChannels; i++) {
        level = dataview.getFloat32(4 * i + DATA_OFFSET, true)
        reductionLevel = dataview.getFloat32(4 * (i + 64) + DATA_OFFSET, true)
        assignedFader =
            state.channels[0].chConnection[mixerIndex].channel[i].assignedFader
        if (assignedFader < state.settings[0].numberOfFaders) {
            store.dispatch(storeVuLevel(assignedFader, level))
            reductionLevel = 1 - reductionLevel
            store.dispatch(storeVuReductionLevel(assignedFader, reductionLevel))
        }
    }
    state.faders[0].vuMeters.forEach((meter: IVuMeters, index: number) => {
        vuMeters[index] = meter.vuVal
        vuReductionMeters[index] = meter.reductionVal
    })
    socketServer.emit(SOCKET_SET_ALL_VU, {
        vuMeters: vuMeters,
        vuReductionMeters: vuReductionMeters,
    })
}
