import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import Select from 'react-select';

//Utils:
import { saveSettings } from '../utils/SettingsStorage';
import '../assets/css/Settings.css';
import { MixerProtocolPresets, MixerProtocolList } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';


class Channels extends PureComponent<any, any> {
    templateOptions: any;
    mixerProtocolPresets: any;

    constructor(props: any) {
        super(props);
        this.templateOptions = MixerProtocolList;
        this.mixerProtocolPresets = MixerProtocolPresets;
        this.state = {
            settings: this.props.store.settings[0]
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleTemplateChange = this.handleTemplateChange.bind(this);
        this.handleShowChannel = this.handleShowChannel.bind(this);
        this.handleShowAllChannels = this.handleShowAllChannels.bind(this);
        this.handleHideAllChannels = this.handleHideAllChannels.bind(this);
    }

    handleChange() {
        var settingsCopy= Object.assign({}, this.state.settings);
        settingsCopy[event.target.name] = event.target.value;
        this.setState(
            {settings: settingsCopy}
        );
    }


    handleTemplateChange(selectedOption ) {
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

    render() {
        return (
            <div className="settings-body">
                <div className="settings-header">
                    SETTINGS:
                </div>

                <Select
                    value={{label: this.mixerProtocolPresets[this.state.settings.mixerProtocol].label, value: this.state.settings.mixerProtocol}}
                    onChange={this.handleTemplateChange}
                    options={this.templateOptions}
                />
                <br/>
                <label className="settings-input-field">
                    LOCAL IP :
                    <input name="localOscIp" type="text" value={this.state.settings.localOscIp} onChange={this.handleChange} />
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
                    <input name="machineOscIp" type="text" value={this.state.settings.machineOscIp} onChange={this.handleChange} />
                </label>
                <br/>
                <label className="settings-input-field">
                    MIXER PORT :
                    <input name="machineOscPort" type="text" value={this.state.settings.machineOscPort} onChange={this.handleChange} />
                </label>
                <br/>
                {this.renderShowChannelsSelection()}
                <br/>
                {this.renderShowGrpFadersSelection()}
                <br/>
                <input
                    className="settings-save-button"
                    onClick=
                        {() => {
                            this.handleSave();
                        }}
                    value="SAVE SETTINGS"
                />
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
