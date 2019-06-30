import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Studer Vista - master',
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
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL_ON: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            PFL_OFF: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        },
    },
    {
        channelTypeName: 'ST',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL_ON: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            PFL_OFF: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        },
    },
    {
        channelTypeName: 'Inp X',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL_ON: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            PFL_OFF: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
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

