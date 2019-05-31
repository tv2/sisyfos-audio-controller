//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.

export interface IRemoteProtocol {
    protocol: string,
    label: string,
    mode: string,
    leadingZeros: boolean,
    initializeCommands: [
        {
            oscMessage: string,
            value: string,
            type: string
        }
    ],
    fromRemote: {
        CHANNEL_PGM_ON_OFF: string,
        CHANNEL_PST_ON_OFF: string,
        CHANNEL_PFL_ON_OFF: string,
        CHANNEL_FADER_LEVEL: string,
        GRP_FADER_PGM_ON_OFF: string,
        GRP_FADER_PST_ON_OFF: string,
        GRP_FADER_LEVEL: string,
        X_MIX: string,
        FADE_TO_BLACK: string,
        SNAP_RECALL: string,
    },
    toRemote: {
        STATE_CHANNEL_PGM: string,
        STATE_CHANNEL_PST: string,
        STATE_CHANNEL_PFL: string,
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


export const RemoteFaderPresets: { [key: string]: IRemoteProtocol } = {

    hui: {
        protocol: 'MIDI',
        label: 'HUI Midicontroller',
        mode: "client",
        leadingZeros: true,
        initializeCommands: [
            {
                oscMessage: "/info",
                value: "",
                type: "f"
            }
        ],
        fromRemote: {
            CHANNEL_PGM_ON_OFF: '/ch/{value1}/mix/pgm',
            CHANNEL_PST_ON_OFF: '/ch/{value1}/mix/pst',
            CHANNEL_PFL_ON_OFF: '/ch/{value1}/solo',
            CHANNEL_FADER_LEVEL: "39",
            GRP_FADER_PGM_ON_OFF: '/grp/{value1}/pgm',
            GRP_FADER_PST_ON_OFF: '/grp/{value1}/pst',
            GRP_FADER_LEVEL: '/grp/{value1}/faderlevel',
            X_MIX: '/take',
            FADE_TO_BLACK: '/fadetoblack',
            SNAP_RECALL: '/snap/{value1}',
        },
        toRemote: {
            STATE_CHANNEL_PGM: '/state/ch/{value1}/mix/pgm',
            STATE_CHANNEL_PST: '/state/ch/{value1}/mix/pst',
            STATE_CHANNEL_PFL: '/state/ch/{value1}/solo',
            STATE_CHANNEL_FADER_LEVEL: "39",
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


export const RemoteFaderProtocolList = Object.getOwnPropertyNames(RemoteFaderPresets).map((preset) => {
    return {
        value: preset,
        label: RemoteFaderPresets[preset].label
    };
});
