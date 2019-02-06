import React, { Component } from 'react';
import { connect } from "react-redux";


import '../assets/css/App.css';
import Channels from './Channels';

//Utils:
import { loadSnapshotState, saveSnapshotState } from '../utils/SettingsStorage';
import * as DEFAULTS from '../utils/DEFAULTS';
import { OscServer } from '../utils/OscServer';


class App extends Component {
    componentWillMount() {
        this.oscServer = new OscServer();
        this.snapShopStoreTimer();
        loadSnapshotState(this.props.store.channels[0]);
    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                saveSnapshotState(this.props.store.channels[0])
            },
            2000);
    }

    render() {
        return (
        <div>
            <Channels oscServer = {this.oscServer} />
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
