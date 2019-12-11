import * as React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import { ipcRendererHandlers } from './utils/IpcRenderHandlers'

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
        dialog: any
        getPath: any
        ipcRenderer: any
    }
}



const storeRedux = createStore(
    indexReducer
);
window.storeRedux = storeRedux

ipcRendererHandlers()
window.ipcRenderer.send('get-store', 'update local store');
window.ipcRenderer.send('get-settings', 'update local settings');
window.ipcRenderer.send('get-mixerprotocol', 'get selected mixerprotocol')

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement('div');

root.id = 'root';
document.body.appendChild(root);

// Now we can render our application into it
render(
    <ReduxProvider store={storeRedux}>
        <App />
    </ReduxProvider>
    ,
    document.getElementById('root')
)
