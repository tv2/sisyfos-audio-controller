import {
    FaderActionTypes,
} from '../../../shared/src/actions/faderActions'
import {
    ChannelActionTypes,
} from '../../../shared/src/actions/channelActions'
import {
    SettingsActionTypes,
} from '../../../shared/src/actions/settingsActions'
import {
    SOCKET_RETURN_SNAPSHOT_LIST,
    SOCKET_SET_FULL_STORE,
    SOCKET_SET_STORE_FADER,
    SOCKET_SET_STORE_CHANNEL,
    SOCKET_RETURN_CCG_LIST,
    SOCKET_SET_MIXER_ONLINE,
    SOCKET_RETURN_MIXER_PRESET_LIST,
    SOCKET_RETURN_PAGES_LIST,
} from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import {
    ChMixerConnection,
    NumberOfChannels,
} from '../../../shared/src/reducers/channelsReducer'
import { VuType } from '../../../shared/src/utils/vu-server-types'
import { MixerSettings } from '../../../shared/src/reducers/settingsReducer'

export const vuMeters: number[][] = []

export const socketClientHandlers = () => {
    window.socketIoClient
        .on('connect', () => {
            window.storeRedux.dispatch({
                type: SettingsActionTypes.SET_SERVER_ONLINE,
                serverOnline: true,
            })
            console.log('CONNECTED TO SISYFOS SERVER')
            if (!window.location.search.includes('vu=0')) {
                // subscribe to VU'
                window.socketIoClient.emit(
                    'subscribe-vu-meter',
                    'subscribe to vu meters'
                )
            }
        })
        .on('disconnect', () => {
            window.storeRedux.dispatch({
                type: SettingsActionTypes.SET_SERVER_ONLINE,
                serverOnline: false,
            })
            console.log('LOST CONNECTION TO SISYFOS SERVER')
        })
        .on(SOCKET_SET_FULL_STORE, (payload: any) => {
            // console.log('STATE RECEIVED :', payload)
            if (window.mixerProtocol) {
                let numberOfChannels: NumberOfChannels[] = []
                payload.channels[0].chMixerConnection.forEach(
                    (
                        chMixerConnection: ChMixerConnection,
                        mixerIndex: number
                    ) => {
                        numberOfChannels.push({ numberOfTypeInCh: [] })
                        numberOfChannels[mixerIndex].numberOfTypeInCh = [
                            chMixerConnection.channel.length,
                        ]
                    }
                )
                window.storeRedux.dispatch({
                    type: ChannelActionTypes.SET_COMPLETE_CH_STATE,
                    numberOfTypeChannels: numberOfChannels,
                    allState: payload.channels[0],
                })
                window.storeRedux.dispatch({
                    type: FaderActionTypes.SET_COMPLETE_FADER_STATE,
                    allState: payload.faders[0],
                    numberOfFaders: payload.settings[0].numberOfFaders,
                })
                payload.settings[0].mixers.forEach(
                    (mixer: MixerSettings, i: number) => {
                        window.storeRedux.dispatch({
                            type: SettingsActionTypes.SET_MIXER_ONLINE,
                            mixerIndex: i,
                            mixerOnline: mixer.mixerOnline,
                        })
                    }
                )
                window.storeRedux.dispatch({
                    type: SettingsActionTypes.SET_SERVER_ONLINE,
                    serverOnline: true,
                })
            }
        })
        .on('set-settings', (payload: any) => {
            // console.log('SETTINGS RECEIVED :', payload)
            window.storeRedux.dispatch({
                type: SettingsActionTypes.UPDATE_SETTINGS,
                settings: payload,
            })
        })
        .on('set-mixerprotocol', (payload: any) => {
            // console.log('MIXERPROTOCOL RECEIVED :', payload)
            window.mixerProtocol = payload.mixerProtocol
            window.mixerProtocolPresets = payload.mixerProtocolPresets
            window.mixerProtocolList = payload.mixerProtocolList
        })
        .on(SOCKET_SET_MIXER_ONLINE, (payload: any) => {
            window.storeRedux.dispatch({
                type: SettingsActionTypes.SET_MIXER_ONLINE,
                mixerIndex: payload.mixerIndex,
                mixerOnline: payload.mixerOnline,
            })
        })
        .on(SOCKET_SET_STORE_FADER, (payload: any) => {
            if ('faderIndex' in payload && 'state' in payload) {
                window.storeRedux.dispatch({
                    type: FaderActionTypes.SET_SINGLE_FADER_STATE,
                    faderIndex: payload.faderIndex,
                    state: payload.state,
                })
            }
        })
        .on(SOCKET_SET_STORE_CHANNEL, (payload: any) => {
            window.storeRedux.dispatch(
                window.storeRedux.dispatch({
                    type: ChannelActionTypes.SET_SINGLE_CH_STATE,
                    channelIndex: payload.channelIndex,
                    state: payload.state,
                })
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
            window.storeRedux.dispatch({
                type: SettingsActionTypes.SET_PAGES_LIST,
                customPages: payload,
            })
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
                    window.reduxState.settings[0].showChanStrip ===
                        faderIndex ||
                    window.reduxState.settings[0].showChanStripFull ===
                        faderIndex
                ) {
                    window.storeRedux.dispatch({
                        type: FaderActionTypes.SET_VU_REDUCTION_LEVEL,
                        faderIndex: faderIndex,
                        level: level,
                    })
                }
            }
        )
}
