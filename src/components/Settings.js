import React, { PureComponent } from 'react';
import { connect } from "react-redux";

//Utils:
import { saveSettings } from '../utils/SettingsStorage';
import '../assets/css/Settings.css';

class Channels extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            settings: this.props.store.settings[0]
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy[event.target.name] = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleSave() {
        let settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.showSettings = false;

        saveSettings(settingsCopy);
        location.reload();
    }

    render() {
        return (
            <div className="settings-body">
                <div className="settings-header">
                    SETTINGS:
                </div>
                <label className="settings-input-field">
                    OSC PRESET :
                    <input name="oscPreset" type="text" value={this.state.settings.oscPreset} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    LOCAL OSC IP :
                    <input name="localOscIp" type="text" value={this.state.settings.localOscIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    LOCAL OSC PORT :
                    <input name="localOscPort" type="text" value={this.state.settings.localOscPort} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER OSC IP :
                    <input name="machineOscIp" type="text" value={this.state.settings.machineOscIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER OSC PORT :
                    <input name="machineOscPort" type="text" value={this.state.settings.machineOscPort} onChange={this.handleChange} />
                </label>
                <br/>
                <input
                className="settings-save-button"
                onClick=
                    {() => {
                        this.handleSave();
                    }}
                value="SAVE SETTINGS" />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(Channels);
