import { IMixerProtocol } from '../MixerProtocolPresets';

export const Reaper: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Reaper DAW (reaper.fm)',
    mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [
        {
            oscMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [
        {
            oscMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    fromMixer: {
        CHANNEL_FADER_LEVEL: '/track/{channel}/volume',
        CHANNEL_OUT_GAIN: '/track/{channel}/fx/1/fxparam/1/value',
        CHANNEL_VU: '/track/{channel}/vu',
        CHANNEL_NAME: '/track/{channel}/name',
        GRP_OUT_GAIN: '/dca/{channel}/fader',
        GRP_VU: 'none',
        GRP_NAME: '/dca/{channel}/config/name',
        PFL: 'todo'
    },
    toMixer: {
        CHANNEL_FADER_LEVEL: '/track/{channel}/volume',
        CHANNEL_OUT_GAIN: '/track/{channel}/fx/1/fxparam/1/value',
        GRP_OUT_GAIN: '/dca/{channel}/fader',
        PFL_ON: {
            oscMessage: "/track/{channel}/solo",
            value: 1,
            type: "i"
        },
        PFL_OFF: {
            oscMessage: "/track/{channel}/solo",
            value: 0,
            type: "i"
        }
    },
    fader: {
        min: 0,
        max: 1,
        zero: 0.75,
        step: 0.01,
        fadeTime: 40,  //Total time for a fade in ms.
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    },
}
