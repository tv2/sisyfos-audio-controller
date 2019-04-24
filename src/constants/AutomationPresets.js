//While developing mixer specific settings will be in one file.
//At first release these will be in seperate files
//So it´s easy to add new equipment.

export const AutomationPresets = {

    sofie: {
        protocol: 'OSC',
        label: 'Sofie Automation',
        mode: "client",
        leadingZeros: true,
        initializeCommand: [
            {
                oscMessage: "/info",
                value: 0,
                type: "f"
            }
        ],
        fromAutomation: {
            CHANNEL_PGM_ON_OFF: '/ch/{channel}/mix/pgm',
            CHANNEL_PST_ON_OFF: '/ch/{channel}/mix/pst',
            X_MIX: '/take'
        },
        toAutomation: {
            CHANNEL_PGM_ON_OFF: '/ch/{channel}/mix/pgm',
            CHANNEL_PST_ON_OFF: '/ch/{channel}/mix/pst',
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
