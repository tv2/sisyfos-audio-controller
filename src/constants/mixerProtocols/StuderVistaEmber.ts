import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolPresets';
import path from 'path';
import os from 'os';
import fs from 'fs';

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Studer Vista - master',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [emptyMixerMessage()],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
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
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
    },
    {
        channelTypeName: 'ST',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
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
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
    },
    {
        channelTypeName: 'Inp X',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: 'Vista 9/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Channel Attribute/User Label',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            PFL: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
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
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
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

