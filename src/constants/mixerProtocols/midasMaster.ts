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
            type: "f",
            min: 0,
            max: 1
        },
        {
            mixerMessage: "/meters",
            value: "/meters/1",
            type: "s",
            min: 0,
            max: 1
        }
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: '/ch/{channel}/mix/fader',
            value: "",
            type: "s",
            min: 0,
            max: 1
        },
        {
            mixerMessage: '/ch/{channel}/config/name',
            value: "",
            type: "s",
            min: 0,
            max: 1
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1}],        //'none' ignores this command
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/ch/{channel}/mix/fader', value: 0, type: 'f', min: 0, max: 1}],
            CHANNEL_VU: [{ mixerMessage: '/meters/1', value: 0, type: 'f', min: 0, max: 1}],
            CHANNEL_NAME: '/ch/{channel}/config/name',
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1}],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/ch/{channel}/mix/fader', value: 0, type: 'f', min: 0, max: 1}],
            PFL_ON: [{
                mixerMessage: "/not_in_use",
                value: 0,
                type: "f",
                min: 0,
                max: 1
            }],
            PFL_OFF: [{
                mixerMessage: "/not_in_use",
                value: 0,
                type: "f",
                min: 0,
                max: 1
            }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1}],
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
