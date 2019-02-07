import React, { PureComponent } from 'react';
import { connect } from "react-redux";

import '../assets/css/Settings.css';

class Channels extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }



    render() {
        return (
            <div className="settings-body">
                <div className="settings-header">
                    SETTINGS:
                </div>
                <label className="settings-input-field">
                    LOCAL OSC PORT :
                    <input name="port" type="text" value={this.props.store.settings[0].oscPort} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER OSC IP :
                    <input name="mixerIp" type="text" value={this.props.store.settings[0].machineOscIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER OSC PORT :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].machineOscPort} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER CHANNELS :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].numberOfChannels} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER SNAPS :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].numberOfSnaps} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    FADER OSC MIN :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].fader.min} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    FADER OSC MAX :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].fader.max} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    FADER OSC ZERO :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].fader.zero} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    FADER OSC STEP :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].fader.step} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    METER OSC MIN :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].meter.min} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    METER OSC MAX :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].meter.max} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    METER OSC ZERO :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].meter.zero} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    METER OSC TEST :
                    <input name="mixerPort" type="text" value={this.props.store.settings[0].meter.test} onChange={this.handleChange} />
                </label>
                <br/>
                <input className="settings-save-button" type="submit" value="SAVE SETTINGS" />
            </div>
        )
    }
}

/*
        numberOfChannels: 8,
        numberOfSnaps: 8,
        fader: {
            min: 0,
            max: 1,
            zero: 0.75,
            step: 0.01,
        },
        meter: {
            min: 0,
            max: 1,
            zero: 0.75,
            test: 0.6,
        },
*/

const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(Channels);
