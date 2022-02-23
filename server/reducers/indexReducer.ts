import { combineReducers } from 'redux'
import { channels } from '../../shared/reducers/channelsReducer'
import { settings } from '../../shared/reducers/settingsReducer'
import { faders } from '../../shared/reducers/fadersReducer'

const indexReducer = combineReducers({
    faders,
    channels,
    settings,
})

export default indexReducer
