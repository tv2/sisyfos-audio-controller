import * as DEFAULTS from '../utils/DEFAULTS';

const defaultChannelsReducerState = () => {
    let defaultObj = [{
        channel: []
    }];
    for (let i=0; i < DEFAULTS.NUMBER_OF_CHANNELS; i++) {
        defaultObj[0].channel.push({
                faderLevel: DEFAULTS.ZERO_FADER,
                label: "",
                outputLevel: 0.0,
                pgmOn: false,
                pstOn: false,
                snapOn: [],
                vuVal: 0.0,
        });
        for (let y=0; y < DEFAULTS.NUMBER_OF_SNAPS; y++) {
            defaultObj[0].channel[i].snapOn.push(0.0);
        }
    }
    return defaultObj;
};

export const channels = ((state = defaultChannelsReducerState(), action) => {

    let { ...nextState } = state;

    switch(action.type) {
        case 'SET_FADER_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].faderLevel = action.level;
            return nextState;
        case 'SET_OUTPUT_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].outputLevel = action.level;
            return nextState;
        case 'SET_VU_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].vuVal = action.level;
            return nextState;
        case 'SET_CHANNEL_LABEL': //channel:  label:
            nextState[0].channel[action.channel].label = action.label;
            return nextState;
        case 'FADE_IN': //channel:
            nextState[0].channel[action.channel].outputLevel = nextState[0].channel[action.channel].faderLevel;
            return nextState;
        case 'FADE_OUT': //channel
            nextState[0].channel[action.channel].outputLevel = DEFAULTS.MIN_FADER;
            return nextState;
        case 'SET_PGM': //channel
            nextState[0].channel[action.channel].pgmOn = !nextState[0].channel[action.channel].pgmOn;
            return nextState;
        case 'SET_PST': //channel
            nextState[0].channel[action.channel].pstOn = !nextState[0].channel[action.channel].pstOn;
            return nextState;
        case 'SET_SNAP': //channel //snapIndex
            nextState[0].channel[action.channel].snapOn[action.snapIndex] = !nextState[0].channel[action.channel].snapOn[action.snapIndex];
            return nextState;
        case 'X_MIX': //none
            nextState[0].channel.map((item, index) => {
                let nextPgmOn = state[0].channel[index].pstOn;
                nextState[0].channel[index].pstOn = state[0].channel[index].pgmOn;
                nextState[0].channel[index].pgmOn = nextPgmOn;
            });
            return nextState;
        case 'SNAP_MIX': //snapIndex
            nextState[0].channel.map((item, index) => {
                nextState[0].channel[index].pstOn = state[0].channel[index].snapOn[action.snapIndex];
            });
            return nextState;
        default:
            return nextState;
    }
});
