import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const LawoClient: IMixerProtocol = {
    protocol: 'EMBER',
    label: 'Lawo Relay VRX4 - client',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,  //some OSC protocols needs channels to be 01, 02 etc.
    pingCommand: [emptyMixerMessage()],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 0,  //Bypass ping when pingTime is zero
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/FaderPosition',
                value: 0,
                type: 'real',
                min: 0,
                max: 100,
                zero: 75
            }],
            CHANNEL_VU: [emptyMixerMessage()],
            CHANNEL_NAME: [{
                mixerMessage: '',
                value: 0,
                type: 'real',
                min: -200,
                max: 20,
                zero: 0

            }],
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
            CHANNEL_FADER_LEVEL: [{
                mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/FaderPosition',
                value: 0,
                type: 'real',
                min: 0,
                max: 100,
                zero: 75
            }],
            CHANNEL_OUT_GAIN: [{
                mixerMessage: 'R3LAYVRX4/Ex/GUI/FaderSlot_{channel}/Amplification',
                value: 0,
                type: 'real',
                min: -200,
                max: 20,
                zero: 0

            }],
            CHANNEL_NAME: [{
                mixerMessage: '',
                value: 0,
                type: 'real',
                min: -200,
                max: 20,
                zero: 0

            }],
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
        }
    }],
    fader: {
        min: 0,
        max: 200,
        zero: 1300,
        step: 10,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    }
}

