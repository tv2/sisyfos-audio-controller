import React from 'react';
import ReactDom from 'react-dom';
import App from './components/App';
import { socketClientHandlers } from './utils/SocketClientHandlers'
import io from 'socket.io-client'

//Redux:
import { createStore } from 'redux';
import { Provider as ReduxProvider} from 'react-redux';
import indexReducer from './../server/reducers/indexReducer';
import { SOCKET_GET_SNAPSHOT_LIST } from '../server/constants/SOCKET_IO_DISPATCHERS';

declare global {
    interface Window {
        storeRedux: any
        mixerProtocol: any
        mixerProtocolPresets: any
        mixerProtocolList: any
        socketIoClient: any
        snapshotFileList: any
    }
}

// *** Uncomment to log Socket I/O:
// localStorage.debug = 'socket.io-client:socket';

const storeRedux = createStore(
    indexReducer
);
window.storeRedux = storeRedux
window.socketIoClient = io()
window.socketIoClient.emit(SOCKET_GET_SNAPSHOT_LIST)


console.log('Setting up SocketIO connection')
socketClientHandlers()
window.socketIoClient.emit('get-store', 'update local store');
window.socketIoClient.emit('get-settings', 'update local settings');
window.socketIoClient.emit('get-mixerprotocol', 'get selected mixerprotocol')



ReactDom.render(
    <ReduxProvider store={storeRedux}>
        <App />
    </ReduxProvider>
    ,
    document.getElementById('root')
)
