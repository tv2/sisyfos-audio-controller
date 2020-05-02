import {
    MixerProtocolPresets,
    MixerProtocolList,
} from './constants/MixerProtocolPresets'
import { MixerGenericConnection } from './utils/MixerConnection'
import { AutomationConnection } from './utils/AutomationConnection'
import { RemoteConnection } from './utils/RemoteConnection'

import { state } from './reducers/store'
let mixerProtocolPresets = MixerProtocolPresets
let mixerProtocolList = MixerProtocolList

let mixerGenericConnection = new MixerGenericConnection()
let automationConnection = new AutomationConnection()
let remoteConnections: RemoteConnection | null = null
if (state.settings[0].enableRemoteFader) {
    remoteConnections = new RemoteConnection()
}

export {
    mixerProtocolList,
    mixerProtocolPresets,
    mixerGenericConnection,
    automationConnection,
    remoteConnections,
}
