import { ArdourMaster } from './mixerProtocols/ardourMaster';
import { Reaper } from './mixerProtocols/reaper';
import { ReaperMaster } from './mixerProtocols/reaperMaster';
import { BehringerXrMaster } from './mixerProtocols/behringerXrMaster';
import { MidasMaster } from './mixerProtocols/midasMaster';
import { GenericMidi } from './mixerProtocols/genericMidi';
import { LawoClient } from './mixerProtocols/EmberLawo';
import { CasparCGMaster } from './mixerProtocols/casparCGMaster';
import { StuderVistaMaster } from './mixerProtocols/StuderVistaEmber';

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
        CHANNEL_NAME: Array<IMixerMessageProtocol>,
        PFL: Array<IMixerMessageProtocol>
        AUX_SEND: Array<IMixerMessageProtocol>
    },
    toMixer: {
        CHANNEL_FADER_LEVEL: Array<IMixerMessageProtocol>,
        CHANNEL_OUT_GAIN: Array<IMixerMessageProtocol>,
        CHANNEL_NAME: Array<IMixerMessageProtocol>,
        PFL_ON: Array<IMixerMessageProtocol>,
        PFL_OFF: Array<IMixerMessageProtocol>
        AUX_SEND: Array<IMixerMessageProtocol>
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

export const emptyMixerMessage = (():IMixerMessageProtocol => {
    return {
        mixerMessage: "",
        value: 0,
        type: "",
        min: 0,
        max: 0,
        zero: 0
    }
})

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
        sources: (ICasparCGChannelLayerPair & {
            producer: string,
            file: string
        })
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
        sources: (ICasparCGChannelLayerPair & {
            producer: string,
            file: string
        })
        options: {
            [key: string]: { // producer property invocation
                [key: string]: string // label: property
            }
        }
    }
}

export const MixerProtocolPresets: { [key: string]: IMixerProtocolGeneric } = Object.assign({
    ardourMaster: ArdourMaster,
    reaper: Reaper,
    reaperMaster: ReaperMaster,
    behringerxrmaster: BehringerXrMaster,
    midasMaster: MidasMaster,
    genericMidi: GenericMidi,
    lawoClient: LawoClient,
    studerVistaMaster: StuderVistaMaster,
}, CasparCGMaster !== undefined ? {
    casparCGMaster: CasparCGMaster
} : {});


export const MixerProtocolList = Object.getOwnPropertyNames(MixerProtocolPresets).map((preset) => {
    return {
        value: preset,
        label: MixerProtocolPresets[preset].label
    };
});
