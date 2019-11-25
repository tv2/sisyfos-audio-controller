import React, { ChangeEvent } from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';

import '../assets/css/ChannelMonitorOptions.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { SET_ASSIGNED_FADER, SET_AUX_LEVEL } from '../reducers/channelActions'
import { TOGGLE_SHOW_MONITOR_OPTIONS } from '../reducers/settingsActions'
import { SET_FADER_MONITOR } from '../reducers/faderActions';
const { dialog } = require('electron').remote;

interface IMonitorSettingsInjectProps {
    label: string,
    selectedProtocol: string,
    numberOfChannelsInType: Array<number>,
    channel: Array<any>
    fader: Array<any>
}

interface IChannelProps {
    faderIndex: number
}

class ChannelMonitorOptions extends React.PureComponent<IChannelProps & IMonitorSettingsInjectProps & Store> {
    faderIndex: number;
    mixerProtocol: IMixerProtocolGeneric;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
        this.mixerProtocol = MixerProtocolPresets[this.props.selectedProtocol];
    }

    handleAssignChannel(channel: number, event: any) {
        let monitorAssign = 0;
        if (event.target.checked === false) {
            const options = {
                type: 'question',
                buttons: ['Yes', 'Cancel'],
                defaultId: 1,
                title: 'Remove monitoring',
                message: 'Remove monitoring on ' + String(channel + 1),
            };
            let response = dialog.showMessageBoxSync(options)
            if (response === 1) {
                return true
            }
            monitorAssign = -1
        } else {
            monitorAssign = 0
            const options = {
                type: 'question',
                buttons: ['Yes', 'Cancel'],
                defaultId: 1,
                title: 'Monitor Channel',
                message: 'Enable monitoring of Channel ' + String(channel + 1) + '?',
            };
            let response = dialog.showMessageBoxSync(options)

            if (response === 1) {
                return true
            }
        }
        this.props.dispatch({
            type: SET_AUX_LEVEL,
            channel: channel,
            auxIndex: this.props.fader[this.faderIndex].monitor - 1,
            level: monitorAssign
        });
        return true;
    }

    handleClearMonitorRouting() {
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

    handleSetAux = (event: ChangeEvent<HTMLInputElement>) => {
        this.props.dispatch({
            type: SET_FADER_MONITOR,
            channel: this.faderIndex,
            auxIndex: parseFloat(event.target.value)
        });
    }


    handleClose = () => {
        this.props.dispatch({
            type: TOGGLE_SHOW_MONITOR_OPTIONS,
            channel: this.faderIndex
        });
    }

    render() {
        return (
            <div className="channel-monitor-body">
                <h2>MONITOR ROUTE</h2>
                <h2>{this.props.label || ("FADER " + (this.faderIndex + 1))}</h2>
                <button 
                    className="close"
                    onClick={() => this.handleClose()}
                >X</button>
                <button 
                    className="button"
                    onClick={() => this.handleClearMonitorRouting()}
                >CLEAR ALL</button>
                <hr/>
                <label className="input">
                    MONITOR AUX SEND :
                </label>
                <input className="input-field"
                    value={this.props.fader[this.faderIndex].monitor} 
                    onChange={(event) => this.handleSetAux(event)}
                />
                <hr />
                {this.props.channel.map((channel: any, index: number) => {
                    return <div 
                        key={index}
                        className={ClassNames("channel-monitor-text", {
                            'checked': this.props.channel[index].auxLevel[this.props.fader[this.faderIndex].monitor - 1] >= 0 || false
                        })}
                        >
                        {(" Channel " + (index + 1) + " : ")}
                        <input
                            type="checkbox"
                            checked={this.props.channel[index].auxLevel[this.props.fader[this.faderIndex].monitor - 1] >= 0}
                            onChange={(event) => this.handleAssignChannel(index, event)}
                        />
                        {this.props.channel[index].auxLevel[this.props.fader[this.faderIndex].monitor - 1] >= 0
                            ? ("Monitor this")
                            : null
                        }
                    </div>
                })
                }
            </div>
        )
    }

}

const mapStateToProps = (state: any, props: any): IMonitorSettingsInjectProps => {
    return {
        label: state.faders[0].fader[props.faderIndex].label,
        selectedProtocol: state.settings[0].mixerProtocol,
        numberOfChannelsInType: state.settings[0].numberOfChannelsInType,
        channel: state.channels[0].channel,
        fader: state.faders[0].fader,
    }
}

export default connect<any, IMonitorSettingsInjectProps>(mapStateToProps)(ChannelMonitorOptions) as any;
