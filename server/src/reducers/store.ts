import storeRedux from '../../../shared/src/reducers/store'
import { storeUpdateSettings } from '../../../shared/src/actions/settingsActions'
import { loadSettings } from '../utils/SettingsStorage'

storeRedux.dispatch(storeUpdateSettings(loadSettings(storeRedux.getState())))

//Subscribe to redux store:
let state = storeRedux.getState()
const unsubscribe = storeRedux.subscribe(() => {
    state = storeRedux.getState()
})

export { storeRedux as store }
export { state }