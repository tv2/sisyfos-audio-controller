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
            type: "f"
        }
    ],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    channelTypes: [{
        channelTypeName: 'Channels',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: ['Sapphire/Sources/Source{channel}/Fader'],
            CHANNEL_OUT_GAIN: [''],
            CHANNEL_VU: ['/track/{channel}/vu'],
            CHANNEL_NAME: '/track/{channel}/name',
            PFL: ['todo'],
            AUX_SEND: ['none'],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: ['Sapphire/Sources/Source{channel}/Fader'],
            CHANNEL_OUT_GAIN: ['Sapphire/Sources/Source{channel}/Gain'],
            PFL_ON: [{
                mixerMessage: "/track/{channel}/solo",
                value: 1,
                type: "i"
            }],
            PFL_OFF: [{
                mixerMessage: "/track/{channel}/solo",
                value: 0,
                type: "i"
            }],
            AUX_SEND: ['none'],
        },
    }],
    fader: {
        min: 0,
        max: 1000,
        zero: 750,
        step: 10,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    }
}

