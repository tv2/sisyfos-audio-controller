import { SET_COMPLETE_FADER_STATE } from "../reducers/faderActions";
import { SET_COMPLETE_CH_STATE } from "../reducers/channelActions";
import { UPDATE_SETTINGS } from "../reducers/settingsActions";

export const ipcRendererHandlers = () => {
    window.ipcRenderer
    .on('set-store', (
        (event: any, payload: any) => { 
            // console.log('STATE RECEIVED :', payload)

            let numberOfChannels: number[] = []
            window.mixerProtocol.channelTypes.forEach((item: any, index: number) => {
                numberOfChannels.push(payload.settings[0].numberOfChannelsInType[index]);
            });
            window.storeRedux.dispatch({
                type: SET_COMPLETE_CH_STATE,
                allState: payload.channels[0],
                numberOfTypeChannels: numberOfChannels
            });
            window.storeRedux.dispatch({
                type:SET_COMPLETE_FADER_STATE,
                allState: payload.faders[0],
                numberOfTypeChannels: payload.settings[0].numberOfFaders
            });
        })
    )
    .on('set-settings', (
        (event: any, payload: any) => { 
            // console.log('SETTINGS RECEIVED :', payload)
            window.storeRedux.dispatch({
                type: UPDATE_SETTINGS,
                settings: payload // loadSettings(storeRedux.getState())
            });
        })
    )
    .on('set-mixerprotocol', (
        (event: any, payload: any) => { 
            // console.log('MIXERPROTOCOL RECEIVED :', payload)
            window.mixerProtocol = payload
        })
    )

}