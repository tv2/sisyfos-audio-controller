import { store, state } from '../../../reducers/store'
import { socketServer } from '../../../expressHandler'

import {
    SET_VU_REDUCTION_LEVEL,
    SET_VU_LEVEL,
} from '../../../reducers/faderActions'
import { SOCKET_SET_ALL_VU } from '../../../constants/SOCKET_IO_DISPATCHERS'

export const midasMeter = (message: any) => {
    const DATA_OFFSET = 4
    let uint8bytes = Uint8Array.from(message[0])
    let dataview = new DataView(uint8bytes.buffer)
    let vuMeters = []
    let vuReductionMeters = []
    let level: number
    let reductionLevel: number
    let numberOfChannels = state.settings[0].numberOfChannelsInType[0]

    for (let i = 0; i < numberOfChannels; i++) {
        level = dataview.getFloat32(4 * i + DATA_OFFSET, true)
        reductionLevel = dataview.getFloat32(4 * (i + 64) + DATA_OFFSET, true)

        vuMeters.push(level)
        store.dispatch({
            type: SET_VU_LEVEL,
            channel: i,
            level: level,
        })

        vuReductionMeters.push(reductionLevel)
        reductionLevel = 1 - reductionLevel
        store.dispatch({
            type: SET_VU_REDUCTION_LEVEL,
            channel: i,
            level: reductionLevel,
        })
    }
    socketServer.emit(SOCKET_SET_ALL_VU, {
        vuMeters: vuMeters,
        vuReductionMeters: vuReductionMeters,
    })
}
