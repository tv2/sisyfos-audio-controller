import * as DEFAULTS from '../constants/DEFAULTS';

export interface IChannels {
    channel: Array<IChannel>,
    vuMeters: Array<IVuMeters>,
}

export interface IChannel {
    channelType: number,
    channelTypeIndex: number,
    fadeActive: boolean,
    faderLevel: number,
    label: string,
    outputLevel: number,
    pgmOn: boolean,
    pstOn: boolean,
    pflOn: boolean,
    showChannel: boolean,
    snapOn: Array<boolean>
}

interface IVuMeters {
    vuVal: number
}

const defaultChannelsReducerState = (numberOfTypeChannels: Array<number>) => {
    let defaultObj: Array<IChannels> = [{
        channel: [],
        vuMeters: [],
    }];

    let totalNumberOfChannels = 0;
    numberOfTypeChannels.forEach((numberOfChannels, typeIndex) => {
        for (let index=0; index < numberOfChannels; index++) {
            defaultObj[0].channel[totalNumberOfChannels] = ({
                channelType: typeIndex,
                channelTypeIndex: index,
                fadeActive: false,
                faderLevel: 0,
                label: "",
                outputLevel: 0.0,
                pgmOn: false,
                pstOn: false,
                pflOn: false,
                showChannel: true,
                snapOn: [],
            });
            defaultObj[0].vuMeters.push({
                vuVal: 0.0
            });
            for (let y=0; y < DEFAULTS.NUMBER_OF_SNAPS; y++) {
                defaultObj[0].channel[totalNumberOfChannels].snapOn.push(false);
            }
            totalNumberOfChannels ++;
        }
    })
    return defaultObj;
};

export const channels = ((state = defaultChannelsReducerState([1]), action: any): Array<IChannels> => {

    let nextState = [{
        vuMeters: [...state[0].vuMeters],
        channel: [...state[0].channel],
    }];

    switch(action.type) {
        case 'SET_OUTPUT_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].outputLevel = parseFloat(action.level);
            return nextState;
        case 'SET_VU_LEVEL': //channel:  level:
            if (typeof nextState[0].vuMeters[action.channel] != 'undefined') {
                nextState[0].vuMeters[action.channel].vuVal = parseFloat(action.level);
            }
            return nextState;
        case 'SET_COMPLETE_STATE': //allState  //numberOfChannels
            nextState = defaultChannelsReducerState(action.numberOfTypeChannels);
            if (action.allState.channel.length == nextState[0].channel.length) {
                action.allState.channel.map((channel: any, index: number) => {
                    if (index < action.numberOfTypeChannels[0]) {
                        nextState[0].channel[index] = channel;
                    }
                });
            }
            return nextState;
        case 'FADE_ACTIVE':
            nextState[0].channel[action.channel].fadeActive = !!action.active;
            return nextState;
        case 'SET_FADER_LEVEL': //channel:  level:
            nextState[0].channel[action.channel].faderLevel = parseFloat(action.level);
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
            nextState[0].channel[action.channel].pgmOn = !!action.pgmOn;
            return nextState;
        case 'TOGGLE_PST': //channel
            nextState[0].channel[action.channel].pstOn = !nextState[0].channel[action.channel].pstOn;
            return nextState;
        case 'SET_PST': //channel
            nextState[0].channel[action.channel].pstOn = !!action.pstOn;
            return nextState;
        case 'TOGGLE_PFL': //channel
            nextState[0].channel[action.channel].pflOn = !nextState[0].channel[action.channel].pflOn;
            return nextState;
        case 'SET_PFL': //channel
            nextState[0].channel[action.channel].pflOn = !!action.pflOn;
            return nextState;
        case 'SHOW_CHANNEL': //channel // showChannel
            nextState[0].channel[action.channel].showChannel = !!action.showChannel;
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
        case 'FADE_TO_BLACK': //none
            nextState[0].channel.map((item, index) => {
                nextState[0].channel[index].pgmOn = false;
            });
            return nextState;
        case 'SNAP_RECALL': //snapIndex
            nextState[0].channel.map((item, index) => {
                nextState[0].channel[index].pstOn = !!state[0].channel[index].snapOn[action.snapIndex];
            });
            return nextState;
        default:
            return nextState;
    }
});
