import * as DEFAULTS from '../utils/DEFAULTS';

const defaultSettingsReducerState = [
    {
        showSnaps: false,
        showSettings: false,
        oscPreset: "reaper",
        localOscIp: "0.0.0.0",
        localOscPort: 8000,
        machineOscIp: "0.0.0.0",
        machineOscPort: 8001,
        numberOfChannels: DEFAULTS.NUMBER_OF_CHANNELS,
        numberOfSnaps: DEFAULTS.NUMBER_OF_SNAPS
    },
];

export const settings = (state = defaultSettingsReducerState, action) => {
    let {...nextState} = state;

    switch (action.type) {
        case 'TOGGLE_SHOW_SETTINGS':
            nextState[0].showSettings = !nextState[0].showSettings;
            return nextState;
        case 'TOGGLE_SHOW_SNAPS':
            nextState[0].showSnaps = !nextState[0].showSnaps;
            return nextState;
            case 'UPDATE_SETTINGS':
            nextState[0] = action.settings;
            return nextState;

        default:
        return nextState;
    }
};
