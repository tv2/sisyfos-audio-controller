import { IMixerProtocol } from '../MixerProtocolPresets';

export const ReaperMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Reaper DAW Master mode(reaper.fm)',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/track/{channel}/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_VU: [{ mixerMessage: '/track/{channel}/vu', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_NAME: [{ mixerMessage: '/track/{channel}/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/track/{channel}/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_NAME: [{ mixerMessage: '/track/{channel}/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL_ON: [{
                mixerMessage: "/track/{channel}/solo",
                value: 1,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            PFL_OFF: [{
                mixerMessage: "/track/{channel}/solo",
                value: 0,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
        },
    },
    {
        channelTypeName: 'MASTER',
        channelTypeColor: '#0f0f3f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/master/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_VU: [
                { mixerMessage: '/master/vu/L', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 },
                { mixerMessage: '/master/vu/R', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }
            ],
            CHANNEL_NAME: [{ mixerMessage: '', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/master/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_NAME: [{ mixerMessage: '', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL_ON: [{
                mixerMessage: "",
                value: 1,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            PFL_OFF: [{
                mixerMessage: "",
                value: 0,
                type: "i",
                min: 0,
                max: 1,
                zero: 0.75
            }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
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
