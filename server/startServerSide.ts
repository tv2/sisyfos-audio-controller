import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS } from './reducers/settingsActions'
import { loadSettings } from './utils/SettingsStorage'
import { MainApp } from './components/MainApp'

export class MainThreadHandlers {
    webContents: any
    store: any

    constructor(webContents: any) {
        this. webContents = webContents
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

    ipcHandler() {
        // initiate 
        this.webContents.on('get-settings', (
            (event: any, payload: any) => { 
                console.log('Data received', payload)
                event.reply('get-settings', loadSettings(this.store.getState()))
            })
        )
        this.webContents.send('get-settings', 'Start up ipcHandlers')
        this.webContents.send('to-renderer', 'Start up ipcHandlers')
        let app = new MainApp(this.webContents)
    }
}