import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface'

export const MidasMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Midas M32 / Behringer X32 Master Mode',
    presetFileExtension: 'X32',
    loadPresetCommand: [
        {
            mixerMessage: '/load',
        },
    ],
    FADE_DISPATCH_RESOLUTION: 5,
    leadingZeros: true,
    pingCommand: [
        {
            mixerMessage: '/xremote',
        },
        {
            mixerMessage: '/meters',
            value: '/meters/1',
            type: 's',
        },
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: '/ch/{channel}/mix/fader',
        },
        {
            mixerMessage: '/ch/{channel}/config/name',
        },
        {
            mixerMessage: '/ch/{channel}/mix/{argument}/level',
            type: 'aux',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/thr',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/ratio',
        },
        {
            mixerMessage: '/ch/{channel}/delay/time',
        },
        {
            mixerMessage: '/ch/{channel}/eq/1/g',
        },
        {
            mixerMessage: '/ch/{channel}/eq/2/g',
        },
        {
            mixerMessage: '/ch/{channel}/eq/3/g',
        },
        {
            mixerMessage: '/ch/{channel}/eq/4/g',
        },
    ],
    channelTypes: [
        {
            channelTypeName: 'CH',
            channelTypeColor: '#2f2f2f',
            fromMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: '/ch/{channel}/mix/fader',
                    },
                ],
                CHANNEL_VU: [
                    {
                        mixerMessage: '/meters/1',
                    },
                ],
                CHANNEL_VU_REDUCTION: [emptyMixerMessage()], // Gain reduction is return toghter with CHANNEL_VU response
                CHANNEL_NAME: [emptyMixerMessage()], //[{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
                PFL: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/thr',
                        maxLabel: 0,
                        minLabel: -60,
                    },
                ],
                RATIO: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/ratio',
                        maxLabel: 10,
                        minLabel: 0,
                    },
                ],
                DELAY_TIME: [
                    {
                        mixerMessage: '/ch/{channel}/delay/time',
                        maxLabel: 500,
                        minLabel: 0,
                    },
                ],
                LOW: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/g',
                        maxLabel: 15,
                        minLabel: -15,
                    },
                ],
                LO_MID: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/g',
                        maxLabel: 15,
                        minLabel: -15,
                    },
                ],
                MID: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/g',
                        maxLabel: 15,
                        minLabel: -15,
                    },
                ],
                HIGH: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/g',
                        maxLabel: 15,
                        minLabel: -15,
                    },
                ],
                AUX_LEVEL: [
                    {
                        mixerMessage: '/ch/{channel}/mix/{argument}/level',
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage: '/ch/{channel}/mix/on',
                    },
                ],
                // Only MUTE_ON is used as receiver
                CHANNEL_MUTE_OFF: [emptyMixerMessage()],
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: '/ch/{channel}/mix/fader',
                    },
                ],
                CHANNEL_NAME: [emptyMixerMessage()], //[{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
                PFL_ON: [emptyMixerMessage()],
                PFL_OFF: [emptyMixerMessage()],
                NEXT_SEND: [emptyMixerMessage()],
                THRESHOLD: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/thr',
                    },
                ],
                RATIO: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/ratio',
                    },
                ],
                DELAY_TIME: [
                    {
                        mixerMessage: '/ch/{channel}/delay/time',
                    },
                ],
                LOW: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/g',
                    },
                ],
                LO_MID: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/g',
                    },
                ],
                MID: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/g',
                    },
                ],
                HIGH: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/g',
                    },
                ],
                AUX_LEVEL: [
                    {
                        mixerMessage: '/ch/{channel}/mix/{argument}/level',
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage: '/ch/{channel}/mix/on',
                        value: 0,
                        type: 'f',
                    },
                ],
                CHANNEL_MUTE_OFF: [
                    {
                        mixerMessage: '/ch/{channel}/mix/on',
                        value: 1,
                        type: 'f',
                    },
                ],
            },
        },
    ],
    fader: {
        min: 0,
        max: 1,
        zero: 0.75,
        step: 0.01,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    },
}
