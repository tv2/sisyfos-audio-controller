import { IMixerProtocol } from '../MixerProtocolPresets';

export const MidasClient: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Midas M32 / Behringer X32 Client Mode',
    mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: true,
    pingCommand: [
        {
            oscMessage: "/xremote",
            value: 0,
            type: "f"
        },
        {
            oscMessage: "/meters",
            value: "/meters/1",
            type: "s"
        },
        {
            oscMessage: "/meters",
            value: "/meters/5",
            type: "s"
        }
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            oscMessage: '/ch/{channel}/mix/fader',
            value: "",
            type: "s"
        },
        {
            oscMessage: '/ch/{channel}/mix/01/level',
            value: "",
            type: "s"
        },
        {
            oscMessage: '/ch/{channel}/config/name',
            value: "",
            type: "s"
        }
    ],
    fromMixer: {
        CHANNEL_FADER_LEVEL: '/ch/{channel}/mix/fader',        //'none' ignores this command
        CHANNEL_OUT_GAIN: '/ch/{channel}/mix/01/level',
        CHANNEL_VU: '/meters/1',
        CHANNEL_NAME: '/ch/{channel}/config/name',
        GRP_OUT_GAIN: '/dca/{channel}/mix/01/level',
        GRP_VU: 'none',
        GRP_NAME: '/dca/{channel}/config/name',
        PFL: 'todo'
    },
    toMixer: {
        CHANNEL_FADER_LEVEL: '/ch/{channel}/mix/fader',
        CHANNEL_OUT_GAIN: '/ch/{channel}/mix/01/level',
        GRP_OUT_GAIN: '/dca/{channel}/mix/01/level',
        PFL_ON: 'todo',
        PFL_OFF: 'todo'
    },
    fader: {
        min: 0,
        max: 1,
        zero: 0.75,
        step: 0.01,
        fadeTime: 40,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    },
}
