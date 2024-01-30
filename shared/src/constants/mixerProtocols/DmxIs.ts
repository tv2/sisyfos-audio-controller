import { MixerProtocol, MixerConnectionTypes } from '../MixerProtocolInterface'

export const DMXIS: MixerProtocol = {
    protocol: MixerConnectionTypes.OSC,
    label: 'DMXIS Light Controller Protocol',
    presetFileExtension: '',
    MAX_UPDATES_PER_SECOND: 10,
    leadingZeros: false, //some OSC protocols needs channels to be 01, 02 etc.
    pingTime: 0, //Bypass ping when pingTime is zero
    channelTypes: [
        {
            channelTypeName: 'CH',
            channelTypeColor: '#3f2f2f',
            fromMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: '/dmxis/ch/{channel}',
                        value: 0,
                        type: 'f',
                        min: 0,
                        max: 1,
                        zero: 0.75,
                    },
                ],
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage: '/dmxis/ch/{channel}',
                        value: 0,
                        type: 'f',
                        min: 0,
                        max: 1,
                        zero: 0.75,
                    },
                ],
                CHANNEL_NAME: [
                    {
                        mixerMessage: '/dmxis/ch/name/{channel}',
                        value: 0,
                        type: 'f',
                        min: 0,
                        max: 1,
                        zero: 0.75,
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
