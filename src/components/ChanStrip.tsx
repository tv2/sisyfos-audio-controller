import React from 'react';

import '../assets/css/ChanStrip.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';

interface IChanStripInjectProps {
    label: string,
    selectedProtocol: string,
    numberOfChannelsInType: Array<number>,
    channel: Array<any>
    fader: Array<any>
}

interface IChanStripProps {
    faderIndex: number
}

class ChanStrip extends React.PureComponent<IChanStripProps & IChanStripInjectProps & Store> {
    faderIndex: number;
    mixerProtocol: IMixerProtocolGeneric;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
        this.mixerProtocol = MixerProtocolPresets[this.props.selectedProtocol];
    }

    handleAssignChannel(channel: number, event: any) {
        return true;
    }

    handleShowRoutingOptions() {
        this.props.dispatch({
            type: 'TOGGLE_SHOW_OPTION',
            channel: this.faderIndex
        });
        this.props.dispatch({
            type: 'TOGGLE_SHOW_CHAN_STRIP',
            channel: -1
        });
    }

    handle11Routing() {
        return true
    }

    handleClose = () => {
        this.props.dispatch({
            type: 'TOGGLE_SHOW_CHAN_STRIP',
            channel: -1
        });
    }

    render() {
        return (
            <div className="chan-strip-body">
                <h2>
                    CHANNEL STRIP 
                    <br/>
                    {this.props.label || ("FADER " + (this.faderIndex + 1))}</h2>
                <button 
                    className="close"
                    onClick={() => this.handleClose()}
                >X</button>
                <button 
                    className="button"
                    onClick={() => this.handleShowRoutingOptions()}
                >ROUTING</button>
                <button 
                    className="button"
                    onClick={() => this.handle11Routing()}
                >NOTHING ELSE</button>
                <hr />
            </div>
        )
    }

}

const mapStateToProps = (state: any, props: any): IChanStripInjectProps => {
    return {
        label: state.faders[0].fader[props.faderIndex].label,
        selectedProtocol: state.settings[0].mixerProtocol,
        numberOfChannelsInType: state.settings[0].numberOfChannelsInType,
        channel: state.channels[0].channel,
        fader: state.faders[0].fader,
    }
}

export default connect<any, IChanStripInjectProps>(mapStateToProps)(ChanStrip) as any;
