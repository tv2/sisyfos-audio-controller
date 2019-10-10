import * as DEFAULTS from '../constants/DEFAULTS';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';

export interface ISettings {
    showSnaps: boolean,
    showSettings: boolean,
    showOptions: number | false,
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
    numberOfSnaps: number,
    fadeTime: number,  // Default fade time for PGM ON - OFF
    voLevel: number,  // Relative level of PGM in %
    autoResetLevel: number, // Autoreset before pgm on, if level is lower than in %
    automationMode: boolean, 
    showPfl: boolean
}


const defaultSettingsReducerState: Array<ISettings> = [
    {
        showSnaps: false,
        showSettings: false,
        showOptions: false,
        showStorage: false,
        mixerProtocol: "genericMidi",
        localIp: "0.0.0.0",
        localOscPort: 1234,
        deviceIp: "0.0.0.0",
        devicePort: 10024,
        protocolLatency: 20,
        enableRemoteFader: false,
        mixerMidiInputPort: "",
        mixerMidiOutputPort: "",
        remoteFaderMidiInputPort: "",
        remoteFaderMidiOutputPort: "",
        numberOfChannelsInType: [8],
        numberOfFaders: 8,
        numberOfSnaps: DEFAULTS.NUMBER_OF_SNAPS,
        voLevel: 20,
        autoResetLevel: 10,
        automationMode: true,
        fadeTime: 60, //Time in ms
        showPfl: false
    },
];

export const settings = (state = defaultSettingsReducerState, action: any): Array<ISettings> => {
    let nextState = [Object.assign({}, state[0])];

    switch (action.type) {
        case 'TOGGLE_SHOW_SETTINGS':
            nextState[0].showSettings = !nextState[0].showSettings;
            return nextState;
        case 'TOGGLE_SHOW_OPTION':
            nextState[0].showOptions = typeof nextState[0].showOptions === 'number' ? false : action.channel;
            return nextState;
        case 'TOGGLE_SHOW_STORAGE':
            nextState[0].showStorage = !nextState[0].showStorage;
            return nextState;
        case 'TOGGLE_SHOW_SNAPS':
            nextState[0].showSnaps = !nextState[0].showSnaps;
            return nextState;
        case 'UPDATE_SETTINGS':
            nextState[0] = action.settings;
            nextState[0].showOptions = false;
            nextState[0].showStorage = false;
            if (typeof MixerProtocolPresets[nextState[0].mixerProtocol] === 'undefined')
                {
                    nextState[0].mixerProtocol = 'genericMidi';
                }
            return nextState;

        default:
        return nextState;
    }
};
