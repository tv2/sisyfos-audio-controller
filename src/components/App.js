import React, { Component } from 'react';
import { connect } from "react-redux";


import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';

//Utils:
import { loadSnapshotState, saveSnapshotState } from '../utils/SettingsStorage';
import { MixerConnection } from '../utils/MixerConnection';


class App extends Component {
    componentWillMount() {
        this.mixerConnection = new MixerConnection(this.props.store);
        this.snapShopStoreTimer();
        loadSnapshotState(this.props.store.channels[0]);
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
            <Channels mixerConnection = {this.mixerConnection} />
            {this.props.store.settings[0].showSettings ? <Settings/> : <div></div>}
        </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(App);
