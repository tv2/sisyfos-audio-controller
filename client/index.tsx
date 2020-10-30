import React from 'react'
import ReactDom from 'react-dom'
import App from './components/App'
import { socketClientHandlers, vuMeters } from './utils/SocketClientHandlers'
import io from 'socket.io-client'

//Redux:
import { createStore } from 'redux'
import { Provider as ReduxProvider } from 'react-redux'
import indexReducer from '../server/reducers/indexReducer'
import {
    SOCKET_GET_SNAPSHOT_LIST,
    SOCKET_GET_CCG_LIST,
    SOCKET_GET_MIXER_PRESET_LIST,
    SOCKET_GET_PAGES_LIST,
} from '../server/constants/SOCKET_IO_DISPATCHERS'

import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { IMixerProtocol } from '../server/constants/MixerProtocolInterface'
import { ICustomPages } from '../server/reducers/settingsReducer'

declare global {
    interface Window {
        storeRedux: any
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

const storeRedux = createStore(indexReducer)
window.storeRedux = storeRedux
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

if (!window.location.search.includes('vu=0')) {
    window.socketIoVuClient = io(
        document.location.protocol + '//' + document.location.hostname + ':1178'
    )
    window.socketIoVuClient.on('connect', () => console.log('connection!'))
    window.socketIoVuClient.on(
        'channel',
        (faderIndex: number, channelIndex: number, level: number) => {
            // console.log('got vu!', ...payload)
            if (!vuMeters[faderIndex]) vuMeters[faderIndex] = []
            vuMeters[faderIndex][channelIndex] = level
        }
    )
    // window.socketIoVuClient.on('reduction', (...payload: any[]) =>
    //     console.log('got reduction!', ...payload)
    // )
}

ReactDom.render(
    <ReduxProvider store={storeRedux}>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </ReduxProvider>,
    document.getElementById('root')
)
