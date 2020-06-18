import {
    SET_COMPLETE_FADER_STATE,
    SET_VU_LEVEL,
    SET_SINGLE_FADER_STATE,
    SET_VU_REDUCTION_LEVEL,
} from '../../server/reducers/faderActions'
import {
    SET_COMPLETE_CH_STATE,
    SET_SINGLE_CH_STATE,
} from '../../server/reducers/channelActions'
import {
    UPDATE_SETTINGS,
    SET_MIXER_ONLINE,
    SET_SERVER_ONLINE,
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

export const socketClientHandlers = () => {
    window.socketIoClient
        .on('connect', () => {
            window.storeRedux.dispatch({
                type: SET_SERVER_ONLINE,
                serverOnline: true,
            })
            console.log('CONNECTED TO SISYFOS SERVER')
        })
        .on('disconnect', () => {
            window.storeRedux.dispatch({
                type: SET_SERVER_ONLINE,
                serverOnline: false,
            })
            console.log('LOST CONNECTION TO SISYFOS SERVER')
        })
        .on(SOCKET_SET_FULL_STORE, (payload: any) => {
            // console.log('STATE RECEIVED :', payload)

            let numberOfChannels: number[] = []
            if (window.mixerProtocol) {
                window.mixerProtocol.channelTypes.forEach(
                    (item: any, index: number) => {
                        numberOfChannels.push(
                            payload.settings[0].numberOfChannelsInType[index]
                        )
                    }
                )
                window.storeRedux.dispatch({
                    type: SET_COMPLETE_CH_STATE,
                    allState: payload.channels[0],
                    numberOfTypeChannels: numberOfChannels,
                })
                window.storeRedux.dispatch({
                    type: SET_COMPLETE_FADER_STATE,
                    allState: payload.faders[0],
                    numberOfTypeChannels: payload.settings[0].numberOfFaders,
                })
                window.storeRedux.dispatch({
                    type: SET_MIXER_ONLINE,
                    mixerOnline: payload.settings[0].mixerOnline,
                })
                window.storeRedux.dispatch({
                    type: SET_SERVER_ONLINE,
                    serverOnline: true,
                })
            }
        })
        .on('set-settings', (payload: any) => {
            // console.log('SETTINGS RECEIVED :', payload)
            window.storeRedux.dispatch({
                type: UPDATE_SETTINGS,
                settings: payload, // loadSettings(storeRedux.getState())
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
                type: SET_MIXER_ONLINE,
                mixerOnline: payload.mixerOnline,
            })
        })
        .on(SOCKET_SET_STORE_FADER, (payload: any) => {
            window.storeRedux.dispatch({
                type: SET_SINGLE_FADER_STATE,
                faderIndex: payload.faderIndex,
                state: payload.state,
            })
        })
        .on(SOCKET_SET_STORE_CHANNEL, (payload: any) => {
            window.storeRedux.dispatch({
                type: SET_SINGLE_CH_STATE,
                channelIndex: payload.channelIndex,
                state: payload.state,
            })
        })
        .on(SOCKET_SET_ALL_VU, (payload: any) => {
            payload.vuMeters.forEach((meterLevel: number, index: number) => {
                window.storeRedux.dispatch({
                    type: SET_VU_LEVEL,
                    channel: index,
                    level: meterLevel,
                })
            })
            payload.vuReductionMeters.forEach(
                (meterLevel: number, index: number) => {
                    window.storeRedux.dispatch({
                        type: SET_VU_REDUCTION_LEVEL,
                        channel: index,
                        level: meterLevel,
                    })
                }
            )
        })
        .on(SOCKET_SET_VU, (payload: any) => {
            window.storeRedux.dispatch({
                type: SET_VU_LEVEL,
                channel: payload.faderIndex,
                level: payload.level,
            })
        })
        .on(SOCKET_SET_VU_REDUCTION, (payload: any) => {
            window.storeRedux.dispatch({
                type: SET_VU_REDUCTION_LEVEL,
                channel: payload.faderIndex,
                level: payload.level,
            })
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
            window.customPagesList = payload
        })
}
