import { IMixerProtocol } from '../MixerProtocolPresets';

export const GenericMidi: IMixerProtocol = {
    protocol: 'MIDI',
    label: 'Generic Midi',
    mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,
    pingCommand: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    pingTime: 0,
    initializeCommands: [
        {
            mixerMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    channelTypes: [{
        channelTypeName: 'Channels',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: "39",        //PgmChange 0 - ignores this command
            CHANNEL_OUT_GAIN: "0",            //PgmChange 0 - ignores this command
            CHANNEL_VU: "0",                   //PgmChange 0 - ignores this command
            CHANNEL_NAME: 'some sysex not yet build',
            PFL: 'todo',
            AUX_SEND: ['none'],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: "39",
            CHANNEL_OUT_GAIN: "38",
            PFL_ON: {
                mixerMessage: "/not_in_use",
                value: 0,
                type: "f"
            },
            PFL_OFF: {
                mixerMessage: "/not_in_use",
                value: 0,
                type: "f"
            },
            AUX_SEND: ['none'],
        },
    }],
    fader: {
        min: 0,
        max: 127,
        zero: 100,
        step: 1,
    },
    meter: {
        min: 0,
        max: 127,
        zero: 100,
        test: 80,
    },
}
