import { ArdourMaster } from './protocols/ardourMaster';
import { Reaper } from './protocols/reaper';
import { BehringerXrMaster } from './protocols/behringerXrMaster';
import { BehringerXrClient } from './protocols/behringerXrClient';
import { MidasMaster } from './protocols/midasMaster';
import { MidasClient } from './protocols/midasClient';
import { GenericMidi } from './protocols/genericMidi';

export interface IMixerProtocol {
    protocol: string,
    label: string,
    mode: string,
    leadingZeros: boolean,
    pingCommand: Array<IMessageProtocol>,
    pingTime: number,
    initializeCommands: Array<IMessageProtocol>,
    fromMixer: {
        CHANNEL_FADER_LEVEL: string,
        CHANNEL_OUT_GAIN: string,
        CHANNEL_VU: string,
        CHANNEL_NAME: string,
        GRP_OUT_GAIN: string,
        GRP_VU: string,
        GRP_NAME: string,
        PFL: string
    },
    toMixer: {
        CHANNEL_FADER_LEVEL: string,
        CHANNEL_OUT_GAIN: string,
        GRP_OUT_GAIN: string,
        PFL_ON: string,
        PFL_OFF: string
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
    }
}

interface IMessageProtocol {
    oscMessage: string,
    value: any,
    type: string
}

export const MixerProtocolPresets: { [key: string]: IMixerProtocol } = {
    ardourMaster: ArdourMaster,
    reaper: Reaper,
    behringerxrmaster: BehringerXrMaster,
    behringerxrclient: BehringerXrClient,
    midasMaster: MidasMaster,
    midasClient: MidasClient,
    genericMidi: GenericMidi,
};


export const MixerProtocolList = Object.getOwnPropertyNames(MixerProtocolPresets).map((preset) => {
    return {
        value: preset,
        label: MixerProtocolPresets[preset].label
    };
});
