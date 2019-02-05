import React, { Component } from 'react';
import { connect } from "react-redux";

import '../assets/css/App.css';
import Channels from './Channels';
import * as DEFAULTS from '../utils/DEFAULTS';
import { OscServer } from '../utils/OscServer';

class App extends Component {
    componentWillMount() {

        this.oscServer = new OscServer();
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
