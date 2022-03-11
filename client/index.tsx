import React from 'react'
import ReactDom from 'react-dom'
import App from './src/components/App'
import { socketClientHandlers } from './src/utils/SocketClientHandlers'
import io from 'socket.io-client'

//Redux:
import storeRedux from '../shared/src/reducers/store'
import { Provider as ReduxProvider } from 'react-redux'
import {
    SOCKET_GET_SNAPSHOT_LIST,
    SOCKET_GET_CCG_LIST,
    SOCKET_GET_MIXER_PRESET_LIST,
    SOCKET_GET_PAGES_LIST,
} from '../shared/src/constants/SOCKET_IO_DISPATCHERS'

import { I18nextProvider } from 'react-i18next'
import i18n from './src/utils/i18n'
import { IMixerProtocol } from '../shared/src/constants/MixerProtocolInterface'

declare global {
    interface Window {
        storeRedux: any
        reduxState: any
        mixerProtocol: IMixerProtocol
        mixerProtocolPresets: any
        mixerProtocolList: any
        socketIoClient: any
        socketIoVuClient: any
        snapshotFileList: string[]
        ccgFileList: string[]
        mixerPresetList: string[]
    }
}

// *** Uncomment to log Socket I/O:
// localStorage.debug = 'socket.io-client:socket';

window.storeRedux = storeRedux

//Subscribe to redux store:
window.reduxState = window.storeRedux.getState()
const unsubscribe = window.storeRedux.subscribe(() => {
    window.reduxState = window.storeRedux.getState()
})

window.socketIoClient = io()
window.socketIoClient.emit(SOCKET_GET_SNAPSHOT_LIST)
window.socketIoClient.emit(SOCKET_GET_CCG_LIST)
window.socketIoClient.emit(SOCKET_GET_MIXER_PRESET_LIST)
window.socketIoClient.emit(SOCKET_GET_PAGES_LIST)

console.log('Setting up SocketIO connection')
socketClientHandlers()
window.socketIoClient.emit('get-store', 'update local store')
window.socketIoClient.emit('get-settings', 'update local settings')
window.socketIoClient.emit('get-mixerprotocol', 'get selected mixerprotocol')

ReactDom.render(
    <ReduxProvider store={storeRedux}>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </ReduxProvider>,
    document.getElementById('root')
)
