//Node Modules:
import { store, state } from '../reducers/store'
import { HuiMidiRemoteConnection } from './remoteConnections/HuiMidiRemoteConnection'

export class RemoteConnection {
    store: any
    remoteConnection: any

    constructor() {
        if (!state.settings[0].enableRemoteFader) {
            return
        }
        this.remoteConnection = new HuiMidiRemoteConnection()
    }

    updateRemoteFaderState(channelIndex: number, outputLevel: number) {
        this.remoteConnection.updateRemoteFaderState(channelIndex, outputLevel)
    }

    updateRemotePgmPstPfl(channelIndex: number) {
        this.remoteConnection.updateRemotePgmPstPfl(channelIndex)
    }
}
