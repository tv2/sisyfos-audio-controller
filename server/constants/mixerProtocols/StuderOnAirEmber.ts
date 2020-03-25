import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const StuderOnAirMaster: IMixerProtocol = {
    protocol: 'STUDER_ONAIR',
    label: 'Studer OnAir 3000',
    mode: "master",
    FADE_DISPATCH_RESOLUTION: 50,
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [emptyMixerMessage()],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'MONO',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            DELAY_TIME: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            LO_MID: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_OUT_GAIN: [{
                mixerMessage: '', //controlled from StuderOnAirMixerConnections.ts 'A-4294946012/C-4/C-2/C-1/C-6/P-1/A-3', // 'System/Mixer/Channels/Inp Mono/Inp Mono #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750

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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            DELAY_TIME: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            LO_MID: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
    },
    {
        channelTypeName: 'ST',
        channelTypeColor: '#3f2f2f',
        fromMixer: {
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750
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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            DELAY_TIME: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            LO_MID: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'System/Mixer/Channels/Inp Stereo/Inp Stereo #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750

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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            DELAY_TIME: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            LO_MID: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
    },
    {
        channelTypeName: 'Inp X',
        channelTypeColor: '#2f3f2f',
        fromMixer: {
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750
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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            DELAY_TIME: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            LO_MID: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'System/Mixer/Channels/Inp 5_1/Inp 5_1 #{channel}/Functions/Fader/Value',
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            DELAY_TIME: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            LO_MID: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
    }],
    fader: {
        min: 0,
        max: 1000,
        zero: 750,
        step: 1,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    }
}

