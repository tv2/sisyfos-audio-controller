import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS } from './reducers/settingsActions'
import { loadSettings } from './utils/SettingsStorage'

export class MainThreadHandlers {
    webContents: any
    store: any

    constructor(webContents: any) {
        this. webContents = webContents
        const storeRedux = createStore(
            indexReducer
        );
        // @ts-ignore
        global.storeRedux = storeRedux;
        
        
        storeRedux.dispatch({
            type:UPDATE_SETTINGS,
            settings: loadSettings(storeRedux.getState())
        });
        //Get redux store:
        this.store = storeRedux.getState();
        const unsubscribe = storeRedux.subscribe(() => {
            this.store = storeRedux.getState();
        });
        this.ipcHandler()
    }

    ipcHandler() {
          // initiate 
        this.webContents.send('to-renderer', 'Start up ipcHandlers')
        this.webContents.send('settings', this.store.settings[0])
        
    }
}