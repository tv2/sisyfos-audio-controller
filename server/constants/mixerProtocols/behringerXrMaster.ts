import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface'

export const BehringerXrMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Behringer XR-series / Midas MR-series',
    presetFileExtension: '',
    loadPresetCommand: [emptyMixerMessage()],
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
        {
            mixerMessage: '/meters',
            value: '/meters/6',
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
                CHANNEL_INPUT_GAIN: [emptyMixerMessage()],
                CHANNEL_INPUT_SELECTOR: [emptyMixerMessage()],
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
                CHANNEL_VU_REDUCTION: [
                    {
                        mixerMessage: '/meters/6',
                    },
                ],
                CHANNEL_NAME: [
                    {
                        mixerMessage: '/ch/{channel}/config/name',
                    },
                ],
                PFL: [emptyMixerMessage()],
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
                CHANNEL_NAME: [
                    {
                        mixerMessage: '/ch/{channel}/config/name',
                    },
                ],
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
