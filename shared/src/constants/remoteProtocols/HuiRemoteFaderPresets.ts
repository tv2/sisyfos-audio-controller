export interface MidiSendMessage {
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

export interface MidiReceiveMessage {
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

export interface RemoteProtocol {
    protocol: string
    label: string
    mode: string
    leadingZeros: boolean
    initializeCommands: [MidiSendMessage]
    fromRemote: {
        CHANNEL_PGM_ON_OFF: MidiReceiveMessage
        CHANNEL_PST_ON_OFF: MidiReceiveMessage
        CHANNEL_PFL_ON_OFF: MidiReceiveMessage
        CHANNEL_FADER_LEVEL: MidiReceiveMessage
        X_MIX: MidiReceiveMessage
        FADE_TO_BLACK: MidiReceiveMessage
        SNAP_RECALL: MidiReceiveMessage
    }
    toRemote: {
        STATE_CHANNEL_PGM: MidiSendMessage
        STATE_CHANNEL_PST: MidiSendMessage
        STATE_CHANNEL_PFL: MidiSendMessage
        STATE_CHANNEL_FADER_LEVEL: Array<MidiSendMessage>
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

export const RemoteFaderPresets: { [key: string]: RemoteProtocol } = {
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
