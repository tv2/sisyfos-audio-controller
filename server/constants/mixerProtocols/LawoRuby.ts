import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface'

export const LawoRuby: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Lawo Ruby',
    presetFileExtension: '',
    loadPresetCommand: [emptyMixerMessage()],
    FADE_DISPATCH_RESOLUTION: 15,
    leadingZeros: false, //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [emptyMixerMessage()],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 0, //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [
        {
            channelTypeName: 'CH',
            channelTypeColor: '#2f2f2f',
            fromMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage:
                            'Ruby.Sources.{channel}.Fader.Motor Position',
                        value: 0,
                        type: 'int',
                        min: 0,
                        max: 255,
                        zero: 204,
                    },
                ],
                CHANNEL_VU: [emptyMixerMessage()],
                CHANNEL_VU_REDUCTION: [emptyMixerMessage()],
                CHANNEL_NAME: [
                    {
                        mixerMessage: '',
                        value: 0,
                        type: 'real',
                        min: -200,
                        max: 20,
                        zero: 0,
                    },
                ],
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
                CHANNEL_MUTE_OFF: [emptyMixerMessage()],
            },
            toMixer: {
                CHANNEL_OUT_GAIN: [
                    {
                        mixerMessage:
                            'Ruby.Sources.{channel}.Fader.Motor Position',
                        value: 0,
                        type: 'int',
                        min: 0,
                        max: 255,
                        zero: 204,
                    },
                ],
                CHANNEL_NAME: [
                    {
                        mixerMessage: '',
                        value: 0,
                        type: 'real',
                        min: -200,
                        max: 20,
                        zero: 0,
                    },
                ],
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
                CHANNEL_MUTE_OFF: [emptyMixerMessage()],
            },
        },
    ],
    fader: {
        min: 0,
        max: 255,
        zero: 204,
        step: 5,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    },
}
