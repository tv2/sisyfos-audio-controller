import React from 'react'
import ReactSlider from 'react-slider'

import '../assets/css/ChanStrip.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import {
    storeShowChanStrip,
    storeShowOptions,
    storeShowMonitorOptions,
    storeShowChanStripFull,
} from '../../../shared/src/actions/settingsActions'
import { IFader } from '../../../shared/src/reducers/fadersReducer'
import {
    SOCKET_SET_FX,
    SOCKET_SET_AUX_LEVEL,
    SOCKET_SET_INPUT_GAIN,
    SOCKET_SET_INPUT_SELECTOR,
} from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import ReductionMeter from './ReductionMeter'
import ClassNames from 'classnames'
import { fxParamsList } from '../../../shared/src/constants/MixerProtocolInterface'
import { getFaderLabel } from '../utils/labels'

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

// Constants for Delay buttons:
const DEL_VALUES = [10, 1, -1, -10]

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
    handleShowChStripFull() {
        this.props.dispatch(storeShowChanStripFull(this.props.faderIndex))
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

    changeDelay(currentValue: number, addValue: number) {
        window.socketIoClient.emit(SOCKET_SET_FX, {
            fxParam: fxParamsList.DelayTime,
            faderIndex: this.props.faderIndex,
            level: currentValue + addValue,
        })
    }

    handleFx(fxParam: fxParamsList, event: any) {
        window.socketIoClient.emit(SOCKET_SET_FX, {
            fxParam: fxParam,
            faderIndex: this.props.faderIndex,
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
        let maxLabel: number =
            window.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_INPUT_GAIN?.[0].maxLabel ?? 1
        let minLabel =
            window.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_INPUT_GAIN?.[0].minLabel ?? 0
        return (
            <div className="parameter-text">
                Gain
                <div className="parameter-mini-text">{maxLabel + ' dB'}</div>
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
                <div className="parameter-mini-text">{minLabel + ' dB'}</div>
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
                {this.fxParamFader(fxParamsList.DelayTime)}
                <div className="delayButtons">
                    {DEL_VALUES.map((value: number) => {
                        return (
                            <button
                                className="delayTime"
                                onClick={() => {
                                    this.changeDelay(
                                        this.props.fader[this.props.faderIndex][
                                            fxParamsList.DelayTime
                                        ]?.[0] || 0,
                                        value / 500
                                    )
                                }}
                            >
                                {value > 0 ? '+' : ''}
                                {value}ms
                            </button>
                        )
                    })}
                </div>
            </React.Fragment>
        )
    }

    fxParamFader(fxParam: fxParamsList) {
        let maxLabel: number =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .maxLabel ?? 1
        let minLabel =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .minLabel ?? 0
        let valueLabel =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .valueLabel ?? ''
        let valueAsLabels =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .valueAsLabels
        return (
            <div className="parameter-text">
                {window.mixerProtocol.channelTypes[0].fromMixer[fxParam][0]
                    .label ?? ''}
                <div className="parameter-mini-text">
                    {!valueAsLabels
                        ? maxLabel + valueLabel
                        : valueAsLabels[valueAsLabels.length - 1] + valueLabel}
                </div>
                <ReactSlider
                    className="chan-strip-fader"
                    thumbClassName="chan-strip-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.001}
                    value={
                        this.props.fader[this.props.faderIndex][fxParam]?.[0] ??
                        0
                    }
                    renderThumb={(props: any, state: any) => (
                        <div {...props}>
                            {!valueAsLabels
                                ? Math.round(
                                      (maxLabel - minLabel) *
                                          parseFloat(state.valueNow) +
                                          minLabel
                                  )
                                : valueAsLabels[
                                      Math.round(
                                          parseFloat(state.valueNow) *
                                              (maxLabel - minLabel)
                                      )
                                  ]}
                            {valueLabel}
                        </div>
                    )}
                    onChange={(event: any) => {
                        this.handleFx(fxParam, event)
                    }}
                />
                <div className="parameter-mini-text">
                    {!valueAsLabels
                        ? minLabel + valueLabel
                        : valueAsLabels[0] + valueLabel}
                </div>
            </div>
        )
    }

    monitor(channelIndex: number) {
        let faderIndex = this.props.channel[channelIndex].assignedFader
        if (faderIndex === -1) return null
        let monitorName = getFaderLabel(faderIndex, 'Fader')
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
            const hasGainTrim =
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.GainTrim
                ]
            const hasComp =
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.CompThrs
                ] ||
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.CompRatio
                ]
            const hasDelay =
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.DelayTime
                ]
            const hasEq =
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.EqGain01
                ] ||
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.EqGain02
                ] ||
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.EqGain03
                ] ||
                window.mixerProtocol.channelTypes[0].toMixer[
                    fxParamsList.EqGain04
                ]
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
                        {hasGainTrim && (
                            <React.Fragment>
                                <div className="item">
                                    <div className="title">INPUT</div>
                                    <div className="content">
                                        {this.fxParamFader(
                                            fxParamsList.GainTrim
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {hasComp && (
                            <React.Fragment>
                                <div className="item">
                                    <div className="title">COMPRESSOR</div>
                                    <div className="content">
                                        {this.fxParamFader(
                                            fxParamsList.CompThrs
                                        )}
                                        <p className="zero-comp">______</p>
                                        {this.fxParamFader(
                                            fxParamsList.CompRatio
                                        )}
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
                                                .channelTypes[0].toMixer[
                                                fxParamsList.EqGain01
                                            ] ? (
                                                <React.Fragment>
                                                    {this.fxParamFader(
                                                        fxParamsList.EqGain01
                                                    )}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer[
                                                fxParamsList.EqGain02
                                            ] ? (
                                                <React.Fragment>
                                                    {this.fxParamFader(
                                                        fxParamsList.EqGain02
                                                    )}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer[
                                                fxParamsList.EqGain03
                                            ] ? (
                                                <React.Fragment>
                                                    {this.fxParamFader(
                                                        fxParamsList.EqGain03
                                                    )}
                                                    <p className="zero-eq">
                                                        _______
                                                    </p>
                                                </React.Fragment>
                                            ) : null}
                                            {window.mixerProtocol
                                                .channelTypes[0].toMixer[
                                                fxParamsList.EqGain04
                                            ] ? (
                                                <React.Fragment>
                                                    {this.fxParamFader(
                                                        fxParamsList.EqGain04
                                                    )}
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
                                {this.props.label}
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
                        {this.props.label}
                        <button
                            className="close"
                            onClick={() => this.handleClose()}
                        >
                            X
                        </button>
                        <button
                            className="button"
                            onClick={() => this.handleShowChStripFull()}
                        >
                            Full Ch.Strip
                        </button>
                    </div>
                    <hr />
                    {this.parameters()}
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
        numberOfChannelsInType:
            state.settings[0].mixers[0].numberOfChannelsInType,
        channel: state.channels[0].chMixerConnection[0].channel,
        fader: state.faders[0].fader,
        auxSendIndex: -1,
        offtubeMode: state.settings[0].offtubeMode,
    }
    if (props.faderIndex >= 0) {
        inject = {
            label: getFaderLabel(props.faderIndex, 'FADER'),
            selectedProtocol: state.settings[0].mixers[0].mixerProtocol,
            numberOfChannelsInType:
                state.settings[0].mixers[0].numberOfChannelsInType,
            channel: state.channels[0].chMixerConnection[0].channel,
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
