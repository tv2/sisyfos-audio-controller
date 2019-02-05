const defaultSettingsReducerState = [{
    oscPort: 8000,
    machineOscPort: 8001,
    mixer: {
        numberOfChannels: 8,
        numberOfSnaps: 8,
        fader: {
            min: 0,
            max: 1,
            zero: 0.75,
            setp: 0.01
        },
        meter: {
            min: 0,
            max: 0,
            zero: 0.75,
            test: 0.6
        }
    }
}];

export const settings = ((state = defaultSettingsReducerState, action) => {
    let { ...nextState } = state;

    switch(action.type) {
        case 'UPDATE_SETTINGS':
            return nextState;
        default:
            return nextState;
    }
});
