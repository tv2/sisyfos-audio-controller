import { SET_COMPLETE_FADER_STATE, SET_VU_LEVEL } from "../../server/reducers/faderActions";
import { SET_COMPLETE_CH_STATE } from "../../server/reducers/channelActions";
import { UPDATE_SETTINGS, SET_MIXER_ONLINE } from "../../server/reducers/settingsActions";
import { SOCKET_SET_VU, SOCKET_RETURN_SNAPSHOT_LIST } from "../../server/constants/SOCKET_IO_DISPATCHERS";

export const socketClientHandlers = () => {
    window.socketIoClient
    .on('set-store', (
        (payload: any) => { 
            // console.log('STATE RECEIVED :', payload)

            let numberOfChannels: number[] = []
            if(window.mixerProtocol) {
                window.mixerProtocol.channelTypes.forEach((item: any, index: number) => {
                    numberOfChannels.push(payload.settings[0].numberOfChannelsInType[index]);
                })
                window.storeRedux.dispatch({
                    type: SET_COMPLETE_CH_STATE,
                    allState: payload.channels[0],
                    numberOfTypeChannels: numberOfChannels
                })
                window.storeRedux.dispatch({
                    type:SET_COMPLETE_FADER_STATE,
                    allState: payload.faders[0],
                    numberOfTypeChannels: payload.settings[0].numberOfFaders
                })
                window.storeRedux.dispatch({
                    type: SET_MIXER_ONLINE,
                    mixerOnline: payload.settings[0].mixerOnline
                })

            }

        })
    )
    .on('set-settings', (
        (payload: any) => { 
            // console.log('SETTINGS RECEIVED :', payload)
            window.storeRedux.dispatch({
                type: UPDATE_SETTINGS,
                settings: payload // loadSettings(storeRedux.getState())
            });
        })
    )
    .on('set-mixerprotocol', (
        (payload: any) => { 
            // console.log('MIXERPROTOCOL RECEIVED :', payload)
            window.mixerProtocol = payload.mixerProtocol
            window.mixerProtocolPresets = payload.mixerProtocolPresets
            window.mixerProtocolList = payload.mixerProtocolList
        })
    )
    .on(SOCKET_SET_VU, (
        (payload: any) => { 
            // console.log('MIXERPROTOCOL RECEIVED :', payload)
            window.storeRedux.dispatch({
                type:SET_VU_LEVEL,
                channel: payload.faderIndex,
                level: payload.level
            });
        })
    )
    .on(SOCKET_RETURN_SNAPSHOT_LIST, (
        (payload: any) => { 
            // console.log('MIXERPROTOCOL RECEIVED :', payload)
            window.snapshotFileList = payload
        })
    )
}