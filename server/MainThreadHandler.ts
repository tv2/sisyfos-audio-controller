import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS, TOGGLE_SHOW_MONITOR_OPTIONS, TOGGLE_SHOW_OPTION, TOGGLE_SHOW_CHAN_STRIP } from './reducers/settingsActions'
import { loadSettings, saveSettings } from './utils/SettingsStorage'
import { IPC_TOGGLE_PGM, IPC_TOGGLE_VO, IPC_TOGGLE_PST, IPC_TOGGLE_PFL, IPC_TOGGLE_MUTE, IPC_SET_FADERLEVEL, IPC_TOGGLE_SHOW_CH_STRIP, IPC_TOGGLE_SHOW_OPTION, IPC_SAVE_SETTINGS } from '../server/constants/IPC_DISPATCHERS'
import { TOGGLE_PGM, TOGGLE_VO, TOGGLE_PST, TOGGLE_PFL, TOGGLE_MUTE } from './reducers/faderActions';
import { SET_FADER_LEVEL } from './reducers/faderActions';

export class MainThreadHandlers {
    store: any

    constructor() {
        console.log('Creating MainThreadHandlers')

        global.storeRedux = createStore(
            indexReducer
        );
        
        global.storeRedux.dispatch({
            type:UPDATE_SETTINGS,
            settings: loadSettings(global.storeRedux.getState())
        });
        //Get redux store:
        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
        });
        this.ipcMainHandlers()
        this.ipcChannelHandlers()
        this.ipcControlHandlers()
    }

    ipcMainHandlers() {
        console.log('SETTING UP IPC MAIN HANDLERS')

        // get-store get-settings and get-mixerprotocol will be replaces with
        // serverside Redux middleware emitter when moved to Socket IO:
        global.socketServer
        .on('get-store', (
            (event: any, payload: any) => { 
                //console.log('Data received : ', payload)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on('get-settings', (
            (event: any, payload: any) => { 
                //console.log('Data received :', payload)
                global.socketServer.emit('set-settings', loadSettings(global.storeRedux.getState()))
            })
        )
        .on('get-mixerprotocol', (
            (event: any, payload: any) => { 
                //console.log('Data received', payload)
                global.socketServer.emit('set-mixerprotocol', 
                    {
                        'mixerProtocol': global.mixerProtocol,
                        'mixerProtocolPresets': global.mixerProtocolPresets,
                        'mixerProtocolList': global.mixerProtocolList,

                    })
            })
        )
        .on(IPC_SAVE_SETTINGS, (
            (event: any, payload: any) => { 
                console.log('Save settings :', payload)
                saveSettings(payload)
            })
        )
    }

    ipcChannelHandlers() {
        global.socketServer
        .on(IPC_TOGGLE_PGM, (
            (event: any, faderIndex: any) => {
                global.mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                global.storeRedux.dispatch({
                    type: TOGGLE_PGM,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateOutLevel(faderIndex)
            })
        )
        .on(IPC_TOGGLE_VO, (
            (event: any, faderIndex: any) => {
                global.mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                global.storeRedux.dispatch({
                    type: TOGGLE_VO,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateOutLevel(faderIndex)
            })
        )
        .on(IPC_TOGGLE_PST, (
            (event: any, faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_PST,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateNextAux(faderIndex);
        
            })
        )
        .on(IPC_TOGGLE_PFL, (
            (event: any, faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_PFL,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updatePflState(faderIndex);
        
            })
        )
        .on(IPC_TOGGLE_MUTE, (
            (event: any, faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_MUTE,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateMuteState(faderIndex);
        
            })
        )
        .on(IPC_SET_FADERLEVEL, (
            (event: any, payload: any) => {
                global.storeRedux.dispatch({
                    type: SET_FADER_LEVEL,
                    channel: payload.faderIndex,
                    level: parseFloat(payload.level)
                });
                global.mixerGenericConnection.updateOutLevel(payload.faderIndex)
        
            })
        )
    }

    ipcControlHandlers() {
        global.socketServer
        .on(IPC_TOGGLE_SHOW_CH_STRIP, (
            (event: any, faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_SHOW_CHAN_STRIP,
                    channel: faderIndex
                })
            })
        )
        .on(IPC_TOGGLE_SHOW_OPTION, (
            (event: any, faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_SHOW_OPTION,
                    channel: faderIndex
                })
                global.storeRedux.dispatch({
                    type: TOGGLE_SHOW_CHAN_STRIP,
                    channel: -1
                })
            })
        )
    }
}