import { IMixerProtocol } from '../MixerProtocolPresets';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Studer Vista - master',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
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
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
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
        channelTypeName: 'ST',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
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
        channelTypeName: 'Inp X',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
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

