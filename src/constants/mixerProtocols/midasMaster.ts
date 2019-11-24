import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

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
            max: 1, zero: 0.75
        },
        {
            mixerMessage: "/meters",
            value: "/meters/1",
            type: "s",
            min: 0,
            max: 1, zero: 0.75
        }
    ],
    pingResponseCommand: [
        {
            mixerMessage: "/xremote",
            value: 0,
            type: "f",
            min: 0,
            max: 1, zero: 0.75
        }
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: '/ch/{channel}/mix/fader',
            value: "",
            type: "s",
            min: 0,
            max: 1,
            zero: 0.75
        },
        {
            mixerMessage: '/ch/{channel}/config/name',
            value: "",
            type: "s",
            min: 0,
            max: 1,
            zero: 0.75
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],        //'none' ignores this command
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/ch/{channel}/mix/fader', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_VU: [{ mixerMessage: '/meters/1', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [{ mixerMessage: '/ch/{channel}/dyn/thr', value: 0, type: 'f', min: -60000, max: 0, zero: -60000}],
            //    // /ch/[01...32]/dyn/thr   [‐60.000, 0.000, 0.500]
            RATIO: [emptyMixerMessage()],     // /ch/[01...32]/dyn/ratio   
            //int with value [0...11] representing
            //{1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}
            LOW: [emptyMixerMessage()], // /ch/[01...32]/eq/[1...4]/g
            //   [‐15.000, 15.000, 0.250]
            MIX: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            MONITOR: [emptyMixerMessage()], // /ch/[01...32]/mix/[01...16]/level
            //   [‐90.0...10.0 (+10 dB), 161]
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/ch/{channel}/mix/fader', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [{ mixerMessage: '/ch/{channel}/dyn/thr', value: 0, type: 'f', min: -60000, max: 0, zero: -60000}],
            //    // /ch/[01...32]/dyn/thr   [‐60.000, 0.000, 0.500]
            RATIO: [emptyMixerMessage()],     // /ch/[01...32]/dyn/ratio   
            //int with value [0...11] representing
            //{1.1, 1.3, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.0, 10, 20, 100}
            LOW: [emptyMixerMessage()], // /ch/[01...32]/eq/[1...4]/g
            //   [‐15.000, 15.000, 0.250]
            MIX: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            MONITOR: [emptyMixerMessage()], // /ch/[01...32]/mix/[01...16]/level
            //   [‐90.0...10.0 (+10 dB), 161]
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
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
