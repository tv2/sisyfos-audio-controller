import {
    MixerProtocol,
    fxParamsList,
    MixerConnectionTypes,
} from '../MixerProtocolInterface'

export const VMix: MixerProtocol = {
    protocol: MixerConnectionTypes.vMix,
    fxList: fxParamsList,
    label: 'VMix Audio Control',
    presetFileExtension: 'vmix',
    loadPresetCommand: [
        {
            mixerMessage: '/load',
        },
    ],
    MAX_UPDATES_PER_SECOND: 10,
    leadingZeros: true,
    pingCommand: [
        // {
        //     mixerMessage: '/xremote',
        // },
        // {
        //     mixerMessage: '/meters',
        //     value: '/meters/1',
        //     type: 's',
        // },
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: 'SetVolume',
        },
        {
            mixerMessage: 'AudioAutoOff',
        },
        // {
        //     mixerMessage: '/ch/{channel}/config/name',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/mix/{argument}/level',
        //     type: 'aux',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/preamp/trim',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/thr',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/ratio',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/delay/time',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/1/g',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/2/g',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/3/g',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/4/g',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/thr',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/ratio',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/attack',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/hold',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/knee',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/mgain',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/dyn/ratio',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/delay/time',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/1/g',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/1/f',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/2/f',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/3/f',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/4/f',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/1/q',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/2/q',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/3/q',
        // },
        // {
        //     mixerMessage: '/ch/{channel}/eq/4/q',
        // },
    ],
    channelTypes: [
        {
            channelTypeName: 'CH',
            channelTypeColor: '#2f2f2f',
            fromMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: 'SetVolume',
                    },
                ],
                CHANNEL_VU: [
                    {
                        mixerMessage: '/meters/1',
                    },
                    {
                        mixerMessage: '/meters/2',
                    },
                ],
                CHANNEL_INPUT_GAIN: [
                    {
                        mixerMessage: 'SetGain',
                        minLabel: 0,
                        maxLabel: 24,
                        label: 'Gain Trim',
                        valueLabel: ' dB',
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
                        mixerMessage: 'SetVolume',
                    },
                ],
                CHANNEL_INPUT_SELECTOR: [
                    {
                        mixerMessage: 'AudioChannelMatrixApplyPreset',
                        label: 'LR',
                        value: 'Default',
                    },
                    {
                        mixerMessage: 'AudioChannelMatrixApplyPreset',
                        label: 'LL',
                        value: 'LL',
                    },
                    {
                        mixerMessage: 'AudioChannelMatrixApplyPreset',
                        label: 'RR',
                        value: 'RR',
                    },
                ],
                CHANNEL_INPUT_GAIN: [
                    {
                        mixerMessage: 'SetGain',
                        minLabel: 0,
                        maxLabel: 24,
                        label: 'Gain Trim',
                        valueLabel: ' dB',
                        min: 0,
                        max: 24,
                    },
                ],
                CHANNEL_MUTE_ON: [
                    {
                        mixerMessage: 'AudioOff',
                        value: 0,
                        type: 'f',
                    },
                ],
                CHANNEL_MUTE_OFF: [
                    {
                        mixerMessage: 'AudioOn',
                        value: 1,
                        type: 'f',
                    },
                ],
                PFL_OFF: [
                    {
                        mixerMessage: 'SoloOff',
                        value: 1,
                        type: 'f',
                    },
                ],
                PFL_ON: [
                    {
                        mixerMessage: 'SoloOn',
                        value: 1,
                        type: 'f',
                    },
                ],
                AUX_LEVEL: [
                    {
                        mixerMessage: '/ch/{channel}/mix/{argument}/level',
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
