import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

//Redux:
import { createStore } from 'redux';
import { Provider as ReduxProvider} from 'react-redux';
import indexReducer from './reducers/indexReducer';


//Utils:
import { loadSettings } from './utils/SettingsStorage';

const storeRedux = createStore(
    indexReducer
);
window.storeRedux = storeRedux;


storeRedux.dispatch({
    type:'UPDATE_SETTINGS',
    settings: loadSettings(storeRedux.getState())
});

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
