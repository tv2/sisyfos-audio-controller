//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.


export interface IMidiMessage {
    message: string,
    value: any,
    type: MidiTypes
}

export enum MidiTypes {
    disabled,
    playNote,
    stopNote,
    sendControlChange,
    sendPitchBend
}
export interface IRemoteProtocol {
    protocol: string,
    label: string,
    mode: string,
    leadingZeros: boolean,
    initializeCommands: [ IMidiMessage ],
    fromRemote: {
        CHANNEL_PGM_ON_OFF: IMidiMessage,
        CHANNEL_PST_ON_OFF: IMidiMessage,
        CHANNEL_PFL_ON_OFF: IMidiMessage,
        CHANNEL_FADER_LEVEL: IMidiMessage,
        GRP_FADER_PGM_ON_OFF: IMidiMessage,
        GRP_FADER_PST_ON_OFF: IMidiMessage,
        GRP_FADER_LEVEL: IMidiMessage,
        X_MIX: IMidiMessage,
        FADE_TO_BLACK: IMidiMessage,
        SNAP_RECALL: IMidiMessage,
    },
    toRemote: {
        STATE_CHANNEL_PGM: IMidiMessage,
        STATE_CHANNEL_PST: IMidiMessage,
        STATE_CHANNEL_PFL: IMidiMessage,
        STATE_CHANNEL_FADER_LEVEL: IMidiMessage,
        STATE_GRP_FADER_PGM: IMidiMessage,
        STATE_GRP_FADER_PST: IMidiMessage,
        STATE_GRP_FADER_LEVEL: IMidiMessage,
    },
    fader: {
        min: number,
        max: number,
        zero: number,
        step: number,
        fadeTime: number,
    },
    meter: {
        min: number,
        max: number,
        zero: number,
        test: number,
    },
}


export const RemoteFaderPresets: { [key: string]: IRemoteProtocol } = {

    hui: {
        protocol: 'MIDI',
        label: 'HUI Midicontroller',
        mode: "client",
        leadingZeros: true,
        initializeCommands: [
            {
                message: "",
                value: "",
                type: MidiTypes.disabled
            }
        ],
        fromRemote: {
            CHANNEL_PGM_ON_OFF: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            CHANNEL_PST_ON_OFF: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            CHANNEL_PFL_ON_OFF: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            CHANNEL_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            GRP_FADER_PGM_ON_OFF: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            GRP_FADER_PST_ON_OFF: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            GRP_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            X_MIX: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            FADE_TO_BLACK: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            SNAP_RECALL: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
        },
        toRemote: {
            STATE_CHANNEL_PGM: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            STATE_CHANNEL_PST: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            STATE_CHANNEL_PFL: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            STATE_CHANNEL_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            STATE_GRP_FADER_PGM: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            STATE_GRP_FADER_PST: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
            STATE_GRP_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiTypes.disabled
            },
        },
        fader: {
            min: -8192,
            max: 8191,
            zero: 4396,
            step: 10,
            fadeTime: 40,
        },
        meter: {
            min: 0,
            max: 1,
            zero: 0.75,
            test: 0.6,
        },
    }
};


export const RemoteFaderProtocolList = Object.getOwnPropertyNames(RemoteFaderPresets).map((preset) => {
    return {
        value: preset,
        label: RemoteFaderPresets[preset].label
    };
});
