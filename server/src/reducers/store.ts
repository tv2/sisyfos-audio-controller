import storeRedux from '../../../shared/src/reducers/store'
import {
    SettingsActionTypes,
    SettingsActions,
} from '../../../shared/src/actions/settingsActions'
import { loadSettings } from '../utils/SettingsStorage'
import { Dispatch } from 'redux'

const dispatch: Dispatch<SettingsActions> = storeRedux.dispatch
dispatch({
    type: SettingsActionTypes.UPDATE_SETTINGS,
    settings: loadSettings(storeRedux.getState()),
})

//Subscribe to redux store:
let state = storeRedux.getState()
const unsubscribe = storeRedux.subscribe(() => {
    state = storeRedux.getState()
})

export { storeRedux as store }
export { state }
