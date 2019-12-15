import { ArdourMaster } from './mixerProtocols/ardourMaster';
import { ReaperMaster } from './mixerProtocols/reaperMaster';
import { BehringerXrMaster } from './mixerProtocols/behringerXrMaster';
import { MidasMaster } from './mixerProtocols/midasMaster';
import { GenericMidi } from './mixerProtocols/genericMidi';
import { LawoClient } from './mixerProtocols/EmberLawo';
import { CasparCGMaster } from './mixerProtocols/casparCGMaster';
import { DMXIS } from './mixerProtocols/DmxIs';
import { YamahaQLCL } from './mixerProtocols/yamahaQLCL'
import { SSLSystemT } from './mixerProtocols/SSLsystemT'

interface IMessageProtocol {
    mixerMessage: string,
    value: any,
    type: string
}
import { StuderVistaMaster } from './mixerProtocols/StuderVistaEmber';
// Interface:
import { IMixerProtocolGeneric} from './MixerProtocolInterface'

export const MixerProtocolPresets: { [key: string]: IMixerProtocolGeneric } = Object.assign({
    ardourMaster: ArdourMaster,
    reaperMaster: ReaperMaster,
    behringerxrmaster: BehringerXrMaster,
    midasMaster: MidasMaster,
    genericMidi: GenericMidi,
    lawoClient: LawoClient,
    dmxis: DMXIS,
    yamahaQlCl: YamahaQLCL,
    sslSystemT: SSLSystemT,
    studerVistaMaster: StuderVistaMaster,
}, CasparCGMaster !== undefined ? {
    casparCGMaster: CasparCGMaster
} : {});
/*
*/

export const MixerProtocolList = Object.getOwnPropertyNames(MixerProtocolPresets).map((preset) => {
    return {
        value: preset,
        label: MixerProtocolPresets[preset].label
    };
});
