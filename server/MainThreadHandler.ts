import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS } from './reducers/settingsActions'
import { loadSettings, saveSettings, getSnapShotList } from './utils/SettingsStorage'
import { 
    SOCKET_TOGGLE_PGM, 
    SOCKET_TOGGLE_VO, 
    SOCKET_TOGGLE_PST, 
    SOCKET_TOGGLE_PFL, 
    SOCKET_TOGGLE_MUTE, 
    SOCKET_SET_FADERLEVEL, 
    SOCKET_SAVE_SETTINGS, 
    SOCKET_GET_SNAPSHOT_LIST, 
    SOCKET_RETURN_SNAPSHOT_LIST, 
    SOCKET_LOAD_SNAPSHOT, 
    SOCKET_SAVE_SNAPSHOT,
    SOCKET_SET_ASSIGNED_FADER,
    SOCKET_SET_AUX_LEVEL,
    SOCKET_NEXT_MIX,
    SOCKET_CLEAR_PST,
    SOCKET_SET_THRESHOLD,
    SOCKET_SET_RATIO,
    SOCKET_SET_LOW,
    SOCKET_SET_MID,
    SOCKET_SET_HIGH,
    SOCKET_RESTART_SERVER,
    SOCKET_SET_FADER_MONITOR,
    SOCKET_TOGGLE_IGNORE
 } from './constants/SOCKET_IO_DISPATCHERS'
import { 
    TOGGLE_PGM, 
    TOGGLE_VO, 
    TOGGLE_PST, 
    TOGGLE_PFL, 
    TOGGLE_MUTE, 
    NEXT_MIX, 
    CLEAR_PST, 
    SET_FADER_THRESHOLD, 
    SET_FADER_RATIO, 
    SET_FADER_LOW, 
    SET_FADER_MID, 
    SET_FADER_HIGH, 
    SET_FADER_MONITOR,
    IGNORE_AUTOMATION
} from './reducers/faderActions';
import { SET_FADER_LEVEL } from './reducers/faderActions';
import { SET_ASSIGNED_FADER, SET_AUX_LEVEL } from './reducers/channelActions';
const path = require('path')

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
    }

    socketServerHandlers(socket: any) {
        console.log('SETTING UP SOCKET IO MAIN HANDLERS')

        // get-store get-settings and get-mixerprotocol will be replaces with
        // serverside Redux middleware emitter when moved to Socket IO:
        socket
        .on('get-store', (
            (payload: any) => { 
                // console.log('Settings initial store on :', socket.client.id)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on('get-settings', (
            (payload: any) => { 
                //console.log('Data received :', payload)
                global.socketServer.emit('set-settings', loadSettings(global.storeRedux.getState()))
            })
        )
        .on('get-mixerprotocol', (
            (payload: any) => { 
                //console.log('Data received', payload)
                global.socketServer.emit('set-mixerprotocol', 
                    {
                        'mixerProtocol': global.mixerProtocol,
                        'mixerProtocolPresets': global.mixerProtocolPresets,
                        'mixerProtocolList': global.mixerProtocolList,

                    }
                )
            })
        )
        .on(SOCKET_GET_SNAPSHOT_LIST, (
            () => { 
                console.log('Get snapshot list')
                global.socketServer.emit(
                    SOCKET_RETURN_SNAPSHOT_LIST, 
                    getSnapShotList()
                )
            })
        )
        .on(SOCKET_LOAD_SNAPSHOT, (
            (payload: string) => { 
                console.log('Load Snapshot')
                global.mainApp.loadSnapshotSettings(path.resolve('storage', payload), false)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SAVE_SNAPSHOT, (
            (payload: string) => { 
                console.log('Save Snapshot')
                global.mainApp.saveSnapshotSettings(path.resolve('storage', payload))

                global.socketServer.emit(
                    SOCKET_RETURN_SNAPSHOT_LIST, 
                    getSnapShotList()
                )
            })
        )
        .on(SOCKET_SAVE_SETTINGS, (
            (payload: any) => { 
                console.log('Save settings :', payload)
                saveSettings(payload)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_RESTART_SERVER, (
            () => { 
                process.exit(0)
            })
        )
        .on(SOCKET_SET_ASSIGNED_FADER, (
            (payload: any) => { 
                console.log('Set assigned fader. Channel:', payload.channel, 'Fader :', payload.faderAssign)
                global.storeRedux.dispatch({
                    type: SET_ASSIGNED_FADER,
                    channel: payload.channel,
                    faderNumber: payload.faderAssign
                })
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_FADER_MONITOR, (
            (payload: any) => { 
                global.storeRedux.dispatch({
                    type: SET_FADER_MONITOR,
                    channel: payload.faderIndex,
                    auxIndex: payload.auxIndex
                });
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_AUX_LEVEL, (
            (payload: any) => { 
                //console.log('Set Auxlevel Channel:', payload.channel)
                global.storeRedux.dispatch({
                    type: SET_AUX_LEVEL,
                    channel: payload.channel,
                    auxIndex: payload.auxIndex,
                    level: payload.level
                });                
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_THRESHOLD, (
            (payload: any) => { 
                //console.log('Set Threshold:', payload.channel)
                global.storeRedux.dispatch({
                    type: SET_FADER_THRESHOLD,
                    channel: payload.channel,
                    level: payload.level
                });
                global.mixerGenericConnection.updateThreshold(payload.channel);               
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_RATIO, (
            (payload: any) => { 
                //console.log('Set Ratio:', payload.channel)
                global.storeRedux.dispatch({
                    type: SET_FADER_RATIO,
                    channel: payload.channel,
                    level: payload.level
                });
                global.mixerGenericConnection.updateRatio(payload.channel);               
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_LOW, (
            (payload: any) => { 
                //console.log('Set Low:', payload.channel)
                global.storeRedux.dispatch({
                    type: SET_FADER_LOW,
                    channel: payload.channel,
                    level: payload.level
                });
                global.mixerGenericConnection.updateLow(payload.channel);               
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_MID, (
            (payload: any) => { 
                //console.log('Set Mid:', payload.level, ' On channelIndex :', payload.channel)
                global.storeRedux.dispatch({
                    type: SET_FADER_MID,
                    channel: payload.channel,
                    level: payload.level
                });
                global.mixerGenericConnection.updateMid(payload.channel);               
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_HIGH, (
            (payload: any) => { 
                //console.log('Set High:', payload.channel)
                global.storeRedux.dispatch({
                    type: SET_FADER_HIGH,
                    channel: payload.channel,
                    level: payload.level
                });
                global.mixerGenericConnection.updateHigh(payload.channel);               
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_NEXT_MIX, (
            () => {
                global.storeRedux.dispatch({
                    type: NEXT_MIX
                });
                global.mixerGenericConnection.updateOutLevels()
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_CLEAR_PST, (
            () => {
                global.storeRedux.dispatch({
                    type: CLEAR_PST
                });
                global.mixerGenericConnection.updateOutLevels()
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_TOGGLE_PGM, (
            (faderIndex: any) => {
                global.mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                global.storeRedux.dispatch({
                    type: TOGGLE_PGM,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateOutLevel(faderIndex)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_TOGGLE_VO, (
            (faderIndex: any) => {
                global.mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                global.storeRedux.dispatch({
                    type: TOGGLE_VO,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateOutLevel(faderIndex)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_TOGGLE_PST, (
            (faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_PST,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateNextAux(faderIndex);
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_TOGGLE_PFL, (
            (faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_PFL,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updatePflState(faderIndex);
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_TOGGLE_MUTE, (
            (faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: TOGGLE_MUTE,
                    channel: faderIndex
                });
                global.mixerGenericConnection.updateMuteState(faderIndex);
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_TOGGLE_IGNORE, (
            (faderIndex: any) => {
                global.storeRedux.dispatch({
                    type: IGNORE_AUTOMATION,
                    channel: faderIndex
                });
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
        .on(SOCKET_SET_FADERLEVEL, (
            (payload: any) => {
                global.storeRedux.dispatch({
                    type: SET_FADER_LEVEL,
                    channel: payload.faderIndex,
                    level: parseFloat(payload.level)
                });
                global.mixerGenericConnection.updateOutLevel(payload.faderIndex)
                global.socketServer.emit('set-store', global.storeRedux.getState())
            })
        )
    }
}