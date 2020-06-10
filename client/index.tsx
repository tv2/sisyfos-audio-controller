import React from 'react'
import ReactDom from 'react-dom'
import App from './components/App'
import { socketClientHandlers } from './utils/SocketClientHandlers'
import io from 'socket.io-client'

//Redux:
import { createStore } from 'redux'
import { Provider as ReduxProvider } from 'react-redux'
import indexReducer from '../server/reducers/indexReducer'
import {
    SOCKET_GET_SNAPSHOT_LIST,
    SOCKET_GET_CCG_LIST,
    SOCKET_GET_MIXER_PRESET_LIST,
} from '../server/constants/SOCKET_IO_DISPATCHERS'

import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { IMixerProtocol } from '../server/constants/MixerProtocolInterface'

declare global {
    interface Window {
        storeRedux: any
        mixerProtocol: IMixerProtocol
        mixerProtocolPresets: any
        mixerProtocolList: any
        socketIoClient: any
        snapshotFileList: string[]
        ccgFileList: string[]
        mixerPresetList: string[]
    }
}

// *** Uncomment to log Socket I/O:
// localStorage.debug = 'socket.io-client:socket';

const storeRedux = createStore(indexReducer)
window.storeRedux = storeRedux
window.socketIoClient = io()
window.socketIoClient.emit(SOCKET_GET_SNAPSHOT_LIST)
window.socketIoClient.emit(SOCKET_GET_CCG_LIST)
window.socketIoClient.emit(SOCKET_GET_MIXER_PRESET_LIST)

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
