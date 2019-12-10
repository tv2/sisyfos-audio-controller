import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS, TOGGLE_SHOW_MONITOR_OPTIONS, TOGGLE_SHOW_OPTION, TOGGLE_SHOW_CHAN_STRIP } from './reducers/settingsActions'
import { loadSettings } from './utils/SettingsStorage'
import { ipcMain } from 'electron';
import { IPC_TOGGLE_PGM, IPC_TOGGLE_VO, IPC_TOGGLE_PST, IPC_TOGGLE_PFL, IPC_TOGGLE_MUTE, IPC_SET_FADERLEVEL, IPC_TOGGLE_SHOW_CH_STRIP, IPC_TOGGLE_SHOW_OPTION } from '../server/constants/IPC_DISPATCHERS'
import { TOGGLE_PGM, TOGGLE_VO, TOGGLE_PST, TOGGLE_PFL, TOGGLE_MUTE } from './reducers/faderActions';
import { SET_FADER_LEVEL } from '../src/reducers/faderActions';

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

        // initiate 
        ipcMain
        .on('get-store', (
            (event: any, payload: any) => { 
                console.log('Data received : ', payload)
                global.mainWindow.webContents.send('set-store', global.storeRedux.getState())
            })
        )
        .on('get-settings', (
            (event: any, payload: any) => { 
                console.log('Data received :', payload)
                global.mainWindow.webContents.send('set-settings', loadSettings(global.storeRedux.getState()))
            })
        )
        .on('get-mixerprotocol', (
            (event: any, payload: any) => { 
                console.log('Data received', payload)
                global.mainWindow.webContents.send('set-mixerprotocol', global.mixerProtocol)
            })
        )
    }

    ipcChannelHandlers() {
        ipcMain
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
        ipcMain
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