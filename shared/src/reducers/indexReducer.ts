import { combineReducers } from 'redux'
import { channels } from './channelsReducer'
import { settings } from './settingsReducer'
import { faders } from './fadersReducer'

const indexReducer = combineReducers({
    faders,
    channels,
    settings,
})

export default indexReducer
