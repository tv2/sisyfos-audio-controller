import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'STUDER',
    label: 'Studer Vista 1-5-9',
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
            CHANNEL_OUT_GAIN: [emptyMixerMessage()],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [emptyMixerMessage()],
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
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {channel} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 {level} 00 00 00 00', 
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750

            },
            {
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {channel} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 {level} 00 00 00 00', 
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
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {channel} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 {level} 00 00 00 00', 
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750

            },
            {
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {channel} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 {level} 00 00 00 00', 
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
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {channel} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 {level} 00 00 00 00', 
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750

            },
            {
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {channel} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 {level} 00 00 00 00', 
                value: 0,
                type: 'real',
                min: 0,
                max: 1000,
                zero: 750

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

