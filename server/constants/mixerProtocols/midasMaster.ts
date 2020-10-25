import {
    IMixerProtocol,
    emptyMixerMessage,
    fxParamsList,
} from '../MixerProtocolInterface'

export const MidasMaster: IMixerProtocol = {
    protocol: 'OSC',
    fxList: fxParamsList,
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
                        minLabel: -60,
                        maxLabel: 0,
                    },
                ],
                RATIO: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/ratio',
                        minLabel: 1,
                        maxLabel: 10,
                    },
                ],
                DELAY_TIME: [
                    {
                        mixerMessage: '/ch/{channel}/delay/time',
                        minLabel: 0,
                        maxLabel: 500,
                    },
                ],
                FX_PARAMS: [
                    {
                        key: fxParamsList.EqLowGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'Low',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqLowMidGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'LoMid',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqMidGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'HiMid',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqHighGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'High',
                            },
                        ],
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
                FX_PARAMS: [
                    {
                        key: fxParamsList.EqLowGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'Low',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqLowMidGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'LoMid',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqMidGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'HiMid',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqHighGain,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'High',
                            },
                        ],
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
