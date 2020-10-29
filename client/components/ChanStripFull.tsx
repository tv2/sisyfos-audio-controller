import React from 'react'
import ReactSlider from 'react-slider'
import Draggable from 'react-draggable'

import '../assets/css/ChanStripFull.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import {
    storeShowOptions,
    storeShowMonitorOptions,
    storeShowChanStripFull,
} from '../../server/reducers/settingsActions'
import { IFader } from '../../server/reducers/fadersReducer'
import {
    SOCKET_SET_FX,
    SOCKET_SET_AUX_LEVEL,
    SOCKET_SET_INPUT_GAIN,
    SOCKET_SET_INPUT_SELECTOR,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
import CcgChannelInputSettings from './CcgChannelSettings'
import ReductionMeter from './ReductionMeter'
import ClassNames from 'classnames'
import { fxParamsList } from '../../server/constants/MixerProtocolInterface'
import { IChannel } from '../../server/reducers/channelsReducer'

interface IChanStripFullInjectProps {
    label: string
    selectedProtocol: string
    numberOfChannelsInType: Array<number>
    channel: IChannel[]
    fader: IFader[]
    auxSendIndex: number
    offtubeMode: boolean
}

interface IChanStripFullProps {
    faderIndex: number
}

enum EqColors {
    'rgb(93, 184, 180)',
    'rgb(53, 112, 127)',
    'rgb(217, 21, 133)',
    'rgb(229, 159, 34)',
}

interface IFreqLabels {
    label: string
    posY: number
}
const EQ_FREQ_LABELS: IFreqLabels[] = [
    {
        label: '50',
        posY: 300,
    },
    {
        label: '100',
        posY: 550,
    },
    {
        label: '500',
        posY: 800,
    },
    {
        label: '1k',
        posY: 1050,
    },
    {
        label: '5k',
        posY: 1300,
    },
    {
        label: '10k',
        posY: 1550,
    },
]

// Constant for calculation Eq dot positions:
const EQ_MIN_HZ = 20
const EQ_MAX_HZ = 20000
const EQ_X_SIZE = 140
const EQ_WIN_X = 450
const EQ_X_OFFSET = 350
const EQ_Y_SIZE = 330
const EQ_Y_OFFSET = 840

// Constants for Delay buttons:
const DEL_VALUES = [10, 1, -1, -10]

class ChanStripFull extends React.PureComponent<
    IChanStripFullProps & IChanStripFullInjectProps & Store
> {
    canvas: HTMLCanvasElement | undefined
    state = {
        dragStartX: 0,
        dragStartY: 0,
        dragCurrentX: 0,
        dragCurrentY: 0,
    }
    constructor(props: any) {
        super(props)
    }

    shouldComponentUpdate(
        nextProps: IChanStripFullInjectProps & IChanStripFullProps
    ) {
        if (nextProps.faderIndex > -1) {
            return true
        } else {
            return false
        }
    }

    handleShowRoutingOptions() {
        this.props.dispatch(storeShowOptions(this.props.faderIndex))
        this.props.dispatch(storeShowChanStripFull(-1))
    }

    handleShowMonitorOptions() {
        this.props.dispatch(storeShowMonitorOptions(this.props.faderIndex))
        this.props.dispatch(storeShowChanStripFull(-1))
    }

    handleClose = () => {
        this.props.dispatch(storeShowChanStripFull(-1))
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
            channel: this.props.faderIndex,
            level: currentValue + addValue,
        })
    }

    handleFx(fxParam: fxParamsList, level: any) {
        window.socketIoClient.emit(SOCKET_SET_FX, {
            fxParam: fxParam,
            channel: this.props.faderIndex,
            level: parseFloat(level),
        })
    }

    handleMonitorLevel(event: any, channelIndex: number) {
        window.socketIoClient.emit(SOCKET_SET_AUX_LEVEL, {
            channel: channelIndex,
            auxIndex: this.props.auxSendIndex,
            level: parseFloat(event),
        })
    }

    handleDragCaptureEq(key: number, event: MouseEvent) {
        let eqFreqKey =
            fxParamsList[
                String(fxParamsList[key]).replace(
                    'EqGain',
                    'EqFreq'
                ) as keyof typeof fxParamsList
            ]

        this.handleFx(eqFreqKey, this.freqPositionToValue(event.clientX))
        this.handleFx(
            key,
            Math.round((100 * (EQ_Y_OFFSET - event.clientY)) / EQ_Y_SIZE) / 100
        )
    }

    valueToFreqPosition(value: number) {
        return (
            EQ_X_SIZE *
                (Math.log2(value * (EQ_MAX_HZ - EQ_MIN_HZ) + EQ_MIN_HZ) - 1) -
            EQ_WIN_X
        )
    }
    freqPositionToValue(position: number) {
        let newFreq = Math.pow(
            2,
            (position + EQ_WIN_X - EQ_X_OFFSET) / EQ_X_SIZE + 1
        )
        return (newFreq - EQ_MIN_HZ) / (EQ_MAX_HZ - EQ_MIN_HZ)
    }

    setRef = (el: HTMLCanvasElement) => {
        this.canvas = el
        this.paintEqGraphics()
    }

    paintEqGraphics() {
        if (!this.canvas) {
            return
        }
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
        const context = this.canvas.getContext('2d', {
            antialias: false,
            stencil: false,
            preserveDrawingBuffer: true,
        }) as CanvasRenderingContext2D

        if (!context) return

        // Draw X-Y axis:
        context.beginPath()
        context.strokeStyle = 'white'
        context.moveTo(175, 0)
        context.lineTo(175, 405)
        context.lineTo(1700, 405)
        context.stroke()
        // Draw zero gain line:
        context.beginPath()
        context.strokeStyle = 'rgba(128, 128, 128, 0.244) 10px'
        context.moveTo(175, 200)
        context.lineTo(1700, 200)
        context.stroke()
        // Freq on zero gain line:
        context.beginPath()
        EQ_FREQ_LABELS.forEach((freq: IFreqLabels) => {
            context.font = '20px Ariel'
            context.strokeStyle = 'white'
            context.strokeText(freq.label, freq.posY, 220)
        })
        // Freq on zero gain line:
        context.strokeText(
            String(
                window.mixerProtocol.channelTypes[0].fromMixer[
                    fxParamsList.EqGain01
                ][0].maxLabel
            ) + ' dB',
            120,
            20
        )
        context.strokeText('0 dB', 120, 210)
        context.strokeText(
            String(
                window.mixerProtocol.channelTypes[0].fromMixer[
                    fxParamsList.EqGain01
                ][0].maxLabel
            ) + ' dB',
            120,
            400
        )
        context.stroke()
    }

    eq() {
        return (
            <div className="eq-full">
                <canvas className="eq-canvas" ref={this.setRef}></canvas>
                <div className="title">EQUALIZER</div>
                <div className="eq-window">
                    {Object.keys(fxParamsList)
                        .filter((fxKey: number | string) => {
                            return String(fxKey).includes('EqGain')
                        })
                        .map((keyName: string) => {
                            let fxKey = keyName as keyof typeof fxParamsList
                            let eqFreqKey =
                                fxParamsList[
                                    fxKey.replace(
                                        'EqGain',
                                        'EqFreq'
                                    ) as keyof typeof fxParamsList
                                ]
                            return (
                                <Draggable
                                    position={{
                                        x: this.valueToFreqPosition(
                                            this.props.fader[
                                                this.props.faderIndex
                                            ][eqFreqKey]?.[0] ?? 0
                                        ),
                                        y:
                                            EQ_Y_SIZE -
                                            (this.props.fader[
                                                this.props.faderIndex
                                            ][fxParamsList[fxKey]]?.[0] ?? 0) *
                                                EQ_Y_SIZE,
                                    }}
                                    grid={[1, 1]}
                                    scale={100}
                                    onDrag={(event) =>
                                        this.handleDragCaptureEq(
                                            fxParamsList[fxKey],
                                            event as MouseEvent
                                        )
                                    }
                                >
                                    <div
                                        className="dot"
                                        style={{
                                            color: String(
                                                EqColors[fxParamsList[fxKey]]
                                            ),
                                        }}
                                    >
                                        O
                                    </div>
                                </Draggable>
                            )
                        })}
                </div>
                <div className="eq-text">
                    {Object.keys(fxParamsList)
                        .filter((fxKey: number | string) => {
                            return String(fxKey).includes('EqGain')
                        })
                        .map((keyName: string) => {
                            let fxKey = keyName as keyof typeof fxParamsList
                            let eqFreqKey =
                                fxParamsList[
                                    fxKey.replace(
                                        'EqGain',
                                        'EqFreq'
                                    ) as keyof typeof fxParamsList
                                ]
                            let eqQKey =
                                fxParamsList[
                                    fxKey.replace(
                                        'EqGain',
                                        'EqQ'
                                    ) as keyof typeof fxParamsList
                                ]
                            return (
                                <div
                                    style={{
                                        color: EqColors[fxParamsList[fxKey]],
                                    }}
                                >
                                    <br />
                                    {'  Gain : '}
                                    {Math.round(
                                        100 *
                                            this.props.fader[
                                                this.props.faderIndex
                                            ][fxParamsList[fxKey]]?.[0] ?? 0
                                    ) / 100}
                                    {'  Freq :'}
                                    {Math.round(
                                        100 *
                                            this.props.fader[
                                                this.props.faderIndex
                                            ][eqFreqKey]?.[0] ?? 0
                                    ) / 100}

                                    {this.qFader(eqQKey)}
                                </div>
                            )
                        })}
                </div>
            </div>
        )
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
                            className="chan-strip-full-fader"
                            thumbClassName="chan-strip-full-thumb"
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
                                +{value}ms
                            </button>
                        )
                    })}
                </div>
            </React.Fragment>
        )
    }
    qFader(fxParam: fxParamsList) {
        let maxLabel: number =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .maxLabel ?? 1
        let minLabel =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .minLabel ?? 0
        let valueLabel =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .valueLabel ?? ''
        return (
            <div className="parameter-text">
                <div className="parameter-mini-text">
                    {Math.round(
                        (maxLabel - minLabel) *
                            this.props.fader[0][fxParam]?.[0] +
                            minLabel
                    )}
                    {valueLabel}
                </div>
                <ReactSlider
                    className="chan-strip-q"
                    thumbClassName="chan-strip-q-thumb"
                    orientation="horisontal"
                    min={0}
                    max={1}
                    step={0.01}
                    value={this.props.fader[0][fxParam]?.[0]}
                    renderThumb={(props: any, state: any) => (
                        <div {...props}>
                            {Math.round(
                                (maxLabel - minLabel) *
                                    parseFloat(state.valueNow) +
                                    minLabel
                            )}
                            {valueLabel}
                        </div>
                    )}
                    onChange={(event: any) => {
                        this.handleFx(fxParam, event)
                    }}
                />
            </div>
        )
    }

    fxParamFader(fxParam: fxParamsList) {
        if (!window.mixerProtocol.channelTypes[0].fromMixer[fxParam]) {
            return
        }
        let maxLabel: number =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam][0]
                .maxLabel ?? 1
        let minLabel =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam][0]
                .minLabel ?? 0
        let valueLabel =
            window.mixerProtocol.channelTypes[0].fromMixer[fxParam]?.[0]
                .valueLabel ?? ''

        return (
            <div className="parameter-text">
                {
                    window.mixerProtocol.channelTypes[0].fromMixer[fxParam][0]
                        .label
                }
                <div className="parameter-mini-text">
                    {maxLabel + valueLabel}
                </div>
                <ReactSlider
                    className="chan-strip-full-fader"
                    thumbClassName="chan-strip-full-thumb"
                    orientation="vertical"
                    invert
                    min={0}
                    max={1}
                    step={0.01}
                    value={
                        this.props.fader[this.props.faderIndex][fxParam]?.[0] ??
                        0
                    }
                    renderThumb={(props: any, state: any) => (
                        <div {...props}>
                            {Math.round(
                                (maxLabel - minLabel) *
                                    parseFloat(state.valueNow) +
                                    minLabel
                            )}
                            {valueLabel}
                        </div>
                    )}
                    onChange={(event: any) => {
                        this.handleFx(fxParam, event)
                    }}
                />
                <div className="parameter-mini-text">
                    {minLabel + valueLabel}
                </div>
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
                    className="chan-strip-full-fader"
                    thumbClassName="chan-strip-full-thumb"
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
                        <React.Fragment>
                            <div className="item">
                                <div className="title">COMPRESSOR</div>
                                <div className="content">
                                    {this.fxParamFader(fxParamsList.CompThrs)}
                                    <p className="zero-comp">______</p>
                                    {this.fxParamFader(fxParamsList.CompRatio)}
                                    <p className="zero-comp">______</p>
                                    {this.gainReduction()}
                                    {this.fxParamFader(fxParamsList.CompMakeUp)}
                                    <p className="zero-comp">______</p>
                                    {this.fxParamFader(fxParamsList.CompAttack)}
                                    <p className="zero-comp">______</p>
                                    {this.fxParamFader(fxParamsList.CompHold)}
                                    <p className="zero-comp">______</p>
                                    {this.fxParamFader(
                                        fxParamsList.CompRelease
                                    )}
                                    <p className="zero-comp">______</p>
                                </div>
                            </div>
                        </React.Fragment>
                        <React.Fragment>
                            <div className="item">
                                <div className="title">DELAY</div>
                                <div className="content">{this.delay()}</div>
                            </div>
                        </React.Fragment>
                        <React.Fragment>
                            <div className="item">
                                <div className="title">
                                    {this.props.label ||
                                        'FADER ' + (this.props.faderIndex + 1)}
                                    {' - MONITOR MIX MINUS'}
                                </div>
                                <div className="content">
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
                                </div>
                            </div>
                        </React.Fragment>
                    </div>
                    <React.Fragment>
                        <hr />
                        <div className="horizontal">{this.eq()}</div>
                    </React.Fragment>
                </div>
            )
        } else {
            return null
        }
    }

    render() {
        if (this.props.faderIndex >= 0) {
            return (
                <div className="chan-strip-full-body">
                    <div className="header">
                        {this.props.label ||
                            'FADER ' + (this.props.faderIndex + 1)}
                        <button
                            className="close"
                            onClick={() => this.handleClose()}
                        >
                            X
                        </button>
                        {window.location.search.includes(
                            'settings=0'
                        ) ? null : (
                            <button
                                className="button half"
                                onClick={() => this.handleShowRoutingOptions()}
                            >
                                Ch.Setup
                            </button>
                        )}
                        {window.location.search.includes(
                            'settings=0'
                        ) ? null : (
                            <button
                                className="button half"
                                onClick={() => this.handleShowMonitorOptions()}
                            >
                                Mon.Setup
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
            return <div className="chan-strip-full-body"></div>
        }
    }
}

const mapStateToProps = (state: any, props: any): IChanStripFullInjectProps => {
    let inject: IChanStripFullInjectProps = {
        label: '',
        selectedProtocol: state.settings[0].mixers[0].mixerProtocol,
        numberOfChannelsInType:
            state.settings[0].mixers[0].numberOfChannelsInType,
        channel: state.channels[0].chConnection[0].channel,
        fader: state.faders[0].fader,
        auxSendIndex: -1,
        offtubeMode: state.settings[0].offtubeMode,
    }
    if (props.faderIndex >= 0) {
        inject = {
            label: state.faders[0].fader[props.faderIndex].label,
            selectedProtocol: state.settings[0].mixers[0].mixerProtocol,
            numberOfChannelsInType:
                state.settings[0].mixers[0].numberOfChannelsInType,
            channel: state.channels[0].chConnection[0].channel,
            fader: state.faders[0].fader,
            auxSendIndex: state.faders[0].fader[props.faderIndex].monitor - 1,
            offtubeMode: state.settings[0].offtubeMode,
        }
    }
    return inject
}

export default connect<any, IChanStripFullInjectProps>(mapStateToProps)(
    ChanStripFull
) as any
