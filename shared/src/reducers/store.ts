import { createStore } from 'redux'
import { IFaders } from './fadersReducer'
import { IChannels } from './channelsReducer'
import indexReducer from './indexReducer'
import { ISettings } from './settingsReducer'

export interface IStore {
  settings: Array<ISettings>
  channels: Array<IChannels>
  faders: Array<IFaders>
}

export default createStore(indexReducer)
export { Store } from 'redux'