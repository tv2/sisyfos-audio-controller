export interface IMidiSendMessage {
    message: string
    value: any
    type: MidiSendTypes
}

export enum MidiSendTypes {
    disabled,
    playNote,
    stopNote,
    sendControlChange,
    sendPitchBend,
}

export interface IMidiReceiveMessage {
    message: string
    value: any
    type: MidiReceiveTypes
}
export enum MidiReceiveTypes {
    disabled,
    noteon,
    noteoff,
    controlchange,
    pitchbend,
}

export interface IRemoteProtocol {
    protocol: string
    label: string
    mode: string
    leadingZeros: boolean
    initializeCommands: [IMidiSendMessage]
    fromRemote: {
        CHANNEL_PGM_ON_OFF: IMidiReceiveMessage
        CHANNEL_PST_ON_OFF: IMidiReceiveMessage
        CHANNEL_PFL_ON_OFF: IMidiReceiveMessage
        CHANNEL_FADER_LEVEL: IMidiReceiveMessage
        X_MIX: IMidiReceiveMessage
        FADE_TO_BLACK: IMidiReceiveMessage
        SNAP_RECALL: IMidiReceiveMessage
    }
    toRemote: {
        STATE_CHANNEL_PGM: IMidiSendMessage
        STATE_CHANNEL_PST: IMidiSendMessage
        STATE_CHANNEL_PFL: IMidiSendMessage
        STATE_CHANNEL_FADER_LEVEL: Array<IMidiSendMessage>
    }
    fader: {
        min: number
        max: number
        zero: number
        step: number
    }
    meter: {
        min: number
        max: number
        zero: number
        test: number
    }
}

export const RemoteFaderPresets: { [key: string]: IRemoteProtocol } = {
    hui: {
        protocol: 'MIDI',
        label: 'Generic HUI Midicontroller',
        mode: 'client',
        leadingZeros: true,
        initializeCommands: [
            {
                message: '',
                value: '',
                type: MidiSendTypes.disabled,
            },
        ],
        fromRemote: {
            CHANNEL_PGM_ON_OFF: {
                message: '',
                value: '',
                type: MidiReceiveTypes.disabled,
            },
            CHANNEL_PST_ON_OFF: {
                message: '',
                value: '',
                type: MidiReceiveTypes.disabled,
            },
            CHANNEL_PFL_ON_OFF: {
                message: '',
                value: '',
                type: MidiReceiveTypes.disabled,
            },
            CHANNEL_FADER_LEVEL: {
                message: '0',
                value: '',
                type: MidiReceiveTypes.controlchange,
            },
            X_MIX: {
                message: '',
                value: '',
                type: MidiReceiveTypes.disabled,
            },
            FADE_TO_BLACK: {
                message: '',
                value: '',
                type: MidiReceiveTypes.disabled,
            },
            SNAP_RECALL: {
                message: '',
                value: '',
                type: MidiReceiveTypes.disabled,
            },
        },
        toRemote: {
            STATE_CHANNEL_PGM: {
                message: '',
                value: '',
                type: MidiSendTypes.disabled,
            },
            STATE_CHANNEL_PST: {
                message: '',
                value: '',
                type: MidiSendTypes.disabled,
            },
            STATE_CHANNEL_PFL: {
                message: '',
                value: '',
                type: MidiSendTypes.disabled,
            },
            STATE_CHANNEL_FADER_LEVEL: [
                {
                    message: '21',
                    value: '',
                    type: MidiSendTypes.sendControlChange,
                },
                {
                    message: '01',
                    value: '',
                    type: MidiSendTypes.sendControlChange,
                },
            ],
        },
        fader: {
            min: 0,
            max: 127,
            zero: 70,
            step: 1,
        },
        meter: {
            min: 0,
            max: 1,
            zero: 0.75,
            test: 0.6,
        },
    },
}

export const RemoteFaderProtocolList = Object.getOwnPropertyNames(
    RemoteFaderPresets
).map((preset) => {
    return {
        value: preset,
        label: RemoteFaderPresets[preset].label,
    }
})
