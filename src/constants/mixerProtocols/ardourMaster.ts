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
            type: "",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: "/strip/list",
            value: "",
            type: "",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],        //'none' ignores this command
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/strip/fader/{channel}', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_VU: [{ mixerMessage: '/strip/meter/{channel}', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: '/strip/name/{channel}',
            PFL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/strip/fader/{channel}', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL_ON: [{
                mixerMessage: "/not_in_use", value: 0, type: "f", min: 0, max: 1, zero: 0.75
            }],
            PFL_OFF: [{
                mixerMessage: "/not_in_use", value: 0, type: "f", min: 0, max: 1, zero: 0.75
            }],
            AUX_SEND: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
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
