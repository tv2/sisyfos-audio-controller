import { state } from '../../../reducers/store'
import { sendVuLevel } from '../../vuServer'
import { VuType } from '../../../../../shared/src/utils/vu-server-types'

const calcVuLevel = (level: number) => {
    return Math.log(level) / Math.log(600) + 1
}

export const midasMeter = (mixerIndex: number, message: any, faderIndex: number) => {
    const DATA_OFFSET = 4
    let uint8bytes = Uint8Array.from(message[0])
    let dataview = new DataView(uint8bytes.buffer)
    let level: number
    let reductionLevel: number
    let numberOfChannels =
        state.settings[0].mixers[mixerIndex].numberOfChannelsInType[0]

    for (let ch = 0; ch < numberOfChannels; ch++) {
        if (
            faderIndex >= 0 &&
            faderIndex < state.settings[0].numberOfFaders
        ) {
            level = calcVuLevel(dataview.getFloat32(4 * ch + DATA_OFFSET, true))
            reductionLevel = dataview.getFloat32(
                4 * (ch + 64) + DATA_OFFSET,
                true
            )
            let vuIndex: number = state.faders[0].fader[
                faderIndex
            ].assignedChannels?.findIndex((assigned) => {
                return (
                    assigned.mixerIndex === mixerIndex &&
                    assigned.channelIndex === ch
                )
            })
            if (vuIndex === -1) vuIndex = 0
            sendVuLevel(faderIndex, VuType.Channel, vuIndex, level)
            sendVuLevel(faderIndex, VuType.Reduction, 0, 1 - reductionLevel)
        }
    }
}
