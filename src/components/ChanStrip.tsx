import React from 'react';
import ReactSlider from 'react-slider'

import '../assets/css/ChanStrip.css';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { 
    TOGGLE_SHOW_CHAN_STRIP,
    TOGGLE_SHOW_OPTION,
    TOGGLE_SHOW_MONITOR_OPTIONS
 } from '../../server/reducers/settingsActions'
import { IFader } from '../../server/reducers/fadersReducer'
import { SET_FADER_THRESHOLD, SET_FADER_RATIO, SET_FADER_LOW, SET_FADER_MID, SET_FADER_HIGH } from '../../server/reducers/faderActions'
import { SET_AUX_LEVEL } from '../../server/reducers/channelActions';
import { SOCKET_SET_THRESHOLD, SOCKET_SET_RATIO, SOCKET_SET_LOW, SOCKET_SET_MID, SOCKET_SET_HIGH, SOCKET_SET_AUX_LEVEL } from '../../server/constants/SOCKET_IO_DISPATCHERS';

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

    constructor(props: any) {
        super(props);
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
        window.socketIoClient.emit( SOCKET_SET_THRESHOLD, 
            {
                channel: this.props.faderIndex,
                level: parseFloat(event)
            }
        )
    }
    handleRatio(event: any) {
        window.socketIoClient.emit( SOCKET_SET_RATIO, 
            {
                channel: this.props.faderIndex,
                level: parseFloat(event)
            }
        )
    }
    handleLow(event: any) {
        window.socketIoClient.emit( SOCKET_SET_LOW, 
            {
                channel: this.props.faderIndex,
                level: parseFloat(event)
            }
        )
    }
    handleMid(event: any) {
        window.socketIoClient.emit( SOCKET_SET_MID, 
            {
                channel: this.props.faderIndex,
                level: parseFloat(event)
            }
        )
    }
    handleHigh(event: any) {
        window.socketIoClient.emit( SOCKET_SET_HIGH, 
            {
                channel: this.props.faderIndex,
                level: parseFloat(event)
            }
        )
    }
    handleMonitorLevel(event: any, channelIndex: number) {
        window.socketIoClient.emit( 
            SOCKET_SET_AUX_LEVEL, 
            {
                channel: channelIndex,
                auxIndex: this.props.auxSendIndex,
                level: parseFloat(event)
            }
        )
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
