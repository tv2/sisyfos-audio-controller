import { IMixerProtocol } from '../MixerProtocolPresets';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const LawoClient: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Lawo Relay VRX4 - client',
    mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/Amplification', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_VU: [{ mixerMessage: '/track/{channel}/vu', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: '/track/{channel}/name',
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/Amplification', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/FaderPosition', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL_ON: [{
                mixerMessage: "/track/{channel}/solo",
                value: 1,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            PFL_OFF: [{
                mixerMessage: "/track/{channel}/solo",
                value: 0,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
    },
    {
        channelTypeName: 'MST',
        channelTypeColor: 'rgb(21, 21, 49)',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'Sapphire/Sums/Source{channel}/Fader', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_VU: [{ mixerMessage: '/track/{channel}/vu', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: '/track/{channel}/name',
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'Sapphire/Sums/Source{channel}/Fader', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'Sapphire/Sums/Source{channel}/Gain', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL_ON: [{
                mixerMessage: "/track/{channel}/solo",
                value: 1,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            PFL_OFF: [{
                mixerMessage: "/track/{channel}/solo",
                value: 0,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
    }],
    fader: {
        min: 0,
        max: 200,
        zero: 1300,
        step: 10,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    }
}

