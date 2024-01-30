import {
    MixerProtocol,
    fxParamsList,
    VuLabelConversionType,
    MixerConnectionTypes
} from '../MixerProtocolInterface'

export const Atem: MixerProtocol = {
    MAX_UPDATES_PER_SECOND: 10,
    protocol: MixerConnectionTypes.Atem,
    label: 'ATEM Audio Control',
    vuLabelConversionType: VuLabelConversionType.Decibel,
    vuLabelValues: [0, 0.125, 0.25, 0.375, 0.5, 0.75, 1],
    fader: {
        min: 0,
        max: 1,
        zero: 0.75,
        step: 0.01,
    },
    channelTypes: [
        {
            channelTypeName: 'Input',
            channelTypeColor: '#2f2f2f',
            fromMixer: {
                CHANNEL_INPUT_GAIN: [
                    { mixerMessage: '', maxLabel: 6, minLabel: -12 },
                ],
                CHANNEL_INPUT_SELECTOR: [
                    {
                        mixerMessage: '',
                        label: 'LR',
                    },
                    {
                        mixerMessage: '',
                        label: 'LL',
                    },
                    {
                        mixerMessage: '',
                        label: 'RR',
                    },
                ],
                // CHANNEL_OUT_GAIN: [{ mixerMessage: '' }],
                // CHANNEL_VU?: Array<IMixerMessageProtocol>
                // CHANNEL_VU_REDUCTION?: Array<IMixerMessageProtocol>
                // CHANNEL_NAME?: Array<IMixerMessageProtocol>
                // PFL?: Array<IMixerMessageProtocol>
                // NEXT_SEND?: Array<IMixerMessageProtocol>
                // [FX_PARAM: number]: Array<IMixerMessageProtocol>
                // AUX_LEVEL?: Array<IMixerMessageProtocol>
                // CHANNEL_MUTE_ON: [{ mixerMessage: '' }],
                // CHANNEL_MUTE_OFF?: Array<IMixerMessageProtocol>
                // CHANNEL_AMIX?: Array<IMixerMessageProtocol>
            },
            toMixer: {
                CHANNEL_INPUT_GAIN: [{ mixerMessage: '' }],
                CHANNEL_INPUT_SELECTOR: [
                    {
                        mixerMessage: '',
                        label: 'LR',
                    },
                    {
                        mixerMessage: '',
                        label: 'LL',
                    },
                    {
                        mixerMessage: '',
                        label: 'RR',
                    },
                ],
                // CHANNEL_OUT_GAIN: [{ mixerMessage: '' }],
                // CHANNEL_NAME?: Array<IMixerMessageProtocol>
                // PFL_ON?: Array<IMixerMessageProtocol>
                // PFL_OFF?: Array<IMixerMessageProtocol>
                // NEXT_SEND?: Array<IMixerMessageProtocol>
                // [FX_PARAM: number]: Array<IMixerMessageProtocol>
                // AUX_LEVEL?: Array<IMixerMessageProtocol>
                CHANNEL_MUTE_ON: [{ mixerMessage: '' }],
                CHANNEL_MUTE_OFF: [{ mixerMessage: '' }],
                // CHANNEL_AMIX?: Array<IMixerMessageProtocol>
            },
        },
    ],
}
