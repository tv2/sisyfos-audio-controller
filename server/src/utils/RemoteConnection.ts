import { HuiMidiRemoteConnection } from './remoteConnections/HuiMidiRemoteConnection'
import { SkaarhojRemoteConnection } from './remoteConnections/SkaarhojRemoteConnection'

export class RemoteConnection {
    store: any
    remoteConnection: any

    constructor() {
        // HUI SUPPORT IS DISABLED AND SKAARHOJ IS ALWAYS ON
        // HUI needs to be updated so for now it´s always disabled.
        this.remoteConnection = new SkaarhojRemoteConnection()
        /*
        if (state.settings[0].enableRemoteFader) {
            this.remoteConnection = new HuiMidiRemoteConnection()
        }
        */
    }

    updateRemoteFaderState(channelIndex: number, outputLevel: number) {
        this.remoteConnection.updateRemoteFaderState(channelIndex, outputLevel)
    }

    updateRemoteAuxPanels() {
        this.remoteConnection.updateRemoteAuxPanels()
    }

    updateRemotePgmPstPfl(channelIndex: number) {
        this.remoteConnection.updateRemotePgmPstPfl(channelIndex)
    }
}
