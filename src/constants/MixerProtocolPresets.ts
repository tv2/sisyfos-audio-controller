import { ArdourMaster } from './mixerProtocols/ardourMaster';
//import { Reaper } from './mixerProtocols/reaper';
import { ReaperMaster } from './mixerProtocols/reaperMaster';
import { BehringerXrMaster } from './mixerProtocols/behringerXrMaster';
import { MidasMaster } from './mixerProtocols/midasMaster';
import { GenericMidi } from './mixerProtocols/genericMidi';
import { LawoClient } from './mixerProtocols/EmberLawo';
import { CasparCGMaster } from './mixerProtocols/casparCGMaster';
import { DMXIS } from './mixerProtocols/DmxIs';
import { YamahaQL1 } from './mixerProtocols/yamahaQL1'
import { YamahaQLCL } from './mixerProtocols/yamahaQLCL'

interface IMessageProtocol {
    mixerMessage: string,
    value: any,
    type: string
}
//import { StuderVistaMaster } from './mixerProtocols/StuderVistaEmber';

// Interface:
import { IMixerProtocolGeneric} from './MixerProtocolInterface'

export const MixerProtocolPresets: { [key: string]: IMixerProtocolGeneric } = Object.assign({
    ardourMaster: ArdourMaster,
/*    reaper: Reaper, */
    reaperMaster: ReaperMaster,
    behringerxrmaster: BehringerXrMaster,
    midasMaster: MidasMaster,
    genericMidi: GenericMidi,
    lawoClient: LawoClient,
    dmxis: DMXIS,
    yamahaQl1: YamahaQL1,
    yamahaQlCl: YamahaQLCL,
/*    studerVistaMaster: StuderVistaMaster, */
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
