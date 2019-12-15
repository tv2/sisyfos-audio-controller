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
            THRESHOLD: [{ mixerMessage: '/ch/{channel}/dyn/thr', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            RATIO: [{ mixerMessage: '/ch/{channel}/dyn/ratio', value: 0, type: 'f', min: 0, max: 1, zero: 0}],  
            LOW: [{ mixerMessage: '/ch/{channel}/eq/2/g', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            MID: [{ mixerMessage: '/ch/{channel}/eq/3/g', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            HIGH: [{ mixerMessage: '/ch/{channel}/eq/4/g', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            AUX_LEVEL: [{mixerMessage: '/ch/{channel}/mix/{argument}/level', value: 0, type: 'f', min: 0, max: 1, zero: 0}], 
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
            THRESHOLD: [{ mixerMessage: '/ch/{channel}/dyn/thr', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            RATIO: [{ mixerMessage: '/ch/{channel}/dyn/ratio', value: 0, type: 'f', min: 0, max: 1, zero: 0}], 
            LOW: [{ mixerMessage: '/ch/{channel}/eq/2/g', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            MID: [{ mixerMessage: '/ch/{channel}/eq/3/g', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            HIGH: [{ mixerMessage: '/ch/{channel}/eq/4/g', value: 0, type: 'f', min: 0, max: 1, zero: 0}],
            AUX_LEVEL: [{mixerMessage: '/ch/{channel}/mix/{argument}/level', value: 0, type: 'f', min: 0, max: 1, zero: 0}], 
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
