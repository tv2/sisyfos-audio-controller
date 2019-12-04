import { combineReducers } from 'redux';
import { IChannels, channels} from './channelsReducer';
import { ISettings, settings } from './settingsReducer';
import {  IFaders, faders,  } from './fadersReducer';

export interface IStore {
    settings: Array<ISettings>,
    channels: Array<IChannels>,
    faders: Array<IFaders>
};

const indexReducer = combineReducers({
    faders,
    channels,
    settings
});

export default indexReducer;
