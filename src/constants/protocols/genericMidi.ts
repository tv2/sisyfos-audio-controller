import { IMixerProtocol } from '../MixerProtocolPresets';

export const GenericMidi: IMixerProtocol = {
    protocol: 'MIDI',
    label: 'Generic Midi',
    mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,
    pingCommand: [
        {
            oscMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    pingTime: 0,
    initializeCommands: [
        {
            oscMessage: "/note_in_use",
            value: 0,
            type: "f"
        }
    ],
    fromMixer: {
        CHANNEL_FADER_LEVEL: "39",        //PgmChange 0 - ignores this command
        CHANNEL_OUT_GAIN: "0",            //PgmChange 0 - ignores this command
        CHANNEL_VU: "0",                   //PgmChange 0 - ignores this command
        CHANNEL_NAME: 'some sysex not yet build',
        GRP_OUT_GAIN: 'none',
        GRP_VU: 'none',
        GRP_NAME: 'none',
    },
    toMixer: {
        CHANNEL_FADER_LEVEL: "39",
        CHANNEL_OUT_GAIN: "38",
        GRP_OUT_GAIN: 'none',
    },
    fader: {
        min: 0,
        max: 127,
        zero: 100,
        step: 1,
        fadeTime: 40,
    },
    meter: {
        min: 0,
        max: 127,
        zero: 100,
        test: 80,
    },
}
