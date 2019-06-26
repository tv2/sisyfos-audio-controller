//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.

export interface IAutomationProtocol {
    protocol: string,
    label: string,
    mode: string,
    leadingZeros: boolean,
    initializeCommands: [
        {
            mixerMessage: string,
            value: string,
            type: string
        }
    ],
    fromAutomation: {
        CHANNEL_PGM_ON_OFF: string,
        CHANNEL_PST_ON_OFF: string,
        CHANNEL_FADER_LEVEL: string,
        CHANNEL_VISIBLE: string,
        GRP_FADER_PGM_ON_OFF: string,
        GRP_FADER_PST_ON_OFF: string,
        GRP_FADER_LEVEL: string,
        GRP_FADER_VISIBLE: string,
        X_MIX: string,
        SET_LABEL: string,
        FADE_TO_BLACK: string,
        SNAP_RECALL: string,
        STATE_CHANNEL_PGM: string,
        STATE_CHANNEL_PST: string,
        STATE_CHANNEL_FADER_LEVEL: string,
        STATE_GRP_FADER_PGM: string,
        STATE_GRP_FADER_PST: string,
        STATE_GRP_FADER_LEVEL: string,
    },
    toAutomation: {
        STATE_CHANNEL_PGM: string,
        STATE_CHANNEL_PST: string,
        STATE_CHANNEL_FADER_LEVEL: string,
        STATE_GRP_FADER_PGM: string,
        STATE_GRP_FADER_PST: string,
        STATE_GRP_FADER_LEVEL: string,
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


export const AutomationPresets: { [key: string]: IAutomationProtocol } = {

    sofie: {
        protocol: 'OSC',
        label: 'Sofie Automation',
        mode: "client",
        leadingZeros: true,
        initializeCommands: [
            {
                mixerMessage: "/info",
                value: "",
                type: "f"
            }
        ],
        fromAutomation: {
            CHANNEL_PGM_ON_OFF: '/ch/{value1}/mix/pgm',
            CHANNEL_PST_ON_OFF: '/ch/{value1}/mix/pst',
            CHANNEL_FADER_LEVEL: '/ch/{value1}/mix/faderlevel',
            CHANNEL_VISIBLE: '/ch/{value1}/visible',
            GRP_FADER_PGM_ON_OFF: '/grp/{value1}/pgm',
            GRP_FADER_PST_ON_OFF: '/grp/{value1}/pst',
            GRP_FADER_LEVEL: '/grp/{value1}/faderlevel',
            GRP_FADER_VISIBLE: '/grp/{value1}/visible',
            X_MIX: '/take',
            SET_LABEL: '/ch/{value1}/label',
            FADE_TO_BLACK: '/fadetoblack',
            SNAP_RECALL: '/snap/{value1}',
            STATE_CHANNEL_PGM: '/state/ch/{value1}/mix/pgm',
            STATE_CHANNEL_PST: '/state/ch/{value1}/mix/pst',
            STATE_CHANNEL_FADER_LEVEL: '/state/ch/{value1}/mix/faderlevel',
            STATE_GRP_FADER_PGM: '/state/grp/{value1}/pgm',
            STATE_GRP_FADER_PST: '/state/grp/{value1}/pst',
            STATE_GRP_FADER_LEVEL: '/state/grp/{value1}/faderlevel',
        },
        toAutomation: {
            STATE_CHANNEL_PGM: '/state/ch/{value1}/mix/pgm',
            STATE_CHANNEL_PST: '/state/ch/{value1}/mix/pst',
            STATE_CHANNEL_FADER_LEVEL: '/state/ch/{value1}/mix/faderlevel',
            STATE_GRP_FADER_PGM: '/state/grp/{value1}/pgm',
            STATE_GRP_FADER_PST: '/state/grp/{value1}/pst',
            STATE_GRP_FADER_LEVEL: '/state/grp/{value1}/faderlevel',
        },
        fader: {
            min: 0,
            max: 1,
            zero: 0.75,
            step: 0.01,
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


export const AutomationProtocolList = Object.getOwnPropertyNames(AutomationPresets).map((preset) => {
    return {
        value: preset,
        label: AutomationPresets[preset].label
    };
});
