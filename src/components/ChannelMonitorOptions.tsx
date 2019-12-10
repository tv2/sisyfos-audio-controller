import React, { ChangeEvent } from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';

import '../assets/css/ChannelMonitorOptions.css';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { SET_AUX_LEVEL } from '../reducers/channelActions'
import { TOGGLE_SHOW_MONITOR_OPTIONS } from '../reducers/settingsActions'
import { SET_FADER_MONITOR } from '../reducers/faderActions';
import { ISettings } from '../reducers/settingsReducer';

interface IMonitorSettingsInjectProps {
    label: string,
    selectedProtocol: string,
    numberOfChannelsInType: Array<number>,
    channel: Array<any>
    fader: Array<any>
    settings: ISettings
}

interface IChannelProps {
    faderIndex: number
}

class ChannelMonitorOptions extends React.PureComponent<IChannelProps & IMonitorSettingsInjectProps & Store> {
    faderIndex: number;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
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
            let response = window.dialog.showMessageBoxSync(options)
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
            let response = window.dialog.showMessageBoxSync(options)

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
            detail: 'This will remove all monitor assignments to Aux :' + String(this.props.fader[this.faderIndex].monitor),
        };
        let response = window.dialog.showMessageBoxSync(options)
        if (response === 0) {
            this.props.channel.forEach((channel: any, index: number) => {
                this.props.dispatch({
                    type: SET_AUX_LEVEL,
                    channel: index,
                    auxIndex: this.props.fader[this.faderIndex].monitor - 1,
                    level: -1
                });
            })
        }
        return true
    }

    handleMixMinusRouting() {
        const options = {
            type: 'question',
            buttons: ['Yes', 'Cancel'],
            defaultId: 1,
            title: 'WARNING',
            message: 'Send all channels to Aux: ' + String(this.props.fader[this.faderIndex].monitor)
        };
        let response = window.dialog.showMessageBoxSync(options)
        if (response === 0) {
            this.props.channel.forEach((channel: any, index: number) => {
                this.props.dispatch({
                    type: SET_AUX_LEVEL,
                    channel: index,
                    auxIndex: this.props.fader[this.faderIndex].monitor - 1,
                    level: 0
                });
            })
        }
        return true
    }

    handleSetAux = (event: ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(event.target.value) || -1
        if (value > this.props.settings.numberOfAux || value < 0) {
            value = -1
        }
        this.props.dispatch({
            type: SET_FADER_MONITOR,
            channel: this.faderIndex,
            auxIndex: value
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
                <button 
                    className="button"
                    onClick={() => this.handleMixMinusRouting()}
                >ASSIGN ALL</button>
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
        settings: state.settings[0]
    }
}

export default connect<any, IMonitorSettingsInjectProps>(mapStateToProps)(ChannelMonitorOptions) as any;
