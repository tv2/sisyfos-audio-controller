import * as DEFAULTS from '../constants/DEFAULTS';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { 
    TOGGLE_SHOW_CHAN_STRIP,
    TOGGLE_SHOW_OPTION,
    TOGGLE_SHOW_SETTINGS,
    TOGGLE_SHOW_SNAPS,
    TOGGLE_SHOW_STORAGE,
    UPDATE_SETTINGS,
    SET_MIXER_ONLINE,
    TOGGLE_SHOW_MONITOR_OPTIONS
} from  '../reducers/settingsActions'

export interface ISettings {
    showSnaps: boolean,
    showSettings: boolean,
    showChanStrip: number,
    showOptions: number | false,
    showMonitorOptions: number,
    showStorage: boolean,
    mixerProtocol: string,
    localIp: string,
    localOscPort: number,
    deviceIp: string,
    devicePort: number,
    protocolLatency: number, // If a protocol has latency and feedback, the amount of time before enabling receiving data from channel again
    enableRemoteFader: boolean,
    mixerMidiInputPort: string,
    mixerMidiOutputPort: string,
    remoteFaderMidiInputPort: string,
    remoteFaderMidiOutputPort: string,
    numberOfChannelsInType: Array<number>,
    numberOfFaders: number,
    numberOfAux: number,
    nextSendAux: number,
    numberOfSnaps: number,
    fadeTime: number,  // Default fade time for PGM ON - OFF
    voFadeTime: number, // Default fade time for VO ON - OFF
    voLevel: number,  // Relative level of PGM in %
    autoResetLevel: number, // Autoreset before pgm on, if level is lower than in %
    automationMode: boolean,
    offtubeMode: boolean,
    showPfl: boolean,
    mixerOnline: boolean
}


const defaultSettingsReducerState: Array<ISettings> = [
    {
        showSnaps: false,
        showSettings: false,
        showChanStrip: -1,
        showOptions: false,
        showMonitorOptions: -1,
        showStorage: false,
        mixerProtocol: "sslSystemT",
        localIp: "0.0.0.0",
        localOscPort: 1234,
        deviceIp: "0.0.0.0",
        devicePort: 10024,
        protocolLatency: 220,
        enableRemoteFader: false,
        mixerMidiInputPort: "",
        mixerMidiOutputPort: "",
        remoteFaderMidiInputPort: "",
        remoteFaderMidiOutputPort: "",
        numberOfChannelsInType: [8],
        numberOfFaders: 8,
        numberOfAux: 0,
        nextSendAux: -1,
        numberOfSnaps: DEFAULTS.NUMBER_OF_SNAPS,
        voLevel: 30,
        autoResetLevel: 5,
        automationMode: true,
        offtubeMode: false,
        fadeTime: 120,
        voFadeTime: 280, 
        showPfl: false,
        mixerOnline: false
    },
];

export const settings = (state = defaultSettingsReducerState, action: any): Array<ISettings> => {
    let nextState = [Object.assign({}, state[0])];

    switch (action.type) {
        case TOGGLE_SHOW_SETTINGS:
            nextState[0].showSettings = !nextState[0].showSettings;
            return nextState;
        case TOGGLE_SHOW_CHAN_STRIP:
            if (nextState[0].showChanStrip !== action.channel) {
                nextState[0].showChanStrip = action.channel;
            }
            else {
                nextState[0].showChanStrip = -1;
            }
            return nextState;
        case TOGGLE_SHOW_MONITOR_OPTIONS:
                    if (nextState[0].showMonitorOptions !== action.channel) {
                        nextState[0].showMonitorOptions = action.channel;
                    }
                    else {
                        nextState[0].showMonitorOptions = -1;
                    }
                    return nextState;
        case TOGGLE_SHOW_OPTION:
            nextState[0].showOptions = typeof nextState[0].showOptions === 'number' ? false : action.channel;
            return nextState;
        case TOGGLE_SHOW_STORAGE:
            nextState[0].showStorage = !nextState[0].showStorage;
            return nextState;
        case TOGGLE_SHOW_SNAPS:
            nextState[0].showSnaps = !nextState[0].showSnaps;
            return nextState;
        case SET_MIXER_ONLINE:
            nextState[0].mixerOnline = action.mixerOnline;
            return nextState;
        case UPDATE_SETTINGS:
            nextState[0] = action.settings;
            nextState[0].showSettings = state[0].showSettings;
            nextState[0].showOptions = state[0].showOptions;
            nextState[0].showMonitorOptions = state[0].showMonitorOptions;
            nextState[0].showStorage = state[0].showStorage;
            nextState[0].showChanStrip = state[0].showChanStrip;
            if (typeof MixerProtocolPresets[nextState[0].mixerProtocol] === 'undefined')
                {
                    nextState[0].mixerProtocol = 'genericMidi';
                }
            return nextState;
        default:
            return nextState;
    }
};
