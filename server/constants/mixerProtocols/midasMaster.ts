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
                        key: fxParamsList.EqGain01,
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
                        key: fxParamsList.EqGain02,
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
                        key: fxParamsList.EqGain03,
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
                        key: fxParamsList.EqGain04,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/g',
                                minLabel: -15,
                                maxLabel: 15,
                                label: 'High',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq01,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/f',
                                minLabel: 20,
                                maxLabel: 20000,
                                label: 'Low Freq',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq02,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/f',
                                minLabel: 20,
                                maxLabel: 20000,
                                label: 'LoMid freq',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq03,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/f',
                                minLabel: 20,
                                maxLabel: 20000,
                                label: 'HiMid freq',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq04,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/f',
                                minLabel: 20,
                                maxLabel: 20000,
                                label: 'High freq',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ01,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/q',
                                minLabel: 0.3,
                                maxLabel: 10,
                                label: 'Low Q',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ02,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/q',
                                minLabel: 0.3,
                                maxLabel: 10,
                                label: 'LoMid Q',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ03,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/q',
                                minLabel: 0.3,
                                maxLabel: 10,
                                label: 'HiMid Q',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ04,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/q',
                                minLabel: 0.3,
                                maxLabel: 10,
                                label: 'High Q',
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
                        key: fxParamsList.EqGain01,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/g',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqGain02,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/g',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqGain03,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/g',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqGain04,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/g',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq01,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/f',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq02,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/f',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq03,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/f',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqFreq04,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/f',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ01,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/1/q',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ02,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/2/q',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ03,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/3/q',
                            },
                        ],
                    },
                    {
                        key: fxParamsList.EqQ04,
                        params: [
                            {
                                mixerMessage: '/ch/{channel}/eq/4/q',
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
