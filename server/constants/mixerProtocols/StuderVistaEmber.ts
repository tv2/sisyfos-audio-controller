import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const StuderVistaMaster: IMixerProtocol = {
    protocol: 'VISTA',
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
        /*
        Fader 3: -90 db
        C1-C1-C1-C1-C3-C1-C2-P1
        7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 a3 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 c0 06 13 00 00 00 00

        Fader 3: 10 db
        7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 a3 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 80 03 05 00 00 00 00

        Fader 24:
        7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 b8 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 80 03 05 00 00 00 00

        Fader 25:
        7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 b9 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 05 09 03 80 03 05 00 00 00 00


        Levels:
        30 05 09 03 c0 06 2d
        -90
        0060   05 09 03 c0 06 2d 00 00 00 00
        0060   05 09 03 c0 06 59 00 00 00 00
        0060   05 09 03 c0 06 53 00 00 00 00
        0060   05 09 03 c0 06 05 00 00 00 00
        0060   05 09 03 c0 06 47 00 00 00 00
        0060   05 09 03 c0 05 39 00 00 00 00
        0060   05 09 03 c0 05 03 00 00 00 00
        0060   05 09 03 c0 05 29 00 00 00 00
        0060   05 09 03 c0 05 05 00 00 00 00
        0060   05 09 03 c0 05 27 00 00 00 00
        0060   05 09 03 c0 03 09 00 00 00 00
        0060   05 09 03 c0 02 05 00 00 00 00
        0060   05 09 03 c0 00 01 00 00 00 00
        0060   05 09 03 c0 00 01 00 00 00 00
        0060   05 09 03 80 03 09 00 00 00 00
        0060   05 09 03 80 03 05 00 00 00 00
      30 0b 09 09 80 02 16 80 00 00 00 00 01

-1:0060   05 09 03 c0 00 01 00 00 00 00
0:      0060   02 09 00 00 00 00 00
1:      0060   05 09 03 80 00 01 
2:      0060   05 09 03 80 01 01 
3:      0060   05 09 03 80 01 03 
4:      0060   05 09 03 80 02 01 
5:      0060   05 09 03 80 02 03 
6:      0060   05 09 03 80 02 07 
7:      0060   05 09 03 80 03 01 
8:      0060   05 09 03 80 03 09 
9:      0060   05 09 03 80 03 05 

        */
        toMixer: {
            CHANNEL_OUT_GAIN: [{ // 7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {a3} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {05 09 03 c0 06 13 00 00 00 00}
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 a1 25 31 23 a1 21 31 1f a1 1d 31 1b a1 19 31 17 {channel} 15 31 13 a1 11 31 0f a2 0d 31 0b e1 09 31 07 63 {level}', 
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
                zero: 0

            },
            {
                mixerMessage: '7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {channel} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 {level} 00 00 00 00', 
                value: 0,
                type: 'real',
                min: -90,
                max: 10,
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

