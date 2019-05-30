import * as DEFAULTS from '../constants/DEFAULTS';

export interface IChannels {
    channel: Array<IChannel>,
    vuMeters: Array<IVuMeters>,
    grpFader: Array<IChannel>,
    grpVuMeters: Array<IVuMeters>,
}

interface IChannel {
    fadeActive: boolean,
    faderLevel: number,
    label: string,
    outputLevel: number,
    pgmOn: boolean,
    pstOn: boolean,
    showChannel: boolean,
    snapOn: Array<boolean>,
}

interface IVuMeters {
    vuVal: number
}

const defaultChannelsReducerState = (numberOfChannels: number) => {
    let defaultObj: Array<IChannels> = [];

    for (let i=0; i < numberOfChannels; i++) {
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
            defaultObj[0].channel[i].snapOn.push(false);
        }
    }
    for (let i=0; i < DEFAULTS.NUMBER_OF_GROUP_FADERS; i++) {
        defaultObj[0].grpFader.push({
            fadeActive: false,
            faderLevel: 0,
            label: "",
            outputLevel: 0.0,
            pgmOn: false,
            pstOn: false,
            showChannel: true,
            snapOn: [],
        });
        defaultObj[0].grpVuMeters.push({
            vuVal: 0.0
        });
    }
    return defaultObj;
};

export const channels = ((state = defaultChannelsReducerState(1), action: any): Array<IChannels> => {

    let nextState = [{
        vuMeters: [...state[0].vuMeters],
        channel: [...state[0].channel],
        grpFader: [...state[0].grpFader],
        grpVuMeters: [...state[0].grpVuMeters]
    }];

    switch(action.type) {
        case 'SET_COMPLETE_STATE': //allState  //numberOfChannels
            nextState = defaultChannelsReducerState(action.numberOfChannels);
            action.allState.channel.map((channel: any, index: number) => {
                if (index < action.numberOfChannels) {
                    nextState[0].channel[index] = channel;
                }
            });
            action.allState.grpFader.map((grpFader: IChannel, index: number) => {
                if (index < DEFAULTS.NUMBER_OF_GROUP_FADERS) {
                    nextState[0].grpFader[index] = grpFader;
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
            if (typeof nextState[0].vuMeters[action.channel] != 'undefined') {
                nextState[0].vuMeters[action.channel].vuVal = action.level;
            }
            return nextState;
        case 'SET_ALL_VU_LEVELS': //channel:  level:
            nextState[0].vuMeters = action.vuMeters;
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
            nextState[0].grpFader.map((item, index) => {
                let nextPgmOn = state[0].grpFader[index].pstOn;
                nextState[0].grpFader[index].pstOn = state[0].grpFader[index].pgmOn;
                nextState[0].grpFader[index].pgmOn = nextPgmOn;
            });
            return nextState;
        case 'FADE_TO_BLACK': //none
            nextState[0].channel.map((item, index) => {
                nextState[0].channel[index].pgmOn = false;
            });
            nextState[0].grpFader.map((item, index) => {
                nextState[0].grpFader[index].pgmOn = false;
            });
            return nextState;
        case 'SNAP_RECALL': //snapIndex
            nextState[0].channel.map((item, index) => {
                nextState[0].channel[index].pstOn = state[0].channel[index].snapOn[action.snapIndex];
            });
            return nextState;
        case 'FADE_GRP_ACTIVE':
            nextState[0].grpFader[action.channel].fadeActive = action.active;
            return nextState;
        case 'SET_GRP_FADER_LEVEL': //channel:  level:
            nextState[0].grpFader[action.channel].faderLevel = action.level;
            return nextState;
        case 'SET_GRP_OUTPUT_LEVEL': //channel:  level:
            nextState[0].grpFader[action.channel].outputLevel = action.level;
            return nextState;
        case 'SET_GRP_VU_LEVEL': //channel:  level:
            if (typeof nextState[0].grpVuMeters[action.channel] != 'undefined') {
                nextState[0].grpVuMeters[action.channel].vuVal = action.level;
            }
            return nextState;
        case 'SET_ALL_GRP_VU_LEVELS': //channel:  level:
            nextState[0].grpVuMeters = action.grpVuMeters;
            return nextState;
        case 'SET_GRP_LABEL': //channel:  label:
            nextState[0].grpFader[action.channel].label = action.label;
            return nextState;
        case 'TOGGLE_GRP_PGM': //channel
            nextState[0].grpFader[action.channel].pgmOn = !nextState[0].grpFader[action.channel].pgmOn;
            return nextState;
        case 'SET_GRP_PGM': //channel
            nextState[0].grpFader[action.channel].pgmOn = action.pgmOn;
            return nextState;
        case 'TOGGLE_GRP_PST': //channel
            nextState[0].grpFader[action.channel].pstOn = !nextState[0].grpFader[action.channel].pstOn;
            return nextState;
        case 'SET_GRP_PST': //channel
            nextState[0].grpFader[action.channel].pstOn = action.pstOn;
            return nextState;
        case 'SHOW_GRP_FADER': //channel // showChannel
            nextState[0].grpFader[action.channel].showChannel = action.showChannel;
            return nextState;
        default:
            return nextState;
    }
});
