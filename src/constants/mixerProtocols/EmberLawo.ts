import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const LawoClient: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Lawo Relay VRX4 - client',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{
                mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/FaderPosition',
                value: 0,
                type: 'real',
                min: 0,
                max: 100,
                zero: 75
            }],
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_NAME: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{
                mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/FaderPosition',
                value: 0,
                type: 'real',
                min: 0,
                max: 100,
                zero: 75
            }],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/Amplification',
                value: 0,
                type: 'real',
                min: -200,
                max: 20,
                zero: 0

            }],
            CHANNEL_NAME: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            PFL_ON: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            PFL_OFF: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        }
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

