export enum fxParamsList {
    EqGain01,
    EqGain02,
    EqGain03,
    EqGain04,
    EqFreq01,
    EqFreq02,
    EqFreq03,
    EqFreq04,
    EqQ01,
    EqQ02,
    EqQ03,
    EqQ04,
    DelayTime,
    GainTrim,
    CompThrs,
    CompRatio,
    CompKnee,
    CompMakeUp,
    CompAttack,
    CompHold,
    CompRelease,
    CompOnOff,
}
export enum VuLabelConversionType {
    Linear = 'linear',
    Decibel = 'decibel',
    DecibelRuby = 'decibelRuby',
    DecibelMC2 = 'decibelMC2',
}
export interface IMixerProtocolGeneric {
    protocol: string
    fxList?: {}
    label: string
    presetFileExtension?: string
    loadPresetCommand?: Array<IMixerMessageProtocol>
    MAX_UPDATES_PER_SECOND: number
    vuLabelConversionType?: VuLabelConversionType
    vuLabelValues?: Array<number>
    fader?: {
        min: number
        max: number
        zero: number
        step: number
    }
    meter?: {
        min: number
        max: number
        zero: number
        test: number
    }
    channelTypes: Array<IChannelTypes>
}

export interface IMixerProtocol extends IMixerProtocolGeneric {
    leadingZeros?: boolean
    pingCommand?: Array<IMixerMessageProtocol> // Simple command for pinging Audio mixer
    pingResponseCommand?: Array<IMixerMessageProtocol> // Ping commands that expects responses
    pingTime?: number // How often should mixer ping the pingCommands
    mixerTimeout?: number // Max time between responses from AudioMixer
    initializeCommands?: Array<IMixerMessageProtocol>
}

export interface IChannelTypes {
    channelTypeName: string
    channelTypeColor: string
    fromMixer: {
        CHANNEL_INPUT_GAIN?: Array<IMixerMessageProtocol>
        CHANNEL_INPUT_SELECTOR?: Array<IMixerMessageProtocol>
        CHANNEL_OUT_GAIN?: Array<IMixerMessageProtocol>
        CHANNEL_VU?: Array<IMixerMessageProtocol>
        CHANNEL_VU_REDUCTION?: Array<IMixerMessageProtocol>
        CHANNEL_NAME?: Array<IMixerMessageProtocol>
        PFL?: Array<IMixerMessageProtocol>
        NEXT_SEND?: Array<IMixerMessageProtocol>
        [FX_PARAM: number]: Array<IMixerMessageProtocol>
        AUX_LEVEL?: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_ON?: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_OFF?: Array<IMixerMessageProtocol>
        CHANNEL_AMIX?: Array<IMixerMessageProtocol>
    }
    toMixer: {
        CHANNEL_INPUT_GAIN?: Array<IMixerMessageProtocol>
        CHANNEL_INPUT_SELECTOR?: Array<IMixerMessageProtocol>
        CHANNEL_OUT_GAIN?: Array<IMixerMessageProtocol>
        CHANNEL_NAME?: Array<IMixerMessageProtocol>
        PFL_ON?: Array<IMixerMessageProtocol>
        PFL_OFF?: Array<IMixerMessageProtocol>
        NEXT_SEND?: Array<IMixerMessageProtocol>
        [FX_PARAM: number]: Array<IMixerMessageProtocol>
        AUX_LEVEL?: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_ON?: Array<IMixerMessageProtocol>
        CHANNEL_MUTE_OFF?: Array<IMixerMessageProtocol>
        CHANNEL_AMIX?: Array<IMixerMessageProtocol>
    }
}

interface IMixerMessageProtocol {
    mixerMessage: string
    value?: any
    type?: string
    min?: number
    max?: number
    zero?: number
    label?: string
    valueAsLabels?: Array<string>
    valueLabel?: string
    minLabel?: number
    maxLabel?: number
    zeroLabel?: number
}

export interface IFxProtocol {
    key: fxParamsList
    params: Array<IMixerMessageProtocol>
}

export const emptyMixerMessage = (): IMixerMessageProtocol => {
    return {
        mixerMessage: 'none',
        value: 0,
        type: '',
        min: 0,
        max: 0,
        zero: 0,
    }
}

// CasparCG Specific interfaces:
export interface ICasparCGChannelLayerPair {
    channel: number
    layer: number
}

export interface ICasparCGMixerGeometryFile {
    label?: string
    channelLabels?: string[]
    fromMixer: {
        CHANNEL_VU: Array<string[]>
    }
    toMixer: {
        PGM_CHANNEL_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
        PFL_AUX_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
        NEXT_AUX_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
        CHANNEL_INPUT_SELECTOR?: Array<IMixerMessageProtocol>
    }
    sourceOptions?: {
        sources: Array<
            ICasparCGChannelLayerPair & {
                producer: string
                file: string
            }
        >
        options: {
            [key: string]: {
                // producer property invocation
                [key: string]: string // label: property
            }
        }
    }
}

export interface ICasparCGMixerGeometry extends IMixerProtocolGeneric {
    studio: string
    leadingZeros: boolean
    pingTime: number
    fromMixer: {
        // CHANNEL_FADER_LEVEL: ChannelLayerPair[],
        // CHANNEL_OUT_GAIN: ChannelLayerPair[],
        CHANNEL_VU: Array<string[]>
    }
    toMixer: {
        PGM_CHANNEL_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
        PFL_AUX_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
        NEXT_AUX_FADER_LEVEL: Array<ICasparCGChannelLayerPair[]>
        CHANNEL_INPUT_SELECTOR?: Array<IMixerMessageProtocol>
    }
    channelLabels?: string[]
    sourceOptions?: {
        sources: Array<
            ICasparCGChannelLayerPair & {
                producer: string
                file: string
            }
        >
        options: {
            [key: string]: {
                // producer property invocation
                [key: string]: string // label: property
            }
        }
    }
}
