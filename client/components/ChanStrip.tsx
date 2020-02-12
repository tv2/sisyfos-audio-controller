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
import { 
    SOCKET_SET_THRESHOLD, 
    SOCKET_SET_RATIO,
    SOCKET_SET_DELAY_TIME, 
    SOCKET_SET_LOW, 
    SOCKET_SET_LO_MID, 
    SOCKET_SET_MID, 
    SOCKET_SET_HIGH, 
    SOCKET_SET_AUX_LEVEL 
} from '../../server/constants/SOCKET_IO_DISPATCHERS';
import CcgChannelInputSettings from './CcgChannelSettings';

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

    handleDelay(event: any) {
        window.socketIoClient.emit( SOCKET_SET_DELAY_TIME, 
            {
                channel: this.props.faderIndex,
                delayTime: parseFloat(event)
            }
        )
    }

    changeDelay(currentValue: number, addValue: number) {
        window.socketIoClient.emit( SOCKET_SET_DELAY_TIME, 
            {
                channel: this.props.faderIndex,
                delayTime: currentValue + addValue
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

    handleLoMid(event: any) {
        window.socketIoClient.emit( SOCKET_SET_LO_MID, 
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

    delay() {
        return (
            <React.Fragment>
                <div className="delayButtons">
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay((this.props.fader[this.props.faderIndex].delayTime || 0), 10/500)
                        }}
                    >
                        +10ms
                    </button>
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay((this.props.fader[this.props.faderIndex].delayTime || 0), 1/500)
                        }}
                    >
                        +1ms
                    </button>
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay((this.props.fader[this.props.faderIndex].delayTime || 0), -1/500)
                        }}
                    >
                        -1ms
                    </button>
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay((this.props.fader[this.props.faderIndex].delayTime || 0), -10/500)
                        }}
                    >
                        -10ms
                    </button>
                </div>
                <div className="parameter-text">
                    {Math.round(500*(this.props.fader[this.props.faderIndex].delayTime || 0))} ms
                    <ReactSlider 
                        className="chan-strip-fader"
                        thumbClassName = "chan-strip-thumb"
                        orientation = "vertical"
                        invert
                        min={0}
                        max={1}
                        step={0.01}
                        value= {this.props.fader[this.props.faderIndex].delayTime || 0}
                        onChange={(event: any) => {
                            this.handleDelay(event)
                        }}
                    />
                </div>
            </React.Fragment>
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

    loMid() {
        return (
            <div className="parameter-text">
                Lo-Mid
                <ReactSlider 
                    className="chan-strip-fader"
                    thumbClassName = "chan-strip-thumb"
                    orientation = "vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value= {this.props.fader[this.props.faderIndex].loMid}
                    onChange={(event: any) => {
                        this.handleLoMid(event)
                    }}
                />
            </div>
        )
    }

    mid() {
        return (
            <div className="parameter-text">
                Hi-Mid
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
        let monitorName = this.props.fader[faderIndex] ? this.props.fader[faderIndex].label : ''
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
                <p className="zero-monitor">_______</p>
            </li>
        )
    }
    parameters() {
        if (this.props.selectedProtocol.includes("caspar")) {
            return (
                <CcgChannelInputSettings channelIndex={this.props.faderIndex} />
            )
        }
        else {
            return (
                <div className="parameters">
                    <div className="group-text">
                        COMPRESSOR
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        &nbsp;&nbsp;&nbsp;
                        DELAY
                    </div>
                    <div className="parameter-group">
                        {this.threshold()}
                        <p className="zero-comp">______</p>
                        {this.ratio()}
                        <p className="zero-comp">______</p>
                        <p className="horizontal-space"></p>
                        {this.delay()}

                    </div>
                    <hr/>
                    <div className="group-text">
                        {"EQUALIZER"}
                    </div>
                    <div className="parameter-group">
                        {this.low()}
                        <p className="zero-eq">_______</p>
                        {this.loMid()}
                        <p className="zero-eq">_______</p>
                        {this.mid()}
                        <p className="zero-eq">_______</p>
                        {this.high()}
                        <p className="zero-eq">_______</p>
                    </div>
                    <hr/>
                    <div className="group-text">
                    {this.props.label || ("FADER " + (this.props.faderIndex + 1))}
                        {" - MONITOR MIX MINUS"}
                    </div>
                    <ul className="monitor-sends">
                        {this.props.channel.map((ch: any, index: number) => {
                            if (ch.auxLevel[this.props.auxSendIndex] >= 0) {
                                return this.monitor(index)
                            } 
                        })}
                    </ul>
                </div>
            )
        }
    }

    render() {
        if (this.props.faderIndex >= 0) {
            return (
                <div className="chan-strip-body">
                    <div className="header">
                        {this.props.label || ("FADER " + (this.props.faderIndex + 1))}
                        <button 
                                className="close"
                                onClick={() => this.handleClose()}
                            >X
                        </button>

                    </div>
                    <div className="header">
                        {window.location.search.includes('settings=0') ?
                        null :
                            <button 
                                className="button"
                                onClick={() => this.handleShowRoutingOptions()}
                                >CHANNEL ROUTING
                            </button>
                        }
                        {window.location.search.includes('settings=0') ?
                            null :
                            <button 
                                className="button"
                                onClick={() => this.handleShowMonitorOptions()}
                                >MONITOR ROUTING
                            </button>
                        }
                    </div>
                    <hr/>
                    {this.props.offtubeMode ?
                        this.parameters() 
                        : null
                    }
                </div>
            )
        } else {
            return (
                <div className="chan-strip-body">
                </div>
            )
        }

    }
}

const mapStateToProps = (state: any, props: any): IChanStripInjectProps => {
    let inject: IChanStripInjectProps = {
        label: '',
        selectedProtocol: state.settings[0].mixerProtocol,
        numberOfChannelsInType: state.settings[0].numberOfChannelsInType,
        channel: state.channels[0].channel,
        fader: state.faders[0].fader,
        auxSendIndex: -1,
        offtubeMode: state.settings[0].offtubeMode
    }
    if (props.faderIndex >= 0) {
        inject = {
            label: state.faders[0].fader[props.faderIndex].label,
            selectedProtocol: state.settings[0].mixerProtocol,
            numberOfChannelsInType: state.settings[0].numberOfChannelsInType,
            channel: state.channels[0].channel,
            fader: state.faders[0].fader,
            auxSendIndex: state.faders[0].fader[props.faderIndex].monitor - 1,
            offtubeMode: state.settings[0].offtubeMode
        }
    } 
    return inject
}

export default connect<any, IChanStripInjectProps>(mapStateToProps)(ChanStrip) as any;
