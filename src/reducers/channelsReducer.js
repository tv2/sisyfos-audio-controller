import * as DEFAULTS from '../constants/DEFAULTS';

const defaultChannelsReducerState = () => {
    let defaultObj = [{
        channel: [],
        vuMeters: []
    }];
    for (let i=0; i < DEFAULTS.NUMBER_OF_CHANNELS; i++) {
        defaultObj[0].channel.push({
                fadeActive: false,
                faderLevel: 0,
                label: "",
                outputLevel: 0.0,
                pgmOn: false,
                pstOn: false,
                showChannel: true,
                snapOn: [],
        });
        defaultObj[0].vuMeters.push({
            vuVal: 0.0
        });

        for (let y=0; y < DEFAULTS.NUMBER_OF_SNAPS; y++) {
            defaultObj[0].channel[i].snapOn.push(0.0);
        }
    }
    return defaultObj;
};

export const channels = ((state = defaultChannelsReducerState(), action) => {

    let nextState = [{
        vuMeters: [...state[0].vuMeters],
        channel: [...state[0].channel]
    }];

    switch(action.type) {
        case 'SET_COMPLETE_STATE':
            action.allState.channel.map((channel, index) => {
                if (index < DEFAULTS.NUMBER_OF_CHANNELS) {
                    nextState[0].channel[index] = channel;
                }
            });
            return nextState;
        case 'FADE_ACTIVE':
            nextState[0].channel[action.channel].fadeActive = action.active;
            return nextState;
        case 'SET_FADER_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].faderLevel = action.level;
            return nextState;
        case 'SET_OUTPUT_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].outputLevel = action.level;
            return nextState;
        case 'SET_VU_LEVEL': //channel:  level:
            nextState[0].vuMeters[action.channel].vuVal = action.level;
            return nextState;
        case 'SET_CHANNEL_LABEL': //channel:  label:
            nextState[0].channel[action.channel].label = action.label;
            return nextState;
        case 'TOGGLE_PGM': //channel
            nextState[0].channel[action.channel].pgmOn = !nextState[0].channel[action.channel].pgmOn;
            return nextState;
        case 'SET_PGM': //channel
            nextState[0].channel[action.channel].pgmOn = action.pgmOn;
            return nextState;
        case 'TOGGLE_PST': //channel
            nextState[0].channel[action.channel].pstOn = !nextState[0].channel[action.channel].pstOn;
            return nextState;
        case 'SET_PST': //channel
            nextState[0].channel[action.channel].pstOn = action.pstOn;
            return nextState;
        case 'SHOW_CHANNEL': //channel // showChannel
            nextState[0].channel[action.channel].showChannel = action.showChannel;
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
        case 'CLEAR_ALL_CHANNELS': //none
            nextState[0].channel.map((item, index) => {
                nextState[0].channel[index].pgmOn = false;
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
