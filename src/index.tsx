import React from 'react';
import ReactDom from 'react-dom';
import App from './components/App';
import { socketIoHandlers } from './utils/SocketIoHandlers'
import io from 'socket.io-client'

//Redux:
import { createStore } from 'redux';
import { Provider as ReduxProvider} from 'react-redux';
import indexReducer from './../server/reducers/indexReducer';

declare global {
    interface Window {
        storeRedux: any
        mixerGenericConnection: any
        huiRemoteConnection: any
        mixerProtocol: any
        mixerProtocolPresets: any
        mixerProtocolList: any
        fs: any
        net: any
        socketIoClient: any
    }
}



const storeRedux = createStore(
    indexReducer
);
window.storeRedux = storeRedux
window.socketIoClient = io()


console.log('Setting up SocketIO connection')
socketIoHandlers()
window.socketIoClient.emit('get-store', 'update local store');
window.socketIoClient.emit('get-settings', 'update local settings');
window.socketIoClient.emit('get-mixerprotocol', 'get selected mixerprotocol')
console.log('SocketIO : ', window.socketIoClient)



ReactDom.render(
    <ReduxProvider store={storeRedux}>
        <App />
    </ReduxProvider>
    ,
    document.getElementById('root')
)
