import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const BehringerXrMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Behringer XR 12,14,16 Mastermode',
    mode: "master",
    FADE_DISPATCH_RESOLUTION: 5,
    leadingZeros: true,
    pingCommand: [
        {
            mixerMessage: "/xremote", value: 0,
            type: "f", min: 0, max: 1, zero: 0.75
        },
        {
            mixerMessage: "/meters", value: "/meters/1",
            type: "s", min: 0, max: 1, zero: 0.75
        },
        {
            mixerMessage: "/meters", value: "/meters/5",
            type: "s", min: 0, max: 1, zero: 0.75
        }
    ],
    pingResponseCommand: [
        {
            mixerMessage: "/xremote", value: 0,
            type: "f", min: 0, max: 1, zero: 0.75
        },
    ],
    pingTime: 9500,
    initializeCommands: [
        {
            mixerMessage: "/info", value: 0, type: "f", min: 0, max: 1, zero: 0.75
        }
    ],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/ch/{channel}/mix/fader', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_VU: [{ mixerMessage: '/meters/1', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_VU_REDUCTION: [{ mixerMessage: '/meters/1', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
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
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer : {
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/ch/{channel}/mix/fader', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [{ mixerMessage: '/ch/{channel}/config/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
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
    }
}
