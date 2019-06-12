import { combineReducers } from 'redux';
import { IChannels, channels} from './channelsReducer';
import { ISettings, settings } from './settingsReducer';

export interface IStore {
    settings: Array<ISettings>,
    channels: Array<IChannels>
};

const indexReducer = combineReducers({
    channels,
    settings
});

export default indexReducer;
