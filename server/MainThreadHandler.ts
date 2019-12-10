import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS } from './reducers/settingsActions'
import { loadSettings } from './utils/SettingsStorage'
import { ipcMain } from 'electron';

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

    ipcMainHandler() {
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
}