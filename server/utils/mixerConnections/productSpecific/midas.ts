import { state } from '../../../reducers/store'
import { sendVuLevel, VuType } from '../../vuServer'

export const midasMeter = (mixerIndex: number, message: any) => {
    const DATA_OFFSET = 4
    let uint8bytes = Uint8Array.from(message[0])
    let dataview = new DataView(uint8bytes.buffer)
    let level: number
    let reductionLevel: number
    let assignedFader: number
    let numberOfChannels =
        state.settings[0].mixers[mixerIndex].numberOfChannelsInType[0]

    for (let i = 0; i < numberOfChannels; i++) {
        level = dataview.getFloat32(4 * i + DATA_OFFSET, true)
        reductionLevel = dataview.getFloat32(4 * (i + 64) + DATA_OFFSET, true)
        assignedFader =
            state.channels[0].chConnection[mixerIndex].channel[i].assignedFader
        if (assignedFader < state.settings[0].numberOfFaders) {
            sendVuLevel(assignedFader, VuType.Channel, 0, level)
            sendVuLevel(assignedFader, VuType.Reduction, 0, 1 - reductionLevel)
        }
    }
}
