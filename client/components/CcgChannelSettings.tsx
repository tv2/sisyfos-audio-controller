import React from 'react';

import '../assets/css/CcgChannelSettings.css';
import { ICasparCGMixerGeometry } from '../../server/constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { SET_OPTION } from  '../../server/reducers/channelActions'
import { TOGGLE_SHOW_OPTION } from '../../server/reducers/settingsActions'

interface IChannelSettingsInjectProps {
	label: string,
	mixerProtocol: string,
	sourceOption: string
}

interface IChannelProps {
	channelIndex: number
}

class CcgChannelSettings extends React.PureComponent<IChannelProps & IChannelSettingsInjectProps & Store> {
    mixerProtocol: ICasparCGMixerGeometry | undefined;
    channelIndex: number;

    constructor(props: any) {
        super(props);
		this.channelIndex = this.props.channelIndex;
		const protocol = window.mixerProtocol as ICasparCGMixerGeometry;
		if (protocol.sourceOptions) {
			this.mixerProtocol = protocol;
		}
	}

	handleOption = (prop: string, option: string) => {
		this.props.dispatch({
			type: SET_OPTION,
			channel: this.channelIndex,
			prop,
			option
		});
	}

	handleClose = () => {
		this.props.dispatch({
			type: TOGGLE_SHOW_OPTION,
			channel: this.channelIndex
		});
	}

    render() {
        return (
			<div className="channel-settings-body">
				<h2>{this.props.label || ("CH " + (this.channelIndex + 1))}</h2>
				<button className="close" onClick={() => this.handleClose()}>X</button>
				{this.mixerProtocol &&
					this.mixerProtocol.sourceOptions &&
					Object.getOwnPropertyNames(this.mixerProtocol.sourceOptions.options).map(prop => {
						return (
							<div className="channel-settings-group" key={prop}>
								{Object.getOwnPropertyNames(this.mixerProtocol!.sourceOptions!.options[prop]).map(option => {
									return <button
										key={option}
										className={"channel-settings-group-item" +
											(this.props.sourceOption === this.mixerProtocol!.sourceOptions!.options[prop][option] ? ' active' : '')
										}
										onClick={() => this.handleOption(prop, this.mixerProtocol!.sourceOptions!.options[prop][option])}>
											{option}
									</button>
								}) || null}
							</div>
						)
					})}
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IChannelSettingsInjectProps => {
    return {
        label: state.channels[0].channel[props.channelIndex].label,
		mixerProtocol: state.settings[0].mixerProtocol,
		sourceOption: (state.channels[0].channel[props.channelIndex].private || {})['channel_layout']
    }
}

export default connect<any, IChannelSettingsInjectProps>(mapStateToProps)(CcgChannelSettings) as any;
