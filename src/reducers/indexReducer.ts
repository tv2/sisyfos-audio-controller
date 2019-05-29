import { combineReducers } from 'redux';
import { Channels, channels} from './channelsReducer';
import { Settings, settings } from './settingsReducer';

export interface Store {
    settings: Array<Settings>,
    channels: Array<Channels>
};

const indexReducer = combineReducers({
    settings,
    channels
});

export default indexReducer;
