import {
    storeSetCompleteFaderState,
    storeSetSingleFaderState,
    storeVuLevel,
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
    SOCKET_SET_VU,
    SOCKET_RETURN_SNAPSHOT_LIST,
    SOCKET_SET_FULL_STORE,
    SOCKET_SET_STORE_FADER,
    SOCKET_SET_STORE_CHANNEL,
    SOCKET_RETURN_CCG_LIST,
    SOCKET_SET_VU_REDUCTION,
    SOCKET_SET_MIXER_ONLINE,
    SOCKET_SET_ALL_VU,
    SOCKET_RETURN_MIXER_PRESET_LIST,
    SOCKET_RETURN_PAGES_LIST,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
import {
    IchConnection,
    InumberOfChannels,
} from '../../server/reducers/channelsReducer'

export const socketClientHandlers = () => {
    let vuUpdateSpeed = Date.now()
    let vuReductionUpdateSpeed = Date.now()
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
        .on(SOCKET_SET_ALL_VU, (payload: any) => {
            if (Date.now() - vuUpdateSpeed > 100) {
                vuUpdateSpeed = Date.now()
                payload.vuMeters.forEach(
                    (meterLevel: number, index: number) => {
                        window.storeRedux.dispatch(
                            storeVuLevel(index, meterLevel)
                        )
                    }
                )
                payload.vuReductionMeters.forEach(
                    (meterLevel: number, index: number) => {
                        window.storeRedux.dispatch(
                            storeVuReductionLevel(index, meterLevel)
                        )
                    }
                )
            }
        })
        .on(SOCKET_SET_VU, (payload: any) => {
            if (Date.now() - vuUpdateSpeed > 100) {
                vuUpdateSpeed = Date.now()

                window.storeRedux.dispatch(
                    storeVuLevel(payload.faderIndex, payload.level)
                )
            }
        })
        .on(SOCKET_SET_VU_REDUCTION, (payload: any) => {
            if (Date.now() - vuReductionUpdateSpeed > 100) {
                vuReductionUpdateSpeed = Date.now()
                window.storeRedux.dispatch(
                    storeVuReductionLevel(payload.faderIndex, payload.level)
                )
            }
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
}
