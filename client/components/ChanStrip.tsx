import React from 'react'
import ReactSlider from 'react-slider'

import '../assets/css/ChanStrip.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import {
     storeShowChanStrip, storeShowOptions, storeShowMonitorOptions
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
    SOCKET_SET_AUX_LEVEL,
    SOCKET_SET_INPUT_GAIN,
    SOCKET_SET_INPUT_SELECTOR,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
import CcgChannelInputSettings from './CcgChannelSettings'
import ReductionMeter from './ReductionMeter'
import ClassNames from 'classnames'

interface IChanStripInjectProps {
    label: string
    selectedProtocol: string
    numberOfChannelsInType: Array<number>
    channel: Array<any>
    fader: Array<IFader>
    auxSendIndex: number
    offtubeMode: boolean
}

interface IChanStripProps {
    faderIndex: number
}

class ChanStrip extends React.PureComponent<
    IChanStripProps & IChanStripInjectProps & Store
> {
    constructor(props: any) {
        super(props)
    }

    shouldComponentUpdate(nextProps: IChanStripInjectProps & IChanStripProps) {
        if (nextProps.faderIndex > -1) {
            return true
        } else {
            return false
        }
    }

    handleShowRoutingOptions() {
        this.props.dispatch(storeShowOptions(this.props.faderIndex))
        this.props.dispatch(storeShowChanStrip(-1))
    }

    handleShowMonitorOptions() {
        this.props.dispatch(storeShowMonitorOptions(this.props.faderIndex))
        this.props.dispatch(storeShowChanStrip(-1))
    }

    handleClose = () => {
        this.props.dispatch(storeShowChanStrip(-1))
    }
    handleInputSelect(selected: number) {
        window.socketIoClient.emit(SOCKET_SET_INPUT_SELECTOR, {
            faderIndex: this.props.faderIndex,
            selected: selected,
        })
    }
    handleInputGain(event: any) {
        window.socketIoClient.emit(SOCKET_SET_INPUT_GAIN, {
            faderIndex: this.props.faderIndex,
            level: parseFloat(event),
        })
    }
    handleThreshold(event: any) {
        window.socketIoClient.emit(SOCKET_SET_THRESHOLD, {
            channel: this.props.faderIndex,
            level: parseFloat(event),
        })
    }
    handleRatio(event: any) {
        window.socketIoClient.emit(SOCKET_SET_RATIO, {
            channel: this.props.faderIndex,
            level: parseFloat(event),
        })
    }

    handleDelay(event: any) {
        window.socketIoClient.emit(SOCKET_SET_DELAY_TIME, {
            channel: this.props.faderIndex,
            delayTime: parseFloat(event),
        })
    }

    changeDelay(currentValue: number, addValue: number) {
        window.socketIoClient.emit(SOCKET_SET_DELAY_TIME, {
            channel: this.props.faderIndex,
            delayTime: currentValue + addValue,
        })
    }

    handleLow(event: any) {
        window.socketIoClient.emit(SOCKET_SET_LOW, {
            channel: this.props.faderIndex,
            level: parseFloat(event),
        })
    }

    handleLoMid(event: any) {
        window.socketIoClient.emit(SOCKET_SET_LO_MID, {
            channel: this.props.faderIndex,
            level: parseFloat(event),
        })
    }

    handleMid(event: any) {
        window.socketIoClient.emit(SOCKET_SET_MID, {
            channel: this.props.faderIndex,
            level: parseFloat(event),
        })
    }
    handleHigh(event: any) {
        window.socketIoClient.emit(SOCKET_SET_HIGH, {
            channel: this.props.faderIndex,
            level: parseFloat(event),
        })
    }
    handleMonitorLevel(event: any, channelIndex: number) {
        window.socketIoClient.emit(SOCKET_SET_AUX_LEVEL, {
            channel: channelIndex,
            auxIndex: this.props.auxSendIndex,
            level: parseFloat(event),
        })
    }

    inputSelectorButton(index: number) {
        const isActive =
            this.props.fader[this.props.faderIndex].inputSelector === index + 1
        return (
            <button
                className={ClassNames('input-select', {
                    active: isActive,
                })}
                // className={'input-select' + (isActive ? ' active' : '')}
                onClick={() => {
                    this.handleInputSelect(index + 1)
                }}
            >
                {window.mixerProtocol.channelTypes[0].toMixer
                    .CHANNEL_INPUT_SELECTOR
                    ? window.mixerProtocol.channelTypes[0].toMixer
                          .CHANNEL_INPUT_SELECTOR[index].label
                    : null}
            </button>
        )
    }

    inputSelector() {
        return (
            <div
                className={ClassNames('input-buttons', {
                    disabled:
                        this.props.fader[this.props.faderIndex].capabilities &&
                        !this.props.fader[this.props.faderIndex].capabilities!
                            .hasInputSelector,
                })}
            >
                {window.mixerProtocol.channelTypes[0].toMixer
                    .CHANNEL_INPUT_SELECTOR ? (
                    <React.Fragment>
                        {window.mixerProtocol.channelTypes[0].toMixer.CHANNEL_INPUT_SELECTOR.map(
                            (none: any, index: number) => {
                                return this.inputSelectorButton(index)
                            }
                        )}
                    </React.Fragment>
                ) : null}
            </div>
        )
    }

    inputGain() {
        return (
            <div className="parameter-text">
                Gain
                {window.mixerProtocol.channelTypes[0].toMixer
                    .CHANNEL_INPUT_GAIN ? (
                    <React.Fragment>
                        <ReactSlider
                            className="chan-strip-fader"
                            thumbClassName="chan-strip-thumb"
                            orientation="vertical"
                            invert
                            min={0}
                            max={1}
                            step={0.01}
                            value={
                                this.props.fader[this.props.faderIndex]
                                    .inputGain
                            }
                            onChange={(event: any) => {
                                this.handleInputGain(event)
                            }}
                        />
                    </React.Fragment>
                ) : null}
            </div>
        )
    }

    threshold() {
        return (
            <div className="parameter-text">
                Threshold
                <ReactSlider
                    className="chan-strip-fader"
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[this.props.faderIndex].threshold}
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
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[this.props.faderIndex].ratio}
                    onChange={(event: any) => {
                        this.handleRatio(event)
                    }}
                />
            </div>
        )
    }

    gainReduction() {
        return (
            <div className="parameter-text">
                Redution
                <ReductionMeter faderIndex={this.props.faderIndex} />
            </div>
        )
    }
    delay() {
        return (
            <React.Fragment>
                <div className="parameter-text">
                    {Math.round(
                        500 *
                            (this.props.fader[this.props.faderIndex]
                                .delayTime || 0)
                    )}{' '}
                    ms
                    <ReactSlider
                        className="chan-strip-fader"
                        thumbClassName="chan-strip-thumb"
                        orientation="vertical"
                        invert
                        min={0}
                        max={1}
                        step={0.01}
                        value={
                            this.props.fader[this.props.faderIndex].delayTime ||
                            0
                        }
                        onChange={(event: any) => {
                            this.handleDelay(event)
                        }}
                    />
                </div>
                <div className="delayButtons">
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay(
                                this.props.fader[this.props.faderIndex]
                                    .delayTime || 0,
                                10 / 500
                            )
                        }}
                    >
                        +10ms
                    </button>
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay(
                                this.props.fader[this.props.faderIndex]
                                    .delayTime || 0,
                                1 / 500
                            )
                        }}
                    >
                        +1ms
                    </button>
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay(
                                this.props.fader[this.props.faderIndex]
                                    .delayTime || 0,
                                -1 / 500
                            )
                        }}
                    >
                        -1ms
                    </button>
                    <button
                        className="delayTime"
                        onClick={() => {
                            this.changeDelay(
                                this.props.fader[this.props.faderIndex]
                                    .delayTime || 0,
                                -10 / 500
                            )
                        }}
                    >
                        -10ms
                    </button>
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
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[this.props.faderIndex].low}
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
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[this.props.faderIndex].loMid}
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
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[this.props.faderIndex].mid}
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
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[this.props.faderIndex].high}
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
        let monitorName = this.props.fader[faderIndex]
            ? this.props.fader[faderIndex].label
            : ''
        if (monitorName === '') {
            monitorName =
                'Fader ' +
                String(this.props.channel[channelIndex].assignedFader + 1)
        }
        return (
            <li key={channelIndex}>
                {monitorName}
                <ReactSlider
                    className="chan-strip-fader"
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={
                        this.props.channel[channelIndex].auxLevel[
                            this.props.auxSendIndex
                        ]
                    }
                    onChange={(event: any) => {
                        this.handleMonitorLevel(event, channelIndex)
                    }}
                />
                <p className="zero-monitor">_______</p>
            </li>
        )
    }
    parameters() {
        if (this.props.offtubeMode) {
            const hasInput =
                window.mixerProtocol.channelTypes[0].toMixer
                    .CHANNEL_INPUT_GAIN ||
                window.mixerProtocol.channelTypes[0].toMixer
                    .CHANNEL_INPUT_SELECTOR
            const hasComp =
                window.mixerProtocol.channelTypes[0].toMixer.THRESHOLD ||
                window.mixerProtocol.channelTypes[0].toMixer.DELAY_TIME
            const hasDelay =
                window.mixerProtocol.channelTypes[0].toMixer.DELAY_TIME
            const hasEq =
                window.mixerProtocol.channelTypes[0].toMixer.LOW ||
                window.mixerProtocol.channelTypes[0].toMixer.LO_MID ||
                window.mixerProtocol.channelTypes[0].toMixer.MID ||
                window.mixerProtocol.channelTypes[0].toMixer.HIGH
            const hasMonitorSends = this.props.channel.find(
                (ch: any) => ch.auxLevel[this.props.auxSendIndex] >= 0
            )
            return (
                <div className="parameters">
                    <div className="horizontal">
                        {hasInput && (
                            <React.Fragment>
                                <div className="item">
                                    <div className="title">INPUT</div>
                                    <div className="content">
                                        {this.inputSelector()}
                                        {this.inputGain()}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {hasComp && (
                            <React.Fragment>
                                <div className="item">
                                    <div className="title">COMPRESSOR</div>
                                    <div className="content">
                                        {this.threshold()}
                                        <p className="zero-comp">______</p>
                                        {this.ratio()}
                                        <p className="zero-comp">______</p>
                                        {this.gainReduction()}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {hasDelay && (
                            <React.Fragment>
                                <div className="item">
                                    <div className="title">DELAY</div>
                                    <div className="content">
                                        {this.delay()}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    </div>

                    {hasEq && (
                        <React.Fragment>
                            <hr />
                            <div className="horizontal">
                                <div className="item">
                                    <div className="title">EQUALIZER</div>
                                    <div className="content">
                                        <div className="eq-group">
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer.LOW ? (
                                                <React.Fragment>
                                                    {this.low()}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer
                                                .LO_MID ? (
                                                <React.Fragment>
                                                    {this.loMid()}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer.MID ? (
                                                <React.Fragment>
                                                    {this.mid()}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer
                                                .HIGH ? (
                                                <React.Fragment>
                                                    {this.high()}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )}

                    {hasMonitorSends && (
                        <React.Fragment>
                            <hr />
                            <div className="group-text">
                                {this.props.label ||
                                    'FADER ' + (this.props.faderIndex + 1)}
                                {' - MONITOR MIX MINUS'}
                            </div>
                            <ul className="monitor-sends">
                                {this.props.channel.map(
                                    (ch: any, index: number) => {
                                        if (
                                            ch.auxLevel[
                                                this.props.auxSendIndex
                                            ] >= 0
                                        ) {
                                            return this.monitor(index)
                                        }
                                    }
                                )}
                            </ul>
                        </React.Fragment>
                    )}
                </div>
            )
        } else {
            return null
        }
    }

    render() {
        if (this.props.faderIndex >= 0) {
            return (
                <div className="chan-strip-body">
                    <div className="header">
                        {this.props.label ||
                            'FADER ' + (this.props.faderIndex + 1)}
                        <button
                            className="close"
                            onClick={() => this.handleClose()}
                        >
                            X
                        </button>
                    </div>
                    <div className="header">
                        {window.location.search.includes(
                            'settings=0'
                        ) ? null : (
                            <button
                                className="button half"
                                onClick={() => this.handleShowRoutingOptions()}
                            >
                                CHANNEL ROUTING
                            </button>
                        )}
                        {window.location.search.includes(
                            'settings=0'
                        ) ? null : (
                            <button
                                className="button half"
                                onClick={() => this.handleShowMonitorOptions()}
                            >
                                MONITOR ROUTING
                            </button>
                        )}
                    </div>
                    <hr />
                    {this.props.selectedProtocol.includes('caspar') ? (
                        <CcgChannelInputSettings
                            channelIndex={this.props.faderIndex}
                        />
                    ) : (
                        this.parameters()
                    )}
                </div>
            )
        } else {
            return <div className="chan-strip-body"></div>
        }
    }
}

const mapStateToProps = (state: any, props: any): IChanStripInjectProps => {
    let inject: IChanStripInjectProps = {
        label: '',
        selectedProtocol: state.settings[0].mixers[0].mixerProtocol,
        numberOfChannelsInType: state.settings[0].mixers[0].numberOfChannelsInType,
        channel: state.channels[0].chConnection[0].channel,
        fader: state.faders[0].fader,
        auxSendIndex: -1,
        offtubeMode: state.settings[0].offtubeMode,
    }
    if (props.faderIndex >= 0) {
        inject = {
            label: state.faders[0].fader[props.faderIndex].label,
            selectedProtocol: state.settings[0].mixers[0].mixerProtocol,
            numberOfChannelsInType: state.settings[0].mixers[0].numberOfChannelsInType,
            channel: state.channels[0].chConnection[0].channel,
            fader: state.faders[0].fader,
            auxSendIndex: state.faders[0].fader[props.faderIndex].monitor - 1,
            offtubeMode: state.settings[0].offtubeMode,
        }
    }
    return inject
}

export default connect<any, IChanStripInjectProps>(mapStateToProps)(
    ChanStrip
) as any
