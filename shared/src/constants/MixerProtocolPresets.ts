import { ArdourMaster } from './mixerProtocols/ardourMaster'
import { ReaperMaster } from './mixerProtocols/reaperMaster'
import { BehringerXrMaster } from './mixerProtocols/behringerXrMaster'
import { MidasMaster } from './mixerProtocols/midasMaster'
import { GenericMidi } from './mixerProtocols/genericMidi'
import { LawoRelayVrx4 } from './mixerProtocols/LawoRelayVrx4'
import { LawoMC2 } from './mixerProtocols/LawoMC2'
import { LawoRuby } from './mixerProtocols/LawoRuby'
import { CasparCGMaster } from './mixerProtocols/casparCGMaster'
import { DMXIS } from './mixerProtocols/DmxIs'
import { YamahaQLCL } from './mixerProtocols/yamahaQLCL'
import { SSLSystemT } from './mixerProtocols/SSLsystemT'
import { StuderOnAirMaster } from './mixerProtocols/StuderOnAirEmber'
import { StuderVistaMaster } from './mixerProtocols/StuderVistaEmber'
import { VMix } from './mixerProtocols/vMix'
import { Atem } from './mixerProtocols/atem'

// Interface:
import { IMixerProtocolGeneric } from './MixerProtocolInterface'

export const MixerProtocolPresets: {
    [key: string]: IMixerProtocolGeneric
} = Object.assign(
    {
        ardourMaster: ArdourMaster,
        reaperMaster: ReaperMaster,
        behringerxrmaster: BehringerXrMaster,
        midasMaster: MidasMaster,
        genericMidi: GenericMidi,
        lawoRelayVrx4: LawoRelayVrx4,
        lawoMC2: LawoMC2,
        lawoRuby: LawoRuby,
        dmxis: DMXIS,
        yamahaQlCl: YamahaQLCL,
        sslSystemT: SSLSystemT,
        studerOnAirMaster: StuderOnAirMaster,
        studerVistaMaster: StuderVistaMaster,
        vMix: VMix,
        atem: Atem,
    },
    {
        casparCGMaster: CasparCGMaster,
    }
)
/*
 */

export const MixerProtocolList = Object.getOwnPropertyNames(
    MixerProtocolPresets
).map((preset) => {
    return {
        value: preset,
        label: MixerProtocolPresets[preset].label,
    }
})
