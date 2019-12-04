import { createStore } from 'redux'
import indexReducer from './reducers/indexReducer';
import { UPDATE_SETTINGS } from './reducers/settingsActions'
import { loadSettings } from './utils/SettingsStorage'

export class MainThreadHandlers {
    constructor() {
        const storeRedux = createStore(
            indexReducer
        );
        // @ts-ignore
        global.storeRedux = storeRedux;
        
        
        storeRedux.dispatch({
            type:UPDATE_SETTINGS,
            settings: loadSettings(storeRedux.getState())
        });
    }
}