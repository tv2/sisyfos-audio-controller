import React from 'react';
import ReactSlider from 'react-slider'

import '../assets/css/ChanStrip.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { 
    TOGGLE_SHOW_CHAN_STRIP,
    TOGGLE_SHOW_OPTION
 } from '../reducers/settingsActions'

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

    handleShowRoutingOptions() {
        this.props.dispatch({
            type: TOGGLE_SHOW_OPTION,
            channel: this.faderIndex
        });
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: -1
        });
    }

    handleClose = () => {
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: -1
        });
    }


    fader(parameterName: string) {
        return (
            <div className="parameter-text">
                {parameterName}
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.faderIndex].faderLevel}
                    onChange={(event: any) => {
                    }}
                />
            </div>
        )
    }

    render() {
        return (
            <div className="chan-strip-body">
                <h2>
                    CHANNEL STRIP: 
                    {this.props.label || ("FADER " + (this.faderIndex + 1))}</h2>
                <button 
                    className="close"
                    onClick={() => this.handleClose()}
                >X</button>
                <div className="vertical">
                    COMPRESSOR
                </div>
                <div className="vertical-line"></div>
                {this.fader('Threshold')}
                {this.fader('Ratio')}
                <div className="vertical-line"></div>
                <div className="vertical">
                    EQ
                </div>
                <div className="vertical-line"></div>
                {this.fader('Low')}
                {this.fader('Mid')}
                {this.fader('High')}
                <div className="vertical-line"></div>
                <div className="vertical">
                    MONITOR
                </div>
                <div className="vertical-line"></div>
                {this.fader('IT')}
                {this.fader('EXT SPK 1')}
                {this.fader('EXT SPK 2')}
                <div className="vertical-line"></div>
                <div className="vertical">
                
                </div>
                <div className="vertical-line"></div>
                <button 
                    className="button"
                    onClick={() => this.handleShowRoutingOptions()}
                >ROUTING</button>
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
