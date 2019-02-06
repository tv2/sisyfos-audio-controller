export const OscPresets =
    {
        reaper: {
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
            fromMixer: {
                CHANNEL_FADER_LEVEL: '/ch/{channel}/volume',
                CHANNEL_OUT_GAIN: '/ch/{channel}/fx/1/fxparam/1/value',
                CHANNEL_VU: '/ch/{channel}/vu',
                CHANNEL_NAME: '/ch/{channel}/name',
            },
            toMixer: {
                CHANNEL_FADER_LEVEL: '/ch/{channel}/volume',
                CHANNEL_OUT_GAIN: '/ch/{channel}/fx/1/fxparam/1/value',
            },
        },
    }
;
