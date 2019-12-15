import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const ReaperMaster: IMixerProtocol = {
    protocol: 'OSC',
    label: 'Reaper DAW Master mode(reaper.fm)',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [emptyMixerMessage()],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 0,  //Set to value to get MixerOnline status 
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/track/{channel}/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_VU: [{ mixerMessage: '/track/{channel}/vu', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_NAME: [{ mixerMessage: '/track/{channel}/name', value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],
            PFL: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
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
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
    },
    {
        channelTypeName: 'MASTER',
        channelTypeColor: '#0f0f3f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/master/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_VU: [
                { mixerMessage: '/master/vu/L', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 },
                { mixerMessage: '/master/vu/R', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }
            ],
            CHANNEL_NAME: [emptyMixerMessage()],
            PFL: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{ mixerMessage: '/master/volume', value: 0, type: 'f', min: 0, max: 1, zero: 0.75 }],
            CHANNEL_NAME: [emptyMixerMessage()],
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
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
    },
}
