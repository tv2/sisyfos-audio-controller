import {
    MixerProtocolPresets,
    MixerProtocolList,
} from '../../shared/src/constants/MixerProtocolPresets'
import { MixerGenericConnection } from './utils/MixerConnection'
import { AutomationConnection } from './utils/AutomationConnection'
import { RemoteConnection } from './utils/RemoteConnection'

const mixerProtocolPresets = MixerProtocolPresets
const mixerProtocolList = MixerProtocolList

const mixerGenericConnection = new MixerGenericConnection()
const automationConnection = new AutomationConnection()
const remoteConnections = new RemoteConnection()

export {
    mixerProtocolList,
    mixerProtocolPresets,
    mixerGenericConnection,
    automationConnection,
    remoteConnections,
}
