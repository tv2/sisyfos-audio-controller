import * as React from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';
import { connect } from "react-redux";
import { Store } from 'redux';
import '../assets/css/NoUiSlider.css'

//assets:
import '../assets/css/MiniChannel.css';
import { IFader } from '../../server/reducers/fadersReducer';
import { IChannels } from '../../server/reducers/channelsReducer';
import { ISettings } from '../../server/reducers/settingsReducer';
import { TOGGLE_SHOW_CHAN_STRIP } from '../../server/reducers/settingsActions';

interface IChannelInjectProps {
    channels: IChannels 
    fader: IFader
    settings: ISettings
    channelType: number,
    channelTypeIndex: number,
}

interface IChannelProps {
    faderIndex: number
}


class MiniChannel extends React.Component<IChannelProps & IChannelInjectProps & Store> {
    faderIndex: number;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
    }

    public shouldComponentUpdate(nextProps: IChannelInjectProps) {
        return (
            nextProps.fader.showChannel != this.props.fader.showChannel ||
            nextProps.fader.label != this.props.fader.label ||
            nextProps.settings.showChanStrip != this.props.settings.showChanStrip
        )
    }

    handleShowChanStrip() {
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: this.faderIndex
        });
    }

    chanStripButton = () => {
        return (
            <button
                className={ClassNames("monitor-channel-strip-button", {
                    'on': this.props.settings.showChanStrip
                })}
                onClick={event => {
                    this.handleShowChanStrip();
                }}
            >
            {this.props.fader.label != "" ? this.props.fader.label : (window.mixerProtocol.channelTypes[this.props.channelType].channelTypeName + " " + (this.props.channelTypeIndex + 1)) }
            </button>
        )
    }

    render() {
        return (
        this.props.fader.showChannel === false ?
            null
            :
            <div
                className={
                    ClassNames("monitor-channel-body", {
                })}>
                <React.Fragment>
                    {this.chanStripButton()}
                    <br/>
                </React.Fragment>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IChannelInjectProps => {
    return {
        channels: state.channels[0].channel,
        fader: state.faders[0].fader[props.faderIndex],
        settings: state.settings[0],
        channelType: 0, /* TODO: state.channels[0].channel[props.channelIndex].channelType, */
        channelTypeIndex: props.faderIndex ,/* TODO: state.channels[0].channel[props.channelIndex].channelTypeIndex, */
    }
}

export default connect<any, IChannelInjectProps, any>(mapStateToProps)(MiniChannel) as any;
