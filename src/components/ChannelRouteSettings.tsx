import React from 'react';

import '../assets/css/ChannelRouteSettings.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { IStore } from '../reducers/indexReducer';
import CcgChannelSettings from './CcgChannelSettings';

interface IChannelSettingsInjectProps {
	label: string,
    selectedProtocol: string,
    numberOfChannelsInType: Array<number>,
    channel: Array<any>
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

    handleAssignChannel(index: number) {
		this.props.dispatch({
			type: 'SET_ASSIGNED_FADER',
            channel: index,
            faderNumber: this.faderIndex
		});

        return true;
    }

	handleClose = () => {
		this.props.dispatch({
			type: 'TOGGLE_SHOW_OPTION',
			channel: this.faderIndex
		});
	}

    render() {
        if (this.props.selectedProtocol.includes("caspar")) {
            return (
                <CcgChannelSettings channelIndex= {this.props.faderIndex}/>
                )
            }
        else {
            return (
                <div className="channel-settings-body">
                    <h2>{this.props.label || ("FADER " + (this.faderIndex + 1))}</h2>
                    <button className="close" onClick={() => this.handleClose()}>X</button>


                    {this.props.channel.map((channel: any, index: number) => {
                        return <div key={index}>
                            {(" Channel " + (index + 1) + " : " )}
                            <input
                                type="checkbox"
                                checked={ this.props.channel[index].assignedFader === this.faderIndex }
                                onChange={(event) => this.handleAssignChannel(index, event)}
                            />
                            {( "   (Fader " + (this.props.channel[index].assignedFader + 1) + ")")}
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
        label: state.channels[0].channel[props.faderIndex].label,
        selectedProtocol: state.settings[0].mixerProtocol,
        numberOfChannelsInType: state.settings[0].numberOfChannelsInType,
        channel: state.channels[0].channel,
    }
}

export default connect<any, IChannelSettingsInjectProps>(mapStateToProps)(ChannelRouteSettings) as any;
