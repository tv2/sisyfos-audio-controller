import { configureStore } from '@reduxjs/toolkit'
import { IFaders } from './fadersReducer'
import { IChannels } from './channelsReducer'
import indexReducer from './indexReducer'
import { ISettings } from './settingsReducer'

export interface IStore {
  settings: Array<ISettings>
  channels: Array<IChannels>
  faders: Array<IFaders>
}

export default configureStore({reducer: indexReducer})
export { Store } from 'redux'