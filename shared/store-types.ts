import { IChannels } from "./channel-types";
import { IFaders } from "./faders-types";
import { ISettings } from "./reducers/settingsReducer";

export interface IStore {
  settings: Array<ISettings>
  channels: Array<IChannels>
  faders: Array<IFaders>
}
