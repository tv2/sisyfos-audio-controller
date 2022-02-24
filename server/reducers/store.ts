import storeRedux from '../../shared/reducers/store'
import { storeUpdateSettings } from '../../shared/actions/settingsActions'
import { loadSettings } from '../utils/SettingsStorage'

storeRedux.dispatch(storeUpdateSettings(loadSettings(storeRedux.getState())))

//Subscribe to redux store:
let state = storeRedux.getState()
const unsubscribe = storeRedux.subscribe(() => {
    state = storeRedux.getState()
})

export { storeRedux as store }
export { state }