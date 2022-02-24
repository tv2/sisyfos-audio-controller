import { createStore } from 'redux'
import indexReducer from './indexReducer'
import { storeUpdateSettings } from '../../shared/actions/settingsActions'
import { loadSettings } from '../utils/SettingsStorage'

let storeRedux = createStore(indexReducer)

storeRedux.dispatch(storeUpdateSettings(loadSettings(storeRedux.getState())))

//Subscribe to redux store:
let state = storeRedux.getState()
const unsubscribe = storeRedux.subscribe(() => {
    state = storeRedux.getState()
})

export { storeRedux as store }
export { state }