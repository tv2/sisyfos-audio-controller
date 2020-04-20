import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'VISTA',
    label: 'Studer Vista 1-5-9',
    mode: "master",
    FADE_DISPATCH_RESOLUTION: 5,
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    // [127, 143, 255, 254, 217, 92, 128, 48, 128, 0, 0, 0, 0
    // 7F 8F FF FE D9 5C 80 30 80 00 00 00 00
    pingCommand: [{
        mixerMessage: '7F 8F FF FE D9 5C 80 30 80 00 00 00 00', 
        value: 0,
        type: 'real',
        min: -90,
        max: 10,
        zero: 0
    }],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 6000,  //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'MONO',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_OUT_GAIN: [emptyMixerMessage()],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
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

/*
VSM gadget mono fader 1 level

            0000   00 1b 21 c6 30 96 ac 16 2d 72 97 88 08 00 45 00
            0010   00 5c 00 a3 40 00 80 06 00 00 0a e1 0f 0d 0a e1
            0020   0f c4 d5 2a 1f 97 04 8c d9 46 a3 4d c7 d7 50 18
            0030   00 fd 34 e1 00 00 




            */
           
           CHANNEL_OUT_GAIN: [{ // 7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {a3} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {05 09 03 c0 06 13 00 00 00 00}     
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}', 
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
            CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
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
                    /*
                    0000   00 1b 21 c6 30 96 ac 16 2d 72 97 88 08 00 45 00
                    0010   00 5c 39 93 40 00 80 06 00 00 0a e1 0f 0d 0a e1
                    0020   0f c4 f5 a8 1f 97 38 06 5f b9 53 17 12 6f 50 18
                    0030   01 00 34 e1 00 00 
                    7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a2 19 31 17 a1 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 c0 05 3b 00 00 00 00
                    */
            CHANNEL_OUT_GAIN: [{ // 7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a2 19 31 17 b9 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 80 03 05 00 00 00 00
                                 // 7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a2 19 31 17 a1 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 c0 05 3b 00 00 00 00    
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a2 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}', 
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
            CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
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
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a3 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}', 
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
        min: -90,
        max: 10,
        zero: 0,
        step: 1,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    }
}

