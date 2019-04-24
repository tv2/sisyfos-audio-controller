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
            CHANNEL_FADER_LEVEL: '/ch/{channel}/mix/fader',        //'none' ignores this command
            CHANNEL_OUT_GAIN: '/ch/{channel}/mix/01/level',
            CHANNEL_VU: '/meters/1',
            CHANNEL_NAME: '/ch/{channel}/config/name',
        },
        toAutomation: {
            CHANNEL_FADER_LEVEL: '/ch/{channel}/mix/fader',
            CHANNEL_OUT_GAIN: '/ch/{channel}/mix/01/level',
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
        label: MixerProtocolPresets[preset].label
    };
});
