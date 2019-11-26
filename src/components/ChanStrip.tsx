import React, { ChangeEvent } from 'react';
import ReactSlider from 'react-slider'

import '../assets/css/ChanStrip.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { 
    TOGGLE_SHOW_CHAN_STRIP,
    TOGGLE_SHOW_OPTION,
    TOGGLE_SHOW_MONITOR_OPTIONS
 } from '../reducers/settingsActions'
import { IFader } from '../reducers/fadersReducer'
import { SET_FADER_LEVEL, SET_FADER_THRESHOLD, SET_FADER_RATIO, SET_FADER_LOW, SET_FADER_MID, SET_FADER_HIGH, SET_FADER_MONITOR } from '../reducers/faderActions'
import { SET_AUX_LEVEL } from '../reducers/channelActions';

interface IChanStripInjectProps {
    label: string,
    selectedProtocol: string,
    numberOfChannelsInType: Array<number>,
    channel: Array<any>
    fader: Array<IFader>
    auxSendIndex: number
    offtubeMode: boolean
}

interface IChanStripProps {
    faderIndex: number
}

class ChanStrip extends React.PureComponent<IChanStripProps & IChanStripInjectProps & Store> {
    mixerProtocol: IMixerProtocolGeneric

    constructor(props: any) {
        super(props);
        this.mixerProtocol = MixerProtocolPresets[this.props.selectedProtocol];
    }

    handleShowRoutingOptions() {
        this.props.dispatch({
            type: TOGGLE_SHOW_OPTION,
            channel: this.props.faderIndex
        });
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: -1
        });
    }

    handleShowMonitorOptions() {
        this.props.dispatch({
            type: TOGGLE_SHOW_MONITOR_OPTIONS,
            channel: this.props.faderIndex
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

    handleThreshold(event: any) {
        this.props.dispatch({
            type: SET_FADER_THRESHOLD,
            channel: this.props.faderIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateThreshold(this.props.faderIndex);
    }


    threshold() {
        return (
            <div className="parameter-text">
                Threshold
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.props.faderIndex].threshold}
                    onChange={(event: any) => {
                        this.handleThreshold(event)
                    }}
                />
            </div>
        )
    }

    handleRatio(event: any) {
        this.props.dispatch({
            type: SET_FADER_RATIO,
            channel: this.props.faderIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateOutLevel(this.props.faderIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(this.props.faderIndex, event)
        }
    }
    ratio() {
        return (
            <div className="parameter-text">
                Ratio
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.props.faderIndex].ratio}
                    onChange={(event: any) => {
                        this.handleRatio(event)
                    }}
                />
            </div>
        )
    }

    handleLow(event: any) {
        this.props.dispatch({
            type: SET_FADER_LOW,
            channel: this.props.faderIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateOutLevel(this.props.faderIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(this.props.faderIndex, event)
        }
    }
    low() {
        return (
            <div className="parameter-text">
                Low
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.props.faderIndex].low}
                    onChange={(event: any) => {
                        this.handleLow(event)
                    }}
                />
            </div>
        )
    }

    handleMid(event: any) {
        this.props.dispatch({
            type: SET_FADER_MID,
            channel: this.props.faderIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateOutLevel(this.props.faderIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(this.props.faderIndex, event)
        }
    }
    mid() {
        return (
            <div className="parameter-text">
                Mid
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.props.faderIndex].mid}
                    onChange={(event: any) => {
                        this.handleMid(event)
                    }}
                />
            </div>
        )
    }

    handleHigh(event: any) {
        this.props.dispatch({
            type: SET_FADER_HIGH,
            channel: this.props.faderIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateOutLevel(this.props.faderIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(this.props.faderIndex, event)
        }
    }
    high() {
        return (
            <div className="parameter-text">
                High
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.props.faderIndex].high}
                    onChange={(event: any) => {
                        this.handleHigh(event)
                    }}
                />
            </div>
        )
    }

    handleMonitorLevel(event: any, channelIndex: number) {
        this.props.dispatch({
            type: SET_AUX_LEVEL,
            channel: channelIndex,
            auxIndex: this.props.auxSendIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateAuxLevel(this.props.channel[channelIndex].assignedFader);
    }
    monitor(channelIndex: number) {
        let faderIndex = this.props.channel[channelIndex].assignedFader
        if (faderIndex === -1) return null
        let monitorName = this.props.fader[faderIndex].label
        if (monitorName === '') {
            monitorName = 'Fader ' + String(this.props.channel[channelIndex].assignedFader + 1)
        }
        return (
            <li key={channelIndex}>
                {monitorName}
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.channel[channelIndex].auxLevel[this.props.auxSendIndex]}
                    onChange={(event: any) => {
                        this.handleMonitorLevel(event, channelIndex)
                    }}
                />
            </li>
        )
    }
    parameters() {
        return (
            <div className="parameters">
                <div className="vertical">
                    {this.props.label || ("FADER " + (this.props.faderIndex + 1))}
                    {" COMPRESSOR"}
                </div>
                <div className="vertical-line"></div>
                {this.threshold()}
                {this.ratio()}
                <div className="vertical-line"></div>
                <div className="vertical">
                    {this.props.label || ("FADER " + (this.props.faderIndex + 1))}
                    {" EQUALIZER"}
                </div>
                <div className="vertical-line"></div>
                {this.low()}
                {this.mid()}
                {this.high()}
                <div className="vertical-line"></div>
                <div className="vertical">
                    {this.props.label || ("FADER " + (this.props.faderIndex + 1))}
                    {" MONITOR MIX"}
                </div>
                <div className="vertical-line"></div>
                <ul className="monitor-sends">
                    {this.props.channel.map((ch: any, index: number) => {
                        if (ch.auxLevel[this.props.auxSendIndex] >= 0) {
                            return this.monitor(index)
                        } 
                    })}
                </ul>
                <div className="vertical-line"></div>
                <div className="vertical">
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="chan-strip-body">
                {this.props.offtubeMode ?
                    this.parameters() 
                    : null
                }
                <div className="settings-buttons">
                    <button 
                        className="close"
                        onClick={() => this.handleClose()}
                    >X</button>
                    <div className="vertical-line"></div>
                    <button 
                        className="button"
                        onClick={() => this.handleShowRoutingOptions()}
                        >CHANNEL ROUTING</button>
                    <button 
                        className="button"
                        onClick={() => this.handleShowMonitorOptions()}
                        >MONITOR ROUTING</button>
                </div>
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
        auxSendIndex: state.faders[0].fader[props.faderIndex].monitor - 1,
        offtubeMode: state.settings[0].offtubeMode
    }
}

export default connect<any, IChanStripInjectProps>(mapStateToProps)(ChanStrip) as any;
