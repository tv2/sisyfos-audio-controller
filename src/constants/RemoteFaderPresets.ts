//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.


export interface IMidiSendMessage {
    message: string,
    value: any,
    type: MidiSendTypes
}

export enum MidiSendTypes {
    disabled,
    playNote,
    stopNote,
    sendControlChange,
    sendPitchBend
}

export interface IMidiReceiveMessage {
    message: string,
    value: any,
    type: MidiReceiveTypes
}
export enum MidiReceiveTypes {
    disabled,
    noteon,
    noteoff,
    controlchange,
    pichtbend
}

export interface IRemoteProtocol {
    protocol: string,
    label: string,
    mode: string,
    leadingZeros: boolean,
    initializeCommands: [ IMidiSendMessage ],
    fromRemote: {
        CHANNEL_PGM_ON_OFF: IMidiReceiveMessage,
        CHANNEL_PST_ON_OFF: IMidiReceiveMessage,
        CHANNEL_PFL_ON_OFF: IMidiReceiveMessage,
        CHANNEL_FADER_LEVEL: IMidiReceiveMessage,
        GRP_FADER_PGM_ON_OFF: IMidiReceiveMessage,
        GRP_FADER_PST_ON_OFF: IMidiReceiveMessage,
        GRP_FADER_LEVEL: IMidiReceiveMessage,
        X_MIX: IMidiReceiveMessage,
        FADE_TO_BLACK: IMidiReceiveMessage,
        SNAP_RECALL: IMidiReceiveMessage,
    },
    toRemote: {
        STATE_CHANNEL_PGM: IMidiSendMessage,
        STATE_CHANNEL_PST: IMidiSendMessage,
        STATE_CHANNEL_PFL: IMidiSendMessage,
        STATE_CHANNEL_FADER_LEVEL: IMidiSendMessage,
        STATE_GRP_FADER_PGM: IMidiSendMessage,
        STATE_GRP_FADER_PST: IMidiSendMessage,
        STATE_GRP_FADER_LEVEL: IMidiSendMessage,
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
                type: MidiSendTypes.disabled
            }
        ],
        fromRemote: {
            CHANNEL_PGM_ON_OFF: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            CHANNEL_PST_ON_OFF: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            CHANNEL_PFL_ON_OFF: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            CHANNEL_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiReceiveTypes.pichtbend
            },
            GRP_FADER_PGM_ON_OFF: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            GRP_FADER_PST_ON_OFF: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            GRP_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            X_MIX: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            FADE_TO_BLACK: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
            SNAP_RECALL: {
                message: "",
                value: "",
                type: MidiReceiveTypes.disabled
            },
        },
        toRemote: {
            STATE_CHANNEL_PGM: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
            },
            STATE_CHANNEL_PST: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
            },
            STATE_CHANNEL_PFL: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
            },
            STATE_CHANNEL_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
            },
            STATE_GRP_FADER_PGM: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
            },
            STATE_GRP_FADER_PST: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
            },
            STATE_GRP_FADER_LEVEL: {
                message: "",
                value: "",
                type: MidiSendTypes.disabled
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
