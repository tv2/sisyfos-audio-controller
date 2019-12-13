import * as React from 'react';
import { connect } from "react-redux";
import { IStore } from '../../server/reducers/indexReducer';


import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';
import Storage from './RoutingStorage'

//Utils:
import { MixerGenericConnection } from '../utils/MixerConnection';
import { HuiMidiRemoteConnection } from '../utils/HuiMidiRemoteConnection';

export interface IAppProps {
    store: IStore
}

class App extends React.Component<IAppProps> {

    constructor(props: IAppProps) {
        super(props)
    }

    componentWillMount() {
        (window as any).mixerGenericConnection = new MixerGenericConnection();
        if (this.props.store.settings[0].enableRemoteFader){
            (window as any).huiRemoteConnection = new HuiMidiRemoteConnection();
        }

        // THIS IS THE BASIC IPC - REDUX IMPLEMENTATION UNTIL A MIDDLEWARE IS
        // BUILD ON SERVERSIDE:

        let timer = setInterval(() => {
            window.socketIoClient.emit('get-mixerprotocol', 'get selected mixerprotocol')
            window.socketIoClient.emit('get-store', 'update local store');
            window.socketIoClient.emit('get-settings', 'update local settings');
        },
        200)

        // ** UNCOMMENT TO DUMP A FULL STORE:
        // const fs = require('fs')
        // fs.writeFileSync('src/components/__tests__/__mocks__/parsedFullStore-UPDATE.json', JSON.stringify(window.storeRedux.getState()))
        
    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return (
            nextProps.store.settings[0].showSettings != this.props.store.settings[0].showSettings
            || nextProps.store.settings[0].showStorage != this.props.store.settings[0].showStorage
        )
    }

    render() {
        return (
        <div>
            <Channels />
            {this.props.store.settings[0].showStorage ? <Storage/> : null}
            {this.props.store.settings[0].showSettings ? <Settings/> : null}
        </div>
        )
    }
}


const mapStateToProps = (state: any): IAppProps => {
    return {
        store: state
    }
}

export default connect<any, IAppProps>(mapStateToProps)(App) as any;
