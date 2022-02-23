//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.

export interface IAutomationProtocol {
    protocol: string
    label: string
    mode: string
    leadingZeros: boolean
    initializeCommands: [
        {
            mixerMessage: string
            value: string
            type: string
        }
    ]
    fromAutomation: {
        CHANNEL_PGM_ON_OFF: string
        CHANNEL_PST_ON_OFF: string
        CHANNEL_FADER_LEVEL: string
        INJECT_COMMAND: string
        CHANNEL_VISIBLE: string
        CHANNEL_MUTE: string
        X_MIX: string
        SET_LABEL: string
        FADE_TO_BLACK: string
        CLEAR_PST: string
        SNAP_RECALL: string
        STATE_CHANNEL_PGM: string
        STATE_CHANNEL_PST: string
        STATE_CHANNEL_FADER_LEVEL: string
        STATE_CHANNEL_MUTE: string
        STATE_FULL: string
        PING: string
    }
    toAutomation: {
        STATE_CHANNEL_PGM: string
        STATE_CHANNEL_PST: string
        STATE_CHANNEL_FADER_LEVEL: string
        STATE_CHANNEL_MUTE: string
        STATE_FULL: string
        PONG: string
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

export const AutomationPresets: { [key: string]: IAutomationProtocol } = {
    sofie: {
        protocol: 'OSC',
        label: 'Sofie Automation',
        mode: 'client',
        leadingZeros: true,
        initializeCommands: [
            {
                mixerMessage: '/info',
                value: '',
                type: 'f',
            },
        ],
        fromAutomation: {
            CHANNEL_PGM_ON_OFF: '/ch/{value1}/pgm',
            CHANNEL_PST_ON_OFF: '/ch/{value1}/pst',
            CHANNEL_FADER_LEVEL: '/ch/{value1}/faderlevel',
            CHANNEL_VISIBLE: '/ch/{value1}/visible',
            CHANNEL_MUTE: '/ch/{value1}/mute',
            X_MIX: '/take',
            INJECT_COMMAND: '/inject',
            SET_LABEL: '/ch/{value1}/label',
            FADE_TO_BLACK: '/fadetoblack',
            CLEAR_PST: '/clearpst',
            SNAP_RECALL: '/snap/{value1}',
            STATE_CHANNEL_PGM: '/state/ch/{value1}/pgm',
            STATE_CHANNEL_PST: '/state/ch/{value1}/pst',
            STATE_CHANNEL_FADER_LEVEL: '/state/ch/{value1}/faderlevel',
            STATE_CHANNEL_MUTE: '/state/ch/{value1}/mute',
            STATE_FULL: '/state/full',
            PING: '/ping/{value1}',
        },
        toAutomation: {
            STATE_CHANNEL_PGM: '/state/ch/{value1}/pgm',
            STATE_CHANNEL_PST: '/state/ch/{value1}/pst',
            STATE_CHANNEL_FADER_LEVEL: '/state/ch/{value1}/faderlevel',
            STATE_CHANNEL_MUTE: '/state/ch/{value1}/mute',
            STATE_FULL: '/state/full',
            PONG: '/pong',
        },
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
    },
}

export const AutomationProtocolList = Object.getOwnPropertyNames(
    AutomationPresets
).map((preset) => {
    return {
        value: preset,
        label: AutomationPresets[preset].label,
    }
})
