import * as DEFAULTS from '../constants/DEFAULTS';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';

export interface ISettings {
    showSnaps: boolean,
    showSettings: boolean,
    mixerProtocol: string,
    localIp: string,
    localOscPort: number,
    deviceIp: string,
    devicePort: number,
    remoteFaderMidiInputPort: string,
    remoteFaderMidiOutputPort: string,
    numberOfChannels: number,
    numberOfSnaps: number,
    fadeTime: number
    showPfl: boolean
}


const defaultSettingsReducerState: Array<ISettings> = [
    {
        showSnaps: false,
        showSettings: false,
        mixerProtocol: "genericMidi",
        localIp: "0.0.0.0",
        localOscPort: 8000,
        deviceIp: "0.0.0.0",
        devicePort: 10024,
        remoteFaderMidiInputPort: "",
        remoteFaderMidiOutputPort: "",
        numberOfChannels: DEFAULTS.NUMBER_OF_CHANNELS,
        numberOfSnaps: DEFAULTS.NUMBER_OF_SNAPS,
        fadeTime: 100, //Time in ms
        showPfl: false
    },
];

export const settings = (state = defaultSettingsReducerState, action: any): Array<ISettings> => {
    let nextState = [...state];

    switch (action.type) {
        case 'TOGGLE_SHOW_SETTINGS':
            nextState[0].showSettings = !nextState[0].showSettings;
            return nextState;
        case 'TOGGLE_SHOW_SNAPS':
            nextState[0].showSnaps = !nextState[0].showSnaps;
            return nextState;
        case 'UPDATE_SETTINGS':
            nextState[0] = action.settings;
            if (typeof MixerProtocolPresets[nextState[0].mixerProtocol] === 'undefined')
                {
                    nextState[0].mixerProtocol = 'genericMidi';
                }
            return nextState;

        default:
        return nextState;
    }
};
