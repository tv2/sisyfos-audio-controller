import { IMixerProtocol } from '../MixerProtocolPresets';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const LawoClient: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Lawo client, XX-gain as fade I/O',
    mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f",
            min: 0,
            max: 1
        }
    ],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f",
            min: 0,
            max: 1
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: ['R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/Amplification'],
            CHANNEL_OUT_GAIN: [''],
            CHANNEL_VU: ['/track/{channel}/vu'],
            CHANNEL_NAME: '/track/{channel}/name',
            PFL: ['todo'],
            AUX_SEND: ['none'],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: ['R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/Amplification'],
            CHANNEL_OUT_GAIN: ['R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/FaderPosition'],
            PFL_ON: [{
                mixerMessage: "/track/{channel}/solo",
                value: 1,
                type: "i",
                min: 0,
                max: 1
            }],
            PFL_OFF: [{
                mixerMessage: "/track/{channel}/solo",
                value: 0,
                type: "i",
                min: 0,
                max: 1
            }],
            AUX_SEND: ['none'],
        },
    },
    {
        channelTypeName: 'MST',
        channelTypeColor: 'rgb(21, 21, 49)',
        fromMixer: {
            CHANNEL_FADER_LEVEL: ['Sapphire/Sums/Source{channel}/Fader'],
            CHANNEL_OUT_GAIN: [''],
            CHANNEL_VU: ['/track/{channel}/vu'],
            CHANNEL_NAME: '/track/{channel}/name',
            PFL: ['todo'],
            AUX_SEND: ['none'],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: ['Sapphire/Sums/Source{channel}/Fader'],
            CHANNEL_OUT_GAIN: ['Sapphire/Sums/Source{channel}/Gain'],
            PFL_ON: [{
                mixerMessage: "/track/{channel}/solo",
                value: 1,
                type: "i",
                min: 0,
                max: 1
            }],
            PFL_OFF: [{
                mixerMessage: "/track/{channel}/solo",
                value: 0,
                type: "i",
                min: 0,
                max: 1
            }],
            AUX_SEND: ['none'],
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

