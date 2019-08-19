import * as DEFAULTS from '../constants/DEFAULTS';

export interface IFaders {
    fader: Array<IFader>,
    vuMeters: Array<IVuMeters>,
}

export interface IFader {
    faderLevel: number,
    label: string,
    pgmOn: boolean,
    pstOn: boolean,
    pflOn: boolean,
    showChannel: boolean,
    snapOn: Array<boolean>,
}

interface IVuMeters {
    vuVal: number
}

const defaultFadersReducerState = (numberOfTypeChannels: Array<number>) => {
    let defaultObj: Array<IFaders> = [{
        fader: [],
        vuMeters: [],
    }];

    let totalNumberOfFaders = 8;

        for (let index=0; index < totalNumberOfFaders; index++) {
            defaultObj[0].fader[index] = ({
                faderLevel: 0,
                label: "",
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
                defaultObj[0].fader[totalNumberOfFaders].snapOn.push(false);
            }
        }
    return defaultObj;
};

export const channels = ((state = defaultFadersReducerState([1]), action: any): Array<IFaders> => {

    let nextState = [{
        vuMeters: [...state[0].vuMeters],
        fader: [...state[0].fader],
    }];

    switch(action.type) {
        case 'SET_VU_LEVEL': //channel:  level:
            if (typeof nextState[0].vuMeters[action.channel] != 'undefined') {
                nextState[0].vuMeters[action.channel].vuVal = parseFloat(action.level);
            }
            return nextState;
        case 'SET_COMPLETE_STATE': //allState  //numberOfChannels
            nextState = defaultFadersReducerState(action.numberOfTypeChannels);
            if (action.allState.channel.length == nextState[0].fader.length) {
                action.allState.channel.map((channel: any, index: number) => {
                    nextState[0].fader[index] = channel;
                });
            }
            return nextState;
        case 'SET_FADER_LEVEL': //channel:  level:
            nextState[0].fader[action.channel].faderLevel = parseFloat(action.level);
            return nextState;
        case 'SET_ALL_VU_LEVELS': //channel:  level:
            nextState[0].vuMeters = action.vuMeters;
            return nextState;
        case 'SET_CHANNEL_LABEL': //channel:  label:
            nextState[0].fader[action.channel].label = action.label;
            return nextState;
        case 'TOGGLE_PGM': //channel
            nextState[0].fader[action.channel].pgmOn = !nextState[0].fader[action.channel].pgmOn;
            return nextState;
        case 'SET_PGM': //channel
            nextState[0].fader[action.channel].pgmOn = !!action.pgmOn;
            return nextState;
        case 'TOGGLE_PST': //channel
            nextState[0].fader[action.channel].pstOn = !nextState[0].fader[action.channel].pstOn;
            return nextState;
        case 'SET_PST': //channel
            nextState[0].fader[action.channel].pstOn = !!action.pstOn;
            return nextState;
        case 'TOGGLE_PFL': //channel
            nextState[0].fader[action.channel].pflOn = !nextState[0].fader[action.channel].pflOn;
            return nextState;
        case 'SET_PFL': //channel
            nextState[0].fader[action.channel].pflOn = !!action.pflOn;
            return nextState;
        case 'SHOW_CHANNEL': //channel // showChannel
            nextState[0].fader[action.channel].showChannel = !!action.showChannel;
            return nextState;
        case 'SET_SNAP': //channel //snapIndex
            nextState[0].fader[action.channel].snapOn[action.snapIndex] = !nextState[0].fader[action.channel].snapOn[action.snapIndex];
            return nextState;
        case 'X_MIX': //none
            nextState[0].fader.map((item, index) => {
                let nextPgmOn = state[0].fader[index].pstOn;
                nextState[0].fader[index].pstOn = state[0].fader[index].pgmOn;
                nextState[0].fader[index].pgmOn = nextPgmOn;
            });
            return nextState;
        case 'FADE_TO_BLACK': //none
            nextState[0].fader.map((item, index) => {
                nextState[0].fader[index].pgmOn = false;
            });
            return nextState;
        case 'SNAP_RECALL': //snapIndex
            nextState[0].fader.map((item, index) => {
                nextState[0].fader[index].pstOn = !!state[0].fader[index].snapOn[action.snapIndex];
            });
            return nextState;
        default:
            return nextState;
    }
});
