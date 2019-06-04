import React, { Component } from 'react';
import { connect } from "react-redux";
import { IStore } from '../reducers/indexReducer';

import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';

//Utils:
import { loadSnapshotState, saveSnapshotState } from '../utils/SettingsStorage';
import { MixerConnection } from '../utils/MixerConnection';
import { AutomationConnection } from '../utils/AutomationConnection';
import { HuiMidiRemoteConnection } from '../utils/HuiMidiRemoteConnection';


class App extends Component<any, any> {

    constructor(props: any) {
        super(props)
    }

    componentWillMount() {
        (window as any).mixerConnection = new MixerConnection();
        (window as any).automationConnection = new AutomationConnection();
        (window as any).huiRemoteConnection = new HuiMidiRemoteConnection();
        this.snapShopStoreTimer();
        loadSnapshotState(this.props.store.channels[0], this.props.store.settings[0].numberOfChannels);
    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                saveSnapshotState(this.props.store.channels[0]);
            },
            2000);
    }

    render() {
        return (
        <div>
            <Channels />
            {this.props.store.settings[0].showSettings ? <Settings/> : <div></div>}
        </div>
        )
    }
}


const mapStateToProps = (state: any) => {
    return {
        store: state
    }
}

export default connect<any, any>(mapStateToProps)(App) as any;
