import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import Select from 'react-select';
import WebMidi, { INoteParam, IMidiChannel } from 'webmidi';


//Utils:
import { saveSettings } from '../utils/SettingsStorage';
import '../assets/css/Settings.css';
import { MixerProtocolPresets, MixerProtocolList } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';


//Set style for Select dropdown component:
const selectorColorStyles = {
    control:
        (styles: any) => ({
            ...styles, backgroundColor: '#676767', color: 'white', border: 0, width: 500, marginLeft: 100
        }
    ),
    option: (styles: any) => {
        return {
            backgroundColor: '#AAAAAA',
            color: 'white'
        };
    },
    singleValue: (styles: any) => ({ ...styles, color: 'white' }),
};


class Channels extends PureComponent<any, any> {
    mixerProtocolList: any;
    mixerProtocolPresets: any;
    remoteFaderMidiInputPortList: any;
    remoteFaderMidiOutputPortList: any;


    constructor(props: any) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleTemplateChange = this.handleTemplateChange.bind(this);
        this.handleMidiInputPort = this.handleMidiInputPort.bind(this);
        this.handleMidiOutputPort = this.handleMidiOutputPort.bind(this);
        this.handleShowChannel = this.handleShowChannel.bind(this);
        this.handleShowAllChannels = this.handleShowAllChannels.bind(this);
        this.handleHideAllChannels = this.handleHideAllChannels.bind(this);
        this.renderRemoteControllerSettings = this.renderRemoteControllerSettings.bind(this);
        this.findMidiPorts = this.findMidiPorts.bind(this);

        this.mixerProtocolList = MixerProtocolList;
        this.mixerProtocolPresets = MixerProtocolPresets;
        this.state = {
            settings: this.props.store.settings[0]
        };
        //Initialise list of Midi ports:
        this.findMidiPorts();
    }

    findMidiPorts() {
        WebMidi.enable((err) => {

            if (err) {
                console.log("WebMidi could not be enabled.", err);
            }

            // Viewing available inputs and outputs
            console.log("Midi inputs : ", WebMidi.inputs);
            console.log("Midi outputs : ", WebMidi.outputs);
        });
        this.remoteFaderMidiInputPortList = WebMidi.inputs.map((input) => {
            return {"label": input.name, "value": input.name}
        });
        this.remoteFaderMidiOutputPortList = WebMidi.outputs.map((output) => {
            return {"label": output.name, "value": output.name}
        });

    }

    handleMidiInputPort(selectedOption: any) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.remoteFaderMidiInputPort = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleMidiOutputPort(selectedOption: any) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.remoteFaderMidiOutputPort = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleChange(event: any) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy[event.target.name] = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleTemplateChange(selectedOption: any) {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.mixerProtocol = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleShowChannel(index: number, event: any) {
        this.props.dispatch({
            type:'SHOW_CHANNEL',
            channel: index,
            showChannel: event.target.checked
        });
    }

    handleShowAllChannels() {
        this.props.store.channels[0].channel.map((channel: any, index: number) => {
            this.props.dispatch({
                type:'SHOW_CHANNEL',
                channel: index,
                showChannel: true
            });
        });
    }


    handleHideAllChannels() {
        this.props.store.channels[0].channel.map((channel: any, index: number) => {
            this.props.dispatch({
                type:'SHOW_CHANNEL',
                channel: index,
                showChannel: false
            });
        });
    }


    handleShowGrpFader(index: number, event: any) {
        this.props.dispatch({
            type:'SHOW_GRP_FADER',
            channel: index,
            showChannel: event.target.checked
        });
    }

    handleShowAllGrpFaders() {
        this.props.store.channels[0].grpFader.map((channel: any, index: number) => {
            this.props.dispatch({
                type:'SHOW_GRP_FADER',
                channel: index,
                showChannel: true
            });
        });
    }


    handleHideAllGrpFaders() {
        this.props.store.channels[0].grpFader.map((channel: any, index: number) => {
            this.props.dispatch({
                type:'SHOW_GRP_FADER',
                channel: index,
                showChannel: false
            });
        });
    }

    handleSave() {
        let settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.showSettings = false;

        saveSettings(settingsCopy);
        location.reload();
    }

    renderShowChannelsSelection() {
        return (
            <div className="settings-show-channel-selection">
                <input className="settings-channels-button"
                    onClick=
                        {() => {
                            this.handleShowAllChannels();
                        }}
                    value="ALL CHANNELS"
                />
                <input className="settings-channels-button"
                    onClick=
                        {() => {
                            this.handleHideAllChannels();
                        }}
                    value="NO CHANNELS"
                />
                {this.props.store.channels[0].channel.map((channel: any, index: number) => {
                        return <div key={index}>
                            {channel.label != "" ? channel.label : ("CH " + (index + 1)) }
                            <input
                                type="checkbox"
                                checked={this.props.store.channels[0].channel[index].showChannel }
                                onChange={(event) => this.handleShowChannel(index, event)}
                            />
                        </div>
                    })
                }
            </div>
        )
    }


    renderShowGrpFadersSelection() {
        return (
            <div className="settings-show-channel-selection">
                <input className="settings-channels-button"
                    onClick=
                        {() => {
                            this.handleShowAllGrpFaders();
                        }}
                    value="ALL GROUPS"
                />
                <input className="settings-channels-button"
                    onClick=
                        {() => {
                            this.handleHideAllGrpFaders();
                        }}
                    value="NO GROUPS"
                />
                {this.props.store.channels[0].grpFader.map((channel: any, index: number) => {
                        return <div key={index}>
                            {channel.label != "" ? channel.label : ("GRP " + (index + 1)) }
                            <input
                                type="checkbox"
                                checked={this.props.store.channels[0].grpFader[index].showChannel }
                                onChange={(event) => this.handleShowGrpFader(index, event)}
                            />
                        </div>
                    })
                }
            </div>
        )
    }

    renderRemoteControllerSettings() {
        return (
            <div>
                <div className="settings-header">
                    REMOTE CONTROLLER SETTINGS:
                </div>
                <div className="settings-input-field">
                    Remote Midi Input Port :
                </div>
                <Select
                    styles={selectorColorStyles}
                    value={{label: this.state.settings.remoteFaderMidiInputPort, value: this.state.settings.remoteFaderMidiInputPort}}
                    onChange={this.handleMidiInputPort}
                    options={this.remoteFaderMidiInputPortList}
                />
                <br/>
                <div className="settings-input-field">
                    Remote Midi Output Port :
                </div>
                <Select
                    styles={selectorColorStyles}
                    value={{label: this.state.settings.remoteFaderMidiOutputPort, value: this.state.settings.remoteFaderMidiOutputPort}}
                    onChange={this.handleMidiOutputPort}
                    options={this.remoteFaderMidiOutputPortList}
                />
                <br/>
            </div>
        )
    }

    render() {
        return (
            <div className="settings-body">
                <div className="settings-header">
                    MIXER SETTINGS:
                </div>

                <Select
                    styles={selectorColorStyles}
                    value={{label: this.mixerProtocolPresets[this.state.settings.mixerProtocol].label, value: this.state.settings.mixerProtocol}}
                    onChange={this.handleTemplateChange}
                    options={this.mixerProtocolList}
                />
                <br/>
                <label className="settings-input-field">
                    LOCAL IP :
                    <input name="localIp" type="text" value={this.state.settings.localIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    LOCAL PORT :
                    <input name="localOscPort" type="text" value={this.state.settings.localOscPort} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    NUMBER OF CHANNELS :
                    <input name="numberOfChannels" type="text" value={this.state.settings.numberOfChannels} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    FADE TIME IN ms :
                    <input name="fadeTime" type="text" value={this.state.settings.fadeTime} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER IP :
                    <input name="deviceIp" type="text" value={this.state.settings.deviceIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER PORT :
                    <input name="devicePort" type="text" value={this.state.settings.devicePort} onChange={this.handleChange} />
                </label>
                <br/>
                {this.renderShowChannelsSelection()}
                <br/>
                {this.renderShowGrpFadersSelection()}
                <br/>
                {this.renderRemoteControllerSettings()}
                <br/>
                <button
                    className="settings-save-button"
                    onClick=
                        {() => {
                            this.handleSave();
                        }}
                >
                    SAVE SETTINGS
                </button>
            </div>
        )
    }
}

const mapStateToProps = (state: any) => {
    return {
        store: state
    }
}

export default connect<any, any>(mapStateToProps)(Channels) as any;
