import { combineReducers } from 'redux'
import { Channels, channels } from './channelsReducer'
import { Settings, settings } from './settingsReducer'
import { Faders, faders } from './fadersReducer'
import { FaderActions } from '../actions/faderActions'
import { ChannelActions } from '../actions/channelActions'
import { SettingsActions } from '../actions/settingsActions'

const indexReducer = combineReducers<{
    faders: (state: Faders[] | undefined, action: FaderActions) => Faders[]
    channels: (
        state: Channels[] | undefined,
        action: ChannelActions
    ) => Channels[]
    settings: (
        state: Settings[] | undefined,
        action: SettingsActions
    ) => Settings[]
}>({
    faders,
    channels,
    settings,
})

export default indexReducer
