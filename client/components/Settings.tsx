import * as React from 'react';
import { connect } from "react-redux";
import Select from 'react-select';
import WebMidi from 'webmidi';
import { IAppProps } from './App';

//Utils:
import '../assets/css/Settings.css';
import { ISettings } from '../../server/reducers/settingsReducer';
import { SHOW_CHANNEL } from '../../server/reducers/faderActions'
import { Store } from 'redux';
import { ChangeEvent } from 'react';
import { SOCKET_SAVE_SETTINGS } from '../../server/constants/SOCKET_IO_DISPATCHERS';
import { TOGGLE_SHOW_SETTINGS } from '../../server/reducers/settingsActions';

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

interface IState {
    settings: ISettings
}


class Settings extends React.PureComponent<IAppProps & Store, IState> {
    selectedProtocol: any;
    midiInputPortList: any;
    midiOutputPortList: any;


    constructor(props: any) {
        super(props);

        this.state = {
            settings: this.props.store.settings[0],
        };
        //Initialise list of Midi ports:
        this.findMidiPorts();
    }

    findMidiPorts = () => {
        WebMidi.enable((err) => {

            if (err) {
                console.log("WebMidi could not be enabled.", err);
            }

            // Viewing available inputs and outputs
            console.log("Midi inputs : ", WebMidi.inputs);
            console.log("Midi outputs : ", WebMidi.outputs);
        });
        this.midiInputPortList = WebMidi.inputs.map((input) => {
            return {"label": input.name, "value": input.name}
        });
        this.midiOutputPortList = WebMidi.outputs.map((output) => {
            return {"label": output.name, "value": output.name}
        });

    }

    handleRemoteMidiInputPort = (selectedOption: any) => {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.remoteFaderMidiInputPort = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleRemoteMidiOutputPort = (selectedOption: any) => {
        var settingsCopy = Object.assign({}, this.state.settings);
        settingsCopy.remoteFaderMidiOutputPort = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleMixerMidiInputPort = (selectedOption: any) => {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.mixerMidiInputPort = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleMixerMidiOutputPort = (selectedOption: any) => {
        var settingsCopy = Object.assign({}, this.state.settings);
        settingsCopy.mixerMidiOutputPort = selectedOption.value;
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        var settingsCopy = Object.assign({}, this.state.settings);
        if (event.target.type === "checkbox") {
            (settingsCopy as any)[event.target.name] = !!event.target.checked;
        } else {
            (settingsCopy as any)[event.target.name] = event.target.value;
        }
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleProtocolChange = (selectedOption: any) => {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.mixerProtocol = selectedOption.value;
        window.mixerProtocol = window.mixerProtocolPresets[settingsCopy.mixerProtocol]
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleNumberOfChannels = (index: number, event: any) => {
        let settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.numberOfChannelsInType[index] = parseInt(event.target.value);
        this.setState(
            {settings: settingsCopy}
        );
    }

    handleShowChannel = (index: number, event: any) => {
        this.props.dispatch({
            type: SHOW_CHANNEL,
            channel: index,
            showChannel: event.target.checked
        });
    }

    handleShowAllChannels = () => {
        this.props.store.channels[0].channel.map((channel: any, index: number) => {
            this.props.dispatch({
                type: SHOW_CHANNEL,
                channel: index,
                showChannel: true
            });
        });
    }


    handleHideAllChannels = () => {
        this.props.store.channels[0].channel.map((channel: any, index: number) => {
            this.props.dispatch({
                type: SHOW_CHANNEL,
                channel: index,
                showChannel: false
            });
        });
    }

    handleSave = () => {
        let settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy.showSettings = false;
        window.socketIoClient.emit( SOCKET_SAVE_SETTINGS, settingsCopy)
        location.reload();
    }

    handleCancel = () => {
        this.props.dispatch({
            type: TOGGLE_SHOW_SETTINGS,
        });
    }

    renderChannelTypeSettings = () => {
        return (
            <div className="settings-show-channel-selection">
                <div className="settings-header">
                    NUMBER OF CHANNELTYPES:
                </div>
                {window.mixerProtocol.channelTypes.map((item: any, index: number) => {
                    return <React.Fragment>
                        <label className="settings-input-field">
                            Number of { item.channelTypeName } :
                            <input name="numberOfChannelsInType" type="text" value={this.state.settings.numberOfChannelsInType[index]} onChange={(event) => this.handleNumberOfChannels(index, event)} />
                        </label>
                        <br/>
                    </React.Fragment>
                })}
            </div>
        )
    }

    renderMixerMidiSettings = () => {
        return (
            <div>
                <div className="settings-header">
                    MIXER MIDI SETTINGS:
                </div>
                <div className="settings-input-field">
                    Mixer Midi Input Port :
                </div>
                <Select
                    styles={selectorColorStyles}
                    value={{label: this.state.settings.mixerMidiInputPort, value: this.state.settings.mixerMidiInputPort}}
                    onChange={this.handleMixerMidiInputPort}
                    options={this.midiInputPortList}
                />
                <br/>
                <div className="settings-input-field">
                    Mixer Midi Output Port :
                </div>
                <Select
                    styles={selectorColorStyles}
                    value={{label: this.state.settings.mixerMidiOutputPort, value: this.state.settings.mixerMidiOutputPort}}
                    onChange={this.handleMixerMidiOutputPort}
                    options={this.midiOutputPortList}
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
                    value={{label: window.mixerProtocolPresets[this.state.settings.mixerProtocol].label, value: this.state.settings.mixerProtocol}}
                    onChange={this.handleProtocolChange}
                    options={window.mixerProtocolList}
                />
                <br/>
                <label className="settings-input-field">
                    LOCAL MIXER IP:
                    <input name="localIp" type="text" value={this.state.settings.localIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    LOCAL MIXER PORT :
                    <input name="localOscPort" type="text" value={this.state.settings.localOscPort} onChange={this.handleChange} />
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
                <label className="settings-input-field">
                    FADE TIME :
                    <input name="fadeTime" type="text" value={this.state.settings.fadeTime} onChange={this.handleChange} />
                     ms
                </label>
                <br/>
                <label className="settings-input-field">
                    VOICE OVER FADE TIME :
                    <input name="voFadeTime" type="text" value={this.state.settings.voFadeTime} onChange={this.handleChange} />
                    ms
                </label>
                <br/>
                <label className="settings-input-field">
                    VOICE OVER DIM :
                    <input name="voLevel" type="text" value={this.state.settings.voLevel} onChange={this.handleChange} />
                    %
                </label>
                <br/>
                <label className="settings-input-field">
                    AUTORESET LEVEL :
                    <input name="autoResetLevel" type="text" value={this.state.settings.autoResetLevel} onChange={this.handleChange} />
                    %
                </label>
                <br/>
                <label className="settings-input-field">
                    PROTOCOL LATENCY :
                    <input name="protocolLatency" type="text" value={this.state.settings.protocolLatency} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    NUMBER OF FADERS :
                    <input name="numberOfFaders" type="text" value={this.state.settings.numberOfFaders} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    NUMBER OF AUX :
                    <input name="numberOfAux" type="text" value={this.state.settings.numberOfAux} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    NEXT SEND AUX NR.:
                    <input name="nextSendAux" type="text" value={this.state.settings.nextSendAux} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    AUTOMATION MODE:
                    <input
                        type="checkbox"
                        name="automationMode"
                        checked={this.state.settings.automationMode}
                        onChange={this.handleChange}
                    />
                </label>
                <br/>
                <label className="settings-input-field">
                    OFFTUBE MODE:
                    <input
                        type="checkbox"
                        name="offtubeMode"
                        checked={this.state.settings.offtubeMode}
                        onChange={this.handleChange}
                    />
                </label>
                <br/>
                <label className="settings-input-field">
                    SHOW PFL CONTROLS:
                    <input
                        type="checkbox"
                        name="showPfl"
                        checked={this.state.settings.showPfl}
                        onChange={this.handleChange}
                    />
                </label>
                <br/>
                {window.mixerProtocol.protocol === "MIDI" ? this.renderMixerMidiSettings() : ""}
                <br/>
                {this.renderChannelTypeSettings()}
                <br/>
                <button
                    className="settings-cancel-button"
                    onClick=
                        {() => {
                            this.handleCancel();
                        }}
                >
                    CANCEL
                </button>
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

const mapStateToProps = (state: any): IAppProps => {
    return {
        store: state
    }
}

export default connect<any, any>(mapStateToProps)(Settings) as any;
