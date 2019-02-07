const defaultSettingsReducerState = [
    {
        showSnaps: false,
        showSettingsPage: false,
        oscPort: 8000,
        machineOscIp: "0.0.0.0",
        machineOscPort: 8001,
        numberOfChannels: 8,
        numberOfSnaps: 8,
        fader: {
            min: 0,
            max: 1,
            zero: 0.75,
            step: 0.01,
        },
        meter: {
            min: 0,
            max: 1,
            zero: 0.75,
            test: 0.6,
        },
    },
];

export const settings = (state = defaultSettingsReducerState, action) => {
    let {...nextState} = state;

    switch (action.type) {
        case 'TOGGLE_SHOW_SETTINGS':
        return nextState;
        case 'TOGGLE_SHOW_SNAPS':
        nextState[0].showSnaps = !nextState[0].showSnaps;
        return nextState;
        default:
        return nextState;
    }
};
