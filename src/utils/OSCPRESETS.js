export const OscPresets =
    {
        reaper: {
            mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            initializeCommand: [], // oscMessage, value, type
            fromMixer: {
                CHANNEL_FADER_LEVEL: '/track/{channel}/volume',
                CHANNEL_OUT_GAIN: '/track/{channel}/fx/1/fxparam/1/value',
                CHANNEL_VU: '/track/{channel}/vu',
                CHANNEL_NAME: '/track/{channel}/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: '/track/{channel}/volume',
                CHANNEL_OUT_GAIN: '/track/{channel}/fx/1/fxparam/1/value',
            },
        },
        behringer: {
            mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            initializeCommand: [
                {
                    oscMessage: "/mixer",
                    value: 1,
                    type: "f"
                }
            ],
            fromMixer: {
                CHANNEL_FADER_LEVEL: '/not_in_use/',
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
                CHANNEL_VU: '/ch/{channel}/vu',
                CHANNEL_NAME: '/ch/{channel}/config/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: '/not_in_use/',
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
            },
        },
    }
;
