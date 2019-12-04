export interface IMixerProtocolGeneric {
    protocol: string,
    label: string,
    mode: string
    fader: {
        min: number
        max: number
        zero: number
        step: number
    },
    meter: {
        min: number,
        max: number,
        zero: number,
        test: number,
    },
    channelTypes: Array<IChannelTypes>
}

export interface IMixerProtocol extends IMixerProtocolGeneric{
    leadingZeros: boolean,
    pingCommand: Array<IMixerMessageProtocol>,
    pingResponseCommand: Array<IMixerMessageProtocol>,
    pingTime: number,
    initializeCommands: Array<IMixerMessageProtocol>,
}

export interface IChannelTypes {
    channelTypeName: string,
    channelTypeColor: string,
    fromMixer: {
        CHANNEL_FADER_LEVEL: Array<IMixerMessageProtocol>,
        CHANNEL_OUT_GAIN: Array<IMixerMessageProtocol>,
        CHANNEL_VU: Array<IMixerMessageProtocol>,
        CHANNEL_NAME: Array<IMixerMessageProtocol>
        PFL: Array<IMixerMessageProtocol>
        NEXT_SEND: Array<IMixerMessageProtocol>
        THRESHOLD: Array<IMixerMessageProtocol>
        RATIO: Array<IMixerMessageProtocol>
        LOW: Array<IMixerMessageProtocol>
        MID: Array<IMixerMessageProtocol>
        HIGH: Array<IMixerMessageProtocol>
        AUX_LEVEL: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_ON: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_OFF: Array<IMixerMessageProtocol>
    },
    toMixer: {
        CHANNEL_FADER_LEVEL: Array<IMixerMessageProtocol>,
        CHANNEL_OUT_GAIN: Array<IMixerMessageProtocol>,
        CHANNEL_NAME: Array<IMixerMessageProtocol>,
        PFL_ON: Array<IMixerMessageProtocol>,
        PFL_OFF: Array<IMixerMessageProtocol>
        NEXT_SEND: Array<IMixerMessageProtocol>
        THRESHOLD: Array<IMixerMessageProtocol>
        RATIO: Array<IMixerMessageProtocol>
        LOW: Array<IMixerMessageProtocol>
        MID: Array<IMixerMessageProtocol>
        HIGH: Array<IMixerMessageProtocol>
        AUX_LEVEL: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_ON: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_OFF: Array<IMixerMessageProtocol>
    }
}

interface IMixerMessageProtocol {
    mixerMessage: string,
    value: any,
    type: string,
    min: number,
    max: number,
    zero: number
}

export const emptyMixerMessage = (): IMixerMessageProtocol => {
    return {
        mixerMessage: "none",
        value: 0,
        type: "",
        min: 0,
        max: 0,
        zero: 0
    }
}

// CasparCG Specific interfaces:
export interface ICasparCGChannelLayerPair {
    channel: number
    layer: number
}

export interface ICasparCGMixerGeometryFile {
    label?: string,
    channelLabels?: string[],
    fromMixer: {
        CHANNEL_VU: Array<string[]>,
    }
    toMixer: {
        PGM_CHANNEL_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>,
        MONITOR_CHANNEL_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
    }
    sourceOptions?: {
        sources: Array<(ICasparCGChannelLayerPair & {
            producer: string,
            file: string
        })>
        options: {
            [key: string]: { // producer property invocation
                [key: string]: string // label: property
            }
        }
    }
}

export interface ICasparCGMixerGeometry extends IMixerProtocolGeneric {
    studio: string,
    leadingZeros: boolean,
    pingTime: number,
    fromMixer: {
        // CHANNEL_FADER_LEVEL: ChannelLayerPair[],
        // CHANNEL_OUT_GAIN: ChannelLayerPair[],
        CHANNEL_VU: Array<string[]>,
    },
    toMixer: {
        PGM_CHANNEL_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>,
        MONITOR_CHANNEL_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>,
    }
    channelLabels?: string[],
    sourceOptions?: {
        sources: Array<(ICasparCGChannelLayerPair & {
            producer: string,
            file: string
        })>
        options: {
            [key: string]: { // producer property invocation
                [key: string]: string // label: property
            }
        }
    }
}

