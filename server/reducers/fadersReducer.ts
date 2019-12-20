import * as DEFAULTS from '../constants/DEFAULTS';
import {
    CLEAR_PST,
    FADE_TO_BLACK,
    NEXT_MIX,
    SET_ALL_VU_LEVELS,
    SET_CHANNEL_LABEL,
    SET_COMPLETE_FADER_STATE,
    SET_FADER_LEVEL,
    SET_MUTE,
    SET_PFL,
    SET_PGM,
    SET_PST,
    SET_PST_VO,
    TOGGLE_SNAP,
    SET_VO,
    SET_VU_LEVEL,
    SHOW_CHANNEL,
    IGNORE_AUTOMATION,
    SNAP_RECALL,
    TOGGLE_MUTE,
    TOGGLE_PFL,
    TOGGLE_PGM,
    TOGGLE_PST,
    TOGGLE_VO,
    X_MIX,
    SET_FADER_THRESHOLD,
    SET_FADER_RATIO,
    SET_FADER_LOW,
    SET_FADER_MID,
    SET_FADER_HIGH,
    SET_FADER_MONITOR
} from '../reducers/faderActions'

export interface IFaders {
    fader: Array<IFader>,
    vuMeters: Array<IVuMeters>,
}

export interface IFader {
    faderLevel: number,
    label: string,
    pgmOn: boolean,
    voOn: boolean,
    pstOn: boolean,
    pstVoOn: boolean,
    pflOn: boolean,
    muteOn: boolean,
    low: number,
    mid: number,
    high: number,
    threshold: number,
    ratio: number,
    monitor: number,
    showChannel: boolean,
    ignoreAutomation: boolean,
    snapOn: Array<boolean>,
}

export interface IVuMeters {
    vuVal: number
}

const defaultFadersReducerState = (numberOfFaders: number): IFaders[] => {
    let defaultObj: Array<IFaders> = [{
        fader: [],
        vuMeters: [],
    }];


    for (let index=0; index < numberOfFaders; index++) {
            defaultObj[0].fader[index] = ({
                faderLevel: 0.75,
                label: "",
                pgmOn: false,
                voOn: false,
                pstOn: false,
                pstVoOn: false,
                pflOn: false,
                muteOn: false,
                low: 0.75,
                mid: 0.75,
                high: 0.75,
                threshold: 0.75,
                ratio: 0.75,
                monitor: (index + 1), // route fader - aux 1:1 as default
                showChannel: true,
                ignoreAutomation: false,
                snapOn: [],
            });
            defaultObj[0].vuMeters.push({
                vuVal: 0.0
            });
            for (let y=0; y < DEFAULTS.NUMBER_OF_SNAPS; y++) {
                defaultObj[0].fader[index].snapOn.push(false);
            }
        }
    return defaultObj;
};

export const faders = ((state = defaultFadersReducerState(0), action: any): Array<IFaders> => {

    let nextState = [{
        vuMeters: [...state[0].vuMeters],
        fader: [...state[0].fader],
    }];

    switch(action.type) {
        case SET_VU_LEVEL: //channel:  level:
            if (typeof nextState[0].vuMeters[action.channel] !== 'undefined') {
                nextState[0].vuMeters[action.channel].vuVal = parseFloat(action.level);
            }
            return nextState;
        case SET_COMPLETE_FADER_STATE: //allState  //numberOfChannels
            let emptyState = defaultFadersReducerState(action.numberOfTypeChannels)
            if (emptyState[0].vuMeters.length === nextState[0].vuMeters.length) {
                emptyState[0].vuMeters = [...state[0].vuMeters]
            }
            nextState = emptyState
            if (action.allState.fader.length == nextState[0].fader.length) {
                action.allState.fader.map((channel: any, index: number) => {
                    nextState[0].fader[index] = channel;
                });
            }
            return nextState;
        case SET_FADER_LEVEL: //channel:  level:
            nextState[0].fader[action.channel].faderLevel = parseFloat(action.level);
            return nextState;
        case SET_FADER_THRESHOLD: //channel:  level:
            nextState[0].fader[action.channel].threshold = parseFloat(action.level);
            return nextState;
        case SET_FADER_RATIO: //channel:  level:
            nextState[0].fader[action.channel].ratio = parseFloat(action.level);
            return nextState;
        case SET_FADER_LOW: //channel:  level:
            nextState[0].fader[action.channel].low = parseFloat(action.level);
            return nextState;
        case SET_FADER_MID: //channel:  level:
            nextState[0].fader[action.channel].mid = parseFloat(action.level);
            return nextState;
        case SET_FADER_HIGH: //channel:  level:
            nextState[0].fader[action.channel].high = parseFloat(action.level);
            return nextState;
        case SET_FADER_MONITOR: //channel:  auxIndex:
            nextState[0].fader[action.channel].monitor = action.auxIndex;
            return nextState;
        case SET_ALL_VU_LEVELS: //channel:  level:
            nextState[0].vuMeters = action.vuMeters;
            return nextState;
        case SET_CHANNEL_LABEL: //channel:  label:
            nextState[0].fader[action.channel].label = action.label;
            return nextState;
        case TOGGLE_PGM: //channel
            nextState[0].fader[action.channel].pgmOn = !nextState[0].fader[action.channel].pgmOn;
            nextState[0].fader[action.channel].voOn = false;
            return nextState;
        case SET_PGM: //channel
            nextState[0].fader[action.channel].pgmOn = !!action.pgmOn;
            nextState[0].fader[action.channel].voOn = false;
            return nextState;
        case TOGGLE_VO: //channel
            nextState[0].fader[action.channel].voOn = !nextState[0].fader[action.channel].voOn;
            nextState[0].fader[action.channel].pgmOn = false;
            return nextState;
        case SET_VO: //channel
            nextState[0].fader[action.channel].voOn = !!action.voOn;
            nextState[0].fader[action.channel].pgmOn = false;
            return nextState;
        case TOGGLE_PST: //channel
            if (nextState[0].fader[action.channel].pstOn) {
                nextState[0].fader[action.channel].pstOn = false;
                // Disable toggle to pstVoOn, to enable change pstVoOn: true here:
                nextState[0].fader[action.channel].pstVoOn = false;
            } else if (nextState[0].fader[action.channel].pstVoOn) {
                nextState[0].fader[action.channel].pstOn = false;
                nextState[0].fader[action.channel].pstVoOn = false;
            } else {
                nextState[0].fader[action.channel].pstOn = true;
                nextState[0].fader[action.channel].pstVoOn = false;
            }
            return nextState;
        case SET_PST: //channel
            nextState[0].fader[action.channel].pstOn = !!action.pstOn;
            nextState[0].fader[action.channel].pstVoOn = false;
            return nextState;
        case SET_PST_VO: //channel
            nextState[0].fader[action.channel].pstVoOn = !!action.pstVoOn;
            nextState[0].fader[action.channel].pstOn = false;
            return nextState;
        case TOGGLE_PFL: //channel
            nextState[0].fader[action.channel].pflOn = !nextState[0].fader[action.channel].pflOn;
            return nextState;
        case SET_PFL: //channel
            nextState[0].fader[action.channel].pflOn = !!action.pflOn;
            return nextState;
        case TOGGLE_MUTE: //channel
            nextState[0].fader[action.channel].muteOn = !nextState[0].fader[action.channel].muteOn;
            return nextState;
        case SET_MUTE: //channel
            nextState[0].fader[action.channel].muteOn = !!action.muteOn;
            return nextState;
        case SHOW_CHANNEL: //channel // showChannel
            nextState[0].fader[action.channel].showChannel = !!action.showChannel;
            return nextState;
        case IGNORE_AUTOMATION: //channel // ignoreAutomation
            nextState[0].fader[action.channel].ignoreAutomation = !nextState[0].fader[action.channel].ignoreAutomation
            return nextState;
        case TOGGLE_SNAP: //channel //snapIndex
            nextState[0].fader[action.channel].snapOn[action.snapIndex] = !nextState[0].fader[action.channel].snapOn[action.snapIndex];
            return nextState;
        case X_MIX: //none
            nextState[0].fader.map((item, index) => {
                let nextPgmOn = state[0].fader[index].pstOn;
                let nextVoOn = state[0].fader[index].pstVoOn;
                nextState[0].fader[index].pstOn = state[0].fader[index].pgmOn;
                nextState[0].fader[index].pstVoOn = state[0].fader[index].voOn;
                nextState[0].fader[index].pgmOn = nextPgmOn;
                nextState[0].fader[index].voOn = nextVoOn;
            });
            return nextState;
        case NEXT_MIX: //none
            nextState[0].fader.map((item, index) => {
                nextState[0].fader[index].pgmOn = state[0].fader[index].pstOn;
                nextState[0].fader[index].voOn = state[0].fader[index].pstVoOn;
                nextState[0].fader[index].pstOn = false;
                nextState[0].fader[index].pstVoOn = false;
            });
            return nextState;
        case FADE_TO_BLACK: //none
            nextState[0].fader.map((item, index) => {
                nextState[0].fader[index].pgmOn = false;
                nextState[0].fader[index].voOn = false;
            });
            return nextState;
        case CLEAR_PST: //none
            nextState[0].fader.map((item, index) => {
                nextState[0].fader[index].pstOn = false;
                nextState[0].fader[index].pstVoOn = false;
            });
            return nextState;
        case SNAP_RECALL: //snapIndex
            nextState[0].fader.map((item, index) => {
                nextState[0].fader[index].pstOn = !!state[0].fader[index].snapOn[action.snapIndex];
            });
            return nextState;
        default:
            return nextState;
    }
});
