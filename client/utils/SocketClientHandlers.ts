import {
    storeSetCompleteFaderState,
    storeSetSingleFaderState,
    storeVuReductionLevel,
} from '../../server/reducers/faderActions'
import {
    storeSetCompleteChState,
    storeSetSingleChState,
} from '../../server/reducers/channelActions'
import {
    storeSetMixerOnline,
    storeSetServerOnline,
    storeUpdatePagesList,
    storeUpdateSettings,
} from '../../server/reducers/settingsActions'
import {
    SOCKET_RETURN_SNAPSHOT_LIST,
    SOCKET_SET_FULL_STORE,
    SOCKET_SET_STORE_FADER,
    SOCKET_SET_STORE_CHANNEL,
    SOCKET_RETURN_CCG_LIST,
    SOCKET_SET_MIXER_ONLINE,
    SOCKET_RETURN_MIXER_PRESET_LIST,
    SOCKET_RETURN_PAGES_LIST,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
import {
    IchConnection,
    InumberOfChannels,
} from '../../server/reducers/channelsReducer'
import { VuType } from '../../server/utils/vuServer'
import { state } from '../../server/reducers/store'

export const vuMeters: number[][] = []

export const socketClientHandlers = () => {
    window.socketIoClient
        .on('connect', () => {
            window.storeRedux.dispatch(storeSetServerOnline(true))
            console.log('CONNECTED TO SISYFOS SERVER')
        })
        .on('disconnect', () => {
            window.storeRedux.dispatch(storeSetServerOnline(false))
            console.log('LOST CONNECTION TO SISYFOS SERVER')
        })
        .on(SOCKET_SET_FULL_STORE, (payload: any) => {
            // console.log('STATE RECEIVED :', payload)
            if (window.mixerProtocol) {
                let numberOfChannels: InumberOfChannels[] = []
                payload.channels[0].chConnection.forEach(
                    (chConnection: IchConnection, mixerIndex: number) => {
                        numberOfChannels.push({ numberOfTypeInCh: [] })
                        numberOfChannels[mixerIndex].numberOfTypeInCh = [
                            chConnection.channel.length,
                        ]
                    }
                )
                window.storeRedux.dispatch(
                    storeSetCompleteChState(
                        payload.channels[0],
                        numberOfChannels
                    )
                )
                window.storeRedux.dispatch(
                    storeSetCompleteFaderState(
                        payload.faders[0],
                        payload.settings[0].numberOfFaders
                    )
                )
                window.storeRedux.dispatch(
                    storeSetMixerOnline(
                        payload.settings[0].mixers[0].mixerOnline
                    )
                )
                window.storeRedux.dispatch(storeSetServerOnline(true))
            }
        })
        .on('set-settings', (payload: any) => {
            // console.log('SETTINGS RECEIVED :', payload)
            window.storeRedux.dispatch(storeUpdateSettings(payload))
        })
        .on('set-mixerprotocol', (payload: any) => {
            // console.log('MIXERPROTOCOL RECEIVED :', payload)
            window.mixerProtocol = payload.mixerProtocol
            window.mixerProtocolPresets = payload.mixerProtocolPresets
            window.mixerProtocolList = payload.mixerProtocolList
        })
        .on(SOCKET_SET_MIXER_ONLINE, (payload: any) => {
            window.storeRedux.dispatch(storeSetMixerOnline(payload.mixerOnline))
        })
        .on(SOCKET_SET_STORE_FADER, (payload: any) => {
            window.storeRedux.dispatch(
                storeSetSingleFaderState(payload.faderIndex, payload.state)
            )
        })
        .on(SOCKET_SET_STORE_CHANNEL, (payload: any) => {
            window.storeRedux.dispatch(
                storeSetSingleChState(payload.channelIndex, payload.state)
            )
        })
        .on(SOCKET_RETURN_SNAPSHOT_LIST, (payload: any) => {
            window.snapshotFileList = payload
        })
        .on(SOCKET_RETURN_CCG_LIST, (payload: any) => {
            window.ccgFileList = payload
        })
        .on(SOCKET_RETURN_MIXER_PRESET_LIST, (payload: any) => {
            window.mixerPresetList = payload
        })
        .on(SOCKET_RETURN_PAGES_LIST, (payload: any) => {
            window.storeRedux.dispatch(storeUpdatePagesList(payload))
        })
        .on(
            VuType.Channel,
            (faderIndex: number, channelIndex: number, level: number) => {
                if (!vuMeters[faderIndex]) vuMeters[faderIndex] = []
                vuMeters[faderIndex][channelIndex] = level
            }
        )
        .on(
            VuType.Reduction,
            (faderIndex: number, channelIndex: number, level: number) => {
                if (
                    state.settings[0].showChanStrip === faderIndex &&
                    state.settings[0].showChanStripFull === faderIndex
                ) {
                    window.storeRedux.dispatch(
                        storeVuReductionLevel(faderIndex, level)
                    )
                }
            }
        )
}
