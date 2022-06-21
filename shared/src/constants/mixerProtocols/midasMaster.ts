import { IMixerProtocol, fxParamsList } from '../MixerProtocolInterface'

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
    MAX_UPDATES_PER_SECOND: 15,
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
    mixerTimeout: 2000,
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
            mixerMessage: '/ch/{channel}/preamp/trim',
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
        {
            mixerMessage: '/ch/{channel}/dyn/thr',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/ratio',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/attack',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/hold',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/knee',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/mgain',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/ratio',
        },
        {
            mixerMessage: '/ch/{channel}/dyn/on',
        },
        {
            mixerMessage: '/ch/{channel}/delay/time',
        },
        {
            mixerMessage: '/ch/{channel}/eq/1/g',
        },
        {
            mixerMessage: '/ch/{channel}/eq/1/f',
        },
        {
            mixerMessage: '/ch/{channel}/eq/2/f',
        },
        {
            mixerMessage: '/ch/{channel}/eq/3/f',
        },
        {
            mixerMessage: '/ch/{channel}/eq/4/f',
        },
        {
            mixerMessage: '/ch/{channel}/eq/1/q',
        },
        {
            mixerMessage: '/ch/{channel}/eq/2/q',
        },
        {
            mixerMessage: '/ch/{channel}/eq/3/q',
        },
        {
            mixerMessage: '/ch/{channel}/eq/4/q',
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
                [fxParamsList.GainTrim]: [
                    {
                        mixerMessage: '/ch/{channel}/preamp/trim',
                        minLabel: -18,
                        maxLabel: 18,
                        label: 'Gain Trim',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.CompOnOff]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/on',
                        minLabel: 0,
                        maxLabel: 1,
                        label: 'Comp On/Off',
                    },
                ],
                [fxParamsList.CompThrs]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/thr',
                        minLabel: -60,
                        maxLabel: 0,
                        label: 'Threshold',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.CompRatio]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/ratio',
                        min: 0,
                        max: 11,
                        minLabel: 0,
                        maxLabel: 11,
                        label: 'Ratio',
                        valueAsLabels: [
                            '1.1',
                            '1.3',
                            '1.5',
                            '2.0',
                            '2.5',
                            '3.0',
                            '4.0',
                            '5.0',
                            '7.0',
                            '10',
                            '20',
                            '100',
                        ],
                        valueLabel: ' :1',
                    },
                ],
                [fxParamsList.CompAttack]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/attack',
                        minLabel: 0,
                        maxLabel: 120,
                        label: 'Attack',
                        valueLabel: ' ms',
                    },
                ],
                [fxParamsList.CompHold]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/hold',
                        minLabel: 0,
                        maxLabel: 2000,
                        label: 'Hold',
                        valueLabel: ' ms',
                    },
                ],
                [fxParamsList.CompKnee]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/knee',
                        minLabel: 0,
                        maxLabel: 5,
                        label: 'Knee',
                        valueLabel: ' ',
                    },
                ],
                [fxParamsList.CompMakeUp]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/mgain',
                        minLabel: 0,
                        maxLabel: 24,
                        label: 'MakeUp',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.CompRelease]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/release',
                        minLabel: 5,
                        maxLabel: 4000,
                        label: 'Release',
                        valueLabel: ' ms',
                    },
                ],
                [fxParamsList.DelayTime]: [
                    {
                        mixerMessage: '/ch/{channel}/delay/time',
                        minLabel: 0,
                        maxLabel: 500,
                        label: 'Time',
                        valueLabel: ' ms',
                    },
                ],
                [fxParamsList.EqGain01]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/g',
                        minLabel: -15,
                        maxLabel: 15,
                        label: 'Low',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.EqGain02]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/g',
                        minLabel: -15,
                        maxLabel: 15,
                        label: 'LoMid',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.EqGain03]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/g',
                        minLabel: -15,
                        maxLabel: 15,
                        label: 'HiMid',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.EqGain04]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/g',
                        minLabel: -15,
                        maxLabel: 15,
                        label: 'High',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.EqFreq01]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/f',
                        minLabel: 20,
                        maxLabel: 20000,
                        label: 'Low Freq',
                        valueLabel: ' Freq',
                    },
                ],
                [fxParamsList.EqFreq02]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/f',
                        minLabel: 20,
                        maxLabel: 20000,
                        label: 'LoMid freq',
                        valueLabel: ' Freq',
                    },
                ],
                [fxParamsList.EqFreq03]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/f',
                        minLabel: 20,
                        maxLabel: 20000,
                        label: 'HiMid freq',
                        valueLabel: ' Freq',
                    },
                ],
                [fxParamsList.EqFreq04]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/f',
                        minLabel: 20,
                        maxLabel: 20000,
                        label: 'High freq',
                        valueLabel: ' Freq',
                    },
                ],
                [fxParamsList.EqQ01]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/q',
                        minLabel: 10,
                        maxLabel: 0.3,
                        label: 'Low Q',
                        valueLabel: ' Q',
                    },
                ],
                [fxParamsList.EqQ02]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/q',
                        minLabel: 10,
                        maxLabel: 0.3,
                        label: 'LoMid Q',
                        valueLabel: ' Q',
                    },
                ],
                [fxParamsList.EqQ03]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/q',
                        minLabel: 10,
                        maxLabel: 0.3,
                        label: 'HiMid Q',
                        valueLabel: ' Q',
                    },
                ],
                [fxParamsList.EqQ04]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/q',
                        minLabel: 10,
                        maxLabel: 0.3,
                        label: 'High Q',
                        valueLabel: ' Q',
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
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: '/ch/{channel}/mix/fader',
                    },
                ],
                [fxParamsList.GainTrim]: [
                    {
                        mixerMessage: '/ch/{channel}/preamp/trim',
                        minLabel: -18,
                        maxLabel: 18,
                        label: 'Gain Trim',
                        valueLabel: ' dB',
                    },
                ],
                [fxParamsList.CompOnOff]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/on',
                        minLabel: 0,
                        maxLabel: 1,
                        label: 'Comp On/Off',
                    },
                ],
                [fxParamsList.CompThrs]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/thr',
                    },
                ],
                [fxParamsList.CompRatio]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/ratio',
                    },
                ],
                [fxParamsList.CompAttack]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/attack',
                    },
                ],
                [fxParamsList.CompHold]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/hold',
                    },
                ],
                [fxParamsList.CompKnee]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/knee',
                    },
                ],
                [fxParamsList.CompMakeUp]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/mgain',
                    },
                ],
                [fxParamsList.CompRelease]: [
                    {
                        mixerMessage: '/ch/{channel}/dyn/release',
                    },
                ],
                [fxParamsList.DelayTime]: [
                    {
                        mixerMessage: '/ch/{channel}/delay/time',
                    },
                ],
                [fxParamsList.EqGain01]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/g',
                    },
                ],
                [fxParamsList.EqGain02]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/g',
                    },
                ],
                [fxParamsList.EqGain03]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/g',
                    },
                ],
                [fxParamsList.EqGain04]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/g',
                    },
                ],
                [fxParamsList.EqFreq01]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/f',
                    },
                ],
                [fxParamsList.EqFreq02]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/f',
                    },
                ],
                [fxParamsList.EqFreq03]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/f',
                    },
                ],
                [fxParamsList.EqFreq04]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/f',
                    },
                ],
                [fxParamsList.EqQ01]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/1/q',
                    },
                ],
                [fxParamsList.EqQ02]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/2/q',
                    },
                ],
                [fxParamsList.EqQ03]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/3/q',
                    },
                ],
                [fxParamsList.EqQ04]: [
                    {
                        mixerMessage: '/ch/{channel}/eq/4/q',
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
