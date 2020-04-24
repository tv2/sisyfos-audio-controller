import { createStore } from 'redux'
import indexReducer from './indexReducer'
import { UPDATE_SETTINGS } from './settingsActions'
import { loadSettings } from '../utils/SettingsStorage'

let storeRedux = createStore(indexReducer)

storeRedux.dispatch({
    type: UPDATE_SETTINGS,
    settings: loadSettings(storeRedux.getState()),
})

//Subscribe to redux store:
let state = storeRedux.getState()
const unsubscribe = storeRedux.subscribe(() => {
    state = storeRedux.getState()
})

export { storeRedux as store }
export { state }
