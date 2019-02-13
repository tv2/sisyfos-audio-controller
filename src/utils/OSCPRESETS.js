export const OscPresets =
    {
        reaper: {
            mode: "client", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            leadingZeros: false,
            pingCommand: [
                {
                    oscMessage: "/note_in_use",
                    value: 0,
                    type: "f"
                }
            ],
            pingTime: 0,  //Bypass ping when pingTime is zero
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
            mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                            //client (use feedback from mixers fader level)
            leadingZeros: true,
            pingCommand: [
                {
                    oscMessage: "/xremote",
                    value: "",
                    type: "f"
                },
                {
                    oscMessage: "/meters",
                    value: "/meters/1",
                    type: "s"
                }
            ],
            pingTime: 9500,
            initializeCommand: [
                {
                    oscMessage: "/info",
                    value: 0,
                    type: "f"
                }
            ],
            fromMixer: {
                CHANNEL_FADER_LEVEL: '',
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
                CHANNEL_VU: '/meters/1',
                CHANNEL_NAME: '/ch/{channel}/config/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: '',
                CHANNEL_OUT_GAIN: '/ch/{channel}/mix/fader',
            },
        },
    }
;
