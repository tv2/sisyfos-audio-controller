import React from 'react';

import '../assets/css/ChannelRouteSettings.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';
import CcgChannelSettings from './CcgChannelSettings';
import { SET_ASSIGNED_FADER } from '../reducers/channelActions'
import { TOGGLE_SHOW_OPTION } from '../reducers/settingsActions'
const { dialog } = require('electron').remote;

interface IChannelSettingsInjectProps {
    label: string,
    selectedProtocol: string,
    numberOfChannelsInType: Array<number>,
    channel: Array<any>
    fader: Array<any>
}

interface IChannelProps {
    faderIndex: number
}

class ChannelRouteSettings extends React.PureComponent<IChannelProps & IChannelSettingsInjectProps & Store> {
    faderIndex: number;
    mixerProtocol: IMixerProtocolGeneric;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
        this.mixerProtocol = MixerProtocolPresets[this.props.selectedProtocol];
    }

    handleAssignChannel(channel: number, event: any) {
        let faderAssign = this.faderIndex
        let assignedFader = this.props.channel[channel].assignedFader
        let assignedFaderLabel = (assignedFader >= 0)
            ? this.props.fader[assignedFader].label
            : 'undefined'
        assignedFaderLabel = (assignedFaderLabel === '')
            ? String(assignedFader + 1)
            : assignedFaderLabel

        if (event.target.checked === false) {
            const options = {
                type: 'question',
                buttons: ['Yes', 'Cancel'],
                defaultId: 1,
                title: 'Unlock Channel',
                message: 'Unbind Channel ' + String(channel + 1) + ' from Fader ' + String(this.faderIndex + 1),
            };
            let response = dialog.showMessageBoxSync(options)
            if (response === 1) {
                return true
            }

            faderAssign = -1
        } else {
            let detail = (assignedFader < 0) ? 'NOT CURRENTLY ASSIGNED'
                : 'CHANNEL ' + String(channel + 1) + ' IS CURRENTLY CONNECTED TO FADER ' + String(assignedFaderLabel)

            const options = {
                type: 'question',
                buttons: ['Yes', 'Cancel'],
                defaultId: 1,
                title: 'Unlock Channel',
                message: 'Bind Channel ' + String(channel + 1) + ' to Fader ' + String(this.faderIndex + 1) + '?',
                detail: detail,
            };
            let response = dialog.showMessageBoxSync(options)

            if (response === 1) {
                return true
            }
        }
        this.props.dispatch({
            type: SET_ASSIGNED_FADER,
            channel: channel,
            faderNumber: faderAssign
        });
        return true;
    }

    handleClearRouting() {
        const options = {
            type: 'question',
            buttons: ['Yes', 'Cancel'],
            defaultId: 1,
            title: 'WARNING',
            message: 'WARNING!!!!!',
            detail: 'This will remove all Fader-Channel assignments',
        };
        let response = dialog.showMessageBoxSync(options)
        if (response === 0) {
            this.props.channel.forEach((channel: any, index: number) => {
                this.props.dispatch({
                    type: SET_ASSIGNED_FADER,
                    channel: index,
                    faderNumber: -1
                });
            })
        }
        return true
    }

    handle11Routing() {
        const options = {
            type: 'question',
            buttons: ['Yes', 'Cancel'],
            defaultId: 1,
            title: 'WARNING',
            message: 'WARNING!!!!!',
            detail: 'This will reassign all Faders 1:1 to Channels',
        };
        let response = dialog.showMessageBoxSync(options)
        if (response === 0) {
            this.props.fader.forEach((fader: any, index: number) => {
                if (this.props.channel.length > index) {
                    this.props.dispatch({
                        type: SET_ASSIGNED_FADER,
                        channel: index,
                        faderNumber: index
                    });
                }
            })
        }
        return true
    }

    handleClose = () => {
        this.props.dispatch({
            type: TOGGLE_SHOW_OPTION,
            channel: this.faderIndex
        });
    }

    render() {
        if (this.props.selectedProtocol.includes("caspar")) {
            return (
                <CcgChannelSettings channelIndex={this.props.faderIndex} />
            )
        }
        else {
            return (
                <div className="channel-route-body">
                    <h2>{this.props.label || ("FADER " + (this.faderIndex + 1))}</h2>
                    <button 
                        className="close"
                        onClick={() => this.handleClose()}
                    >X</button>
                    <button 
                        className="button"
                        onClick={() => this.handleClearRouting()}
                    >CLEAR ALL</button>
                    <button 
                        className="button"
                        onClick={() => this.handle11Routing()}
                    >ROUTE 1:1</button>
                    <hr />
                    {this.props.channel.map((channel: any, index: number) => {
                        return <h4 key={index}>
                            {(" Channel " + (index + 1) + " : ")}
                            <input
                                type="checkbox"
                                checked={this.props.channel[index].assignedFader === this.faderIndex}
                                onChange={(event) => this.handleAssignChannel(index, event)}
                            />
                            {this.props.channel[index].assignedFader >= 0
                                ? ("   (Fader " + (this.props.channel[index].assignedFader + 1) + ")")
                                : ' (not assigned)'}
                        </h4>
                    })
                    }
                </div>
            )
        }
    }
}

const mapStateToProps = (state: any, props: any): IChannelSettingsInjectProps => {
    return {
        label: state.faders[0].fader[props.faderIndex].label,
        selectedProtocol: state.settings[0].mixerProtocol,
        numberOfChannelsInType: state.settings[0].numberOfChannelsInType,
        channel: state.channels[0].channel,
        fader: state.faders[0].fader,
    }
}

export default connect<any, IChannelSettingsInjectProps>(mapStateToProps)(ChannelRouteSettings) as any;
