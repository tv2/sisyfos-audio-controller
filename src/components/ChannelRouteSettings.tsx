import React from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';

import '../assets/css/ChannelRouteSettings.css';
import { Store } from 'redux';
import { connect } from 'react-redux';
import CcgChannelSettings from './CcgChannelSettings';
import { SET_ASSIGNED_FADER } from '../../server/reducers/channelActions'
import { TOGGLE_SHOW_OPTION } from '../../server/reducers/settingsActions'
import { SOCKET_SET_ASSIGNED_FADER } from '../../server/constants/SOCKET_IO_DISPATCHERS';

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

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
    }

    handleAssignChannel(channel: number, event: any) {

        if (event.target.checked === false) {
            console.log('Unbinding Channel')
            if (window.confirm('Unbind Channel ' + String(channel + 1) + ' from Fader ' + String(this.faderIndex + 1))) {
                window.socketIoClient.emit( 
                    SOCKET_SET_ASSIGNED_FADER, 
                    {
                        channel: channel, 
                        faderAssign: -1
                    }
                )
            }
        } else {
            console.log('Binding Channel')
            if (window.confirm('Bind Channel ' + String(channel + 1) + ' to Fader ' + String(this.faderIndex + 1) + '?')) {
                window.socketIoClient.emit( 
                    SOCKET_SET_ASSIGNED_FADER, 
                    {
                        channel: channel, 
                        faderAssign: this.faderIndex
                    }
                )
            }
        }
    }

    handleClearRouting() {
        if (window.confirm('REMOVE ALL FADER ASSIGNMENTS????')) {
            this.props.channel.forEach((channel: any, index: number) => {
                window.socketIoClient.emit( 
                    SOCKET_SET_ASSIGNED_FADER, 
                    {
                        channel: index, 
                        faderAssign: -1
                    }
                )
            })
        }
    }

    handle11Routing() {
        if (window.confirm('Reassign all Faders 1:1 to Channels????')) {
            this.props.fader.forEach((fader: any, index: number) => {
                if (this.props.channel.length > index) {                
                    window.socketIoClient.emit( 
                        SOCKET_SET_ASSIGNED_FADER, 
                        {
                            channel: index, 
                            faderAssign: index
                        }
                    )
                }
            })
        }
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
                        return <div 
                            key={index}
                            className={ClassNames("channel-route-text", {
                                'checked': this.props.channel[index].assignedFader === this.faderIndex
                            })}
                            >
                            {(" Channel " + (index + 1) + " : ")}
                            <input
                                type="checkbox"
                                checked={this.props.channel[index].assignedFader === this.faderIndex}
                                onChange={(event) => this.handleAssignChannel(index, event)}
                            />
                            {this.props.channel[index].assignedFader >= 0
                                ? ("   (Fader " + (this.props.channel[index].assignedFader + 1) + ")")
                                : ' (not assigned)'}
                        </div>
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
