import { combineReducers } from 'redux'
import { IChannels, channels } from './channelsReducer'
import { ISettings, settings } from './settingsReducer'
import { IFaders, faders } from './fadersReducer'
import { FaderActions } from '../actions/faderActions'
import { ChannelActions } from '../actions/channelActions'
import { SettingsActions } from '../actions/settingsActions'

const indexReducer = combineReducers<{
    faders: (state: IFaders[] | undefined, action: FaderActions) => IFaders[]
    channels: (
        state: IChannels[] | undefined,
        action: ChannelActions
    ) => IChannels[]
    settings: (
        state: ISettings[] | undefined,
        action: SettingsActions
    ) => ISettings[]
}>({
    faders,
    channels,
    settings,
})

export default indexReducer
