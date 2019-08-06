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
    pingCommand: [emptyMixerMessage()],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: 'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Channel Attribute/User Label',
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
                mixerMessage: 'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: 'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Channel Attribute/User Label',
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
                mixerMessage: 'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: 'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Channel Attribute/User Label',
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
                mixerMessage: 'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: 'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Channel Attribute/User Label',
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
                mixerMessage: 'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: 'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Channel Attribute/User Label',
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
                mixerMessage: 'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: 'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Channel Attribute/User Label',
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
        max: 100,
        zero: 70,
        step: 1,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    }
}

