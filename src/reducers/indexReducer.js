import { combineReducers } from 'redux';
import { channels} from './channelsReducer';
import { settings } from './settingsReducer';

const indexReducer = combineReducers({
    settings,
    channels
});

export default indexReducer;
