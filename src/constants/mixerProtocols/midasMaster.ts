import { IMixerProtocol } from '../MixerProtocolPresets';

export const MidasMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Midas M32 / Behringer X32 Master Mode',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: true,
    pingCommand: [
        {
            mixerMessage: "/xremote",
            value: 0,
            type: "f"
        },
        {
            mixerMessage: "/meters",
            value: "/meters/1",
            type: "s"
        }
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: '/ch/{channel}/mix/fader',
            value: "",
            type: "s"
        },
        {
            mixerMessage: '/ch/{channel}/config/name',
            value: "",
            type: "s"
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: ['none'],        //'none' ignores this command
            CHANNEL_OUT_GAIN: ['/ch/{channel}/mix/fader'],
            CHANNEL_VU: ['/meters/1'],
            CHANNEL_NAME: '/ch/{channel}/config/name',
            PFL: ['todo'],
            AUX_SEND: ['none'],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: ['none'],
            CHANNEL_OUT_GAIN: ['/ch/{channel}/mix/fader'],
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
        },
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
        zero: 0.75,
        test: 0.6,
    },
}
