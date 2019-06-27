import { IMixerProtocol } from '../MixerProtocolPresets';

export const ArdourMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Ardour DAW - Master Mode',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,
    pingCommand: [
        {
            mixerMessage: "/strip/list",
            value: "",
            type: ""
        }
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: "/strip/list",
            value: "",
            type: ""
        }
    ],
    channelTypes: [{
        channelTypeName: 'Channels',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: ['none'],        //'none' ignores this command
            CHANNEL_OUT_GAIN: ['/strip/fader/{channel}'],
            CHANNEL_VU: ['/strip/meter/{channel}'],
            CHANNEL_NAME: '/strip/name/{channel}',
            PFL: ['todo'],
            AUX_SEND: ['none'],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: ['none'],
            CHANNEL_OUT_GAIN: ['/strip/fader/{channel}'],
            PFL_ON: [{
                mixerMessage: "/not_in_use",
                value: 0,
                type: "f"
            }],
            PFL_OFF: [{
                mixerMessage: "/not_in_use",
                value: 0,
                type: "f"
            }],
            AUX_SEND: ['none'],
    }
    }],
    fader: {
        min: 0,
        max: 1,
        zero: 0.75,
        step: 0.01,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.85,
        test: 0.75,
    },
}
