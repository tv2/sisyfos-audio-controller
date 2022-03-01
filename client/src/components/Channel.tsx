import * as React from 'react'
import ClassNames from 'classnames'
import { connect } from 'react-redux'
import VuMeter from './VuMeter'
import { Store, compose } from 'redux'
import Nouislider from 'nouislider-react'
import '../assets/css/NoUiSlider.css'

//assets:
import '../assets/css/Channel.css'
import * as IO from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import { IChannelReference, IFader } from '../../../shared/src/reducers/fadersReducer'
import { ISettings } from '../../../shared/src/reducers/settingsReducer'
import { storeShowChanStrip } from '../../../shared/src/actions/settingsActions'
import { withTranslation } from 'react-i18next'
import { VuLabelConversionType } from '../../shared../../../shared/src/constants/MixerProtocolInterface'
import { getFaderLabel } from '../utils/labels'
import { Conversions } from '../../../shared/src/actions/utils/dbConversion'

interface IChannelInjectProps {
    t: any
    fader: IFader
    settings: ISettings
    channelType: number
    channelTypeIndex: number
    label: string
}

interface IChannelProps {
    faderIndex: number
}

function XOR(a: any, b: any): boolean {
    return (a && !b) || (b && !a)
}

class Channel extends React.Component<
    IChannelProps & IChannelInjectProps & Store
> {
    faderIndex: number

    private _domRef: React.RefObject<HTMLDivElement> = React.createRef()

    constructor(props: any) {
        super(props)
        this.faderIndex = this.props.faderIndex
    }

    public shouldComponentUpdate(nextProps: IChannelInjectProps) {
        return (
            nextProps.channelTypeIndex !== this.props.channelTypeIndex ||
            nextProps.fader.pgmOn != this.props.fader.pgmOn ||
            nextProps.fader.voOn != this.props.fader.voOn ||
            nextProps.fader.pstOn != this.props.fader.pstOn ||
            nextProps.fader.pflOn != this.props.fader.pflOn ||
            nextProps.fader.muteOn != this.props.fader.muteOn ||
            nextProps.fader.slowFadeOn != this.props.fader.slowFadeOn ||
            nextProps.fader.ignoreAutomation !=
                this.props.fader.ignoreAutomation ||
            nextProps.fader.showChannel != this.props.fader.showChannel ||
            nextProps.fader.faderLevel != this.props.fader.faderLevel ||
            nextProps.label != this.props.label ||
            nextProps.settings.mixers[0].mixerProtocol !=
                this.props.settings.mixers[0].mixerProtocol ||
            nextProps.settings.showPfl != this.props.settings.showPfl ||
            nextProps.settings.showChanStrip !=
                this.props.settings.showChanStrip ||
            nextProps.fader.amixOn != this.props.fader.amixOn ||
            XOR(nextProps.fader.capabilities, this.props.fader.capabilities) ||
            XOR(
                nextProps.fader.capabilities?.hasAMix,
                this.props.fader.capabilities?.hasAMix
            )
        )
    }

    componentDidUpdate() {
        // scroll into view if we are now the chan strip
        if (this.props.settings.showChanStrip === this.faderIndex) {
            this._domRef.current?.scrollIntoView()
        }
    }

    handlePgm() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_PGM, this.faderIndex)
    }

    handleVo() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_VO, this.faderIndex)
    }

    handleSlowFade() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_SLOW_FADE, this.faderIndex)
    }

    handlePst() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_PST, this.faderIndex)
    }

    handlePfl() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_PFL, this.faderIndex)
        if (
            this.props.settings.chanStripFollowsPFL &&
            !this.props.fader.pflOn &&
            this.props.settings.showChanStrip !== this.faderIndex
        ) {
            this.handleShowChanStrip()
        }
    }

    handleMute() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_MUTE, this.faderIndex)
    }

    handleAmix() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_AMIX, this.faderIndex)
    }

    handleIgnore() {
        window.socketIoClient.emit(IO.SOCKET_TOGGLE_IGNORE, this.faderIndex)
    }

    handleLevel(event: any) {
        window.socketIoClient.emit(IO.SOCKET_SET_FADERLEVEL, {
            faderIndex: this.faderIndex,
            level: parseFloat(event),
        })
    }

    handleZeroLevel() {
        window.socketIoClient.emit(IO.SOCKET_SET_FADERLEVEL, {
            faderIndex: this.faderIndex,
            level: window.mixerProtocol.meter.zero,
        })
    }

    handleShowChanStrip() {
        this.props.dispatch(storeShowChanStrip(this.faderIndex))
    }

    handleVuMeter() {
        if (
            window.mixerProtocol.protocol === 'CasparCG' ||
            window.mixerProtocol.protocol === 'VMIX'
        ) {
            return (
                <React.Fragment>
                    {!window.location.search.includes('vu=0') &&
                        window.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_VU?.map(
                            (_, i) => (
                                <VuMeter
                                    faderIndex={this.faderIndex}
                                    channel={i}
                                />
                            )
                        )}{' '}
                </React.Fragment>
            )
        } else {
            let assignedChannels: IChannelReference[] = this.props.fader
                .assignedChannels || [{ mixerIndex: 0, channelIndex: 0 }]
            return (
                <React.Fragment>
                    {!window.location.search.includes('vu=0') &&
                        assignedChannels?.map(
                            (assigned: IChannelReference, index) => (
                                <VuMeter
                                    faderIndex={this.faderIndex}
                                    channel={index}
                                />
                            )
                        )}{' '}
                </React.Fragment>
            )
        }
    }

    fader() {
        const showFormat = !!window.mixerProtocol.vuLabelConversionType
        const values = (showFormat && window.mixerProtocol.vuLabelValues) || [
            0.75,
        ]
        let format = {
            to: (f: number) => 0,
            from: (d: number) => 0,
        }
        if (showFormat) {
            if (
                window.mixerProtocol.vuLabelConversionType ===
                VuLabelConversionType.Linear
            ) {
                const range = window.mixerProtocol.fader
                format = {
                    to: (f: number) => {
                        if (!range) return f
                        return (range.max - range.min) * f + range.max
                    },
                    from: (d: number) => {
                        if (!range) return d
                        return (d - range.min) / (range.max - range.min)
                    },
                }
            } else if (
                Conversions[
                    window.mixerProtocol
                        .vuLabelConversionType as keyof typeof Conversions
                ]
            ) {
                format = Conversions[VuLabelConversionType.Decibel]
            }
        }
        return (
            <Nouislider
                className={ClassNames({
                    'channel-volume-fader': true,
                    'noUi-vertical': true,
                })}
                orientation="vertical"
                direction="rtl"
                animate={false}
                range={{ min: 0, max: 1 }}
                start={[this.props.fader.faderLevel]}
                step={0.01}
                connect
                onSlide={(event: any) => {
                    this.handleLevel(event)
                }}
                pips={{
                    mode: 'values',
                    values,
                    format,
                    filter: (v: number) => {
                        if (values.includes(v)) {
                            if (v === 0.75) {
                                return 1 // large
                            } else {
                                return 2 // small
                            }
                        } else {
                            return -1 // no pip
                        }
                    },
                }}
            />
        )
    }

    zeroButton = () => {
        return (
            <button
                className={ClassNames('channel-zero-button', {
                    on: this.props.fader.pgmOn,
                    mute: this.props.fader.muteOn,
                })}
                onDoubleClick={(event) => {
                    event.preventDefault()
                    this.handleZeroLevel()
                }}
            >
                {this.props.label}
            </button>
        )
    }

    pgmButton = () => {
        return (
            <button
                className={ClassNames('channel-pgm-button', {
                    on: this.props.fader.pgmOn,
                    mute: this.props.fader.muteOn,
                })}
                onClick={(event) => {
                    event.preventDefault()
                    this.handlePgm()
                }}
                onTouchEnd={(event) => {
                    event.preventDefault()
                    this.handlePgm()
                }}
            >
                {this.props.label}
            </button>
        )
    }

    voButton = () => {
        return (
            <button
                className={ClassNames('channel-vo-button', {
                    on: this.props.fader.voOn,
                    mute: this.props.fader.muteOn,
                })}
                onClick={(event) => {
                    event.preventDefault()
                    this.handleVo()
                }}
                onTouchEnd={(event) => {
                    event.preventDefault()
                    this.handleVo()
                }}
            >
                {this.props.t('VO')}
            </button>
        )
    }

    slowButton = () => {
        return (
            <button
                className={ClassNames('channel-vo-button', {
                    on: this.props.fader.slowFadeOn,
                    mute: this.props.fader.muteOn,
                })}
                onClick={(event) => {
                    event.preventDefault()
                    this.handleSlowFade()
                }}
                onTouchEnd={(event) => {
                    event.preventDefault()
                    this.handleSlowFade()
                }}
            >
                {this.props.t('SLOW FADE')}
            </button>
        )
    }

    pstButton = () => {
        return (
            <button
                className={ClassNames('channel-pst-button', {
                    on: this.props.fader.pstOn,
                    vo: this.props.fader.pstVoOn,
                })}
                onClick={(event) => {
                    this.handlePst()
                }}
                onTouchEnd={(event) => {
                    event.preventDefault()
                    this.handlePst()
                }}
            >
                {this.props.settings.automationMode ? (
                    <React.Fragment>{this.props.t('CUE NEXT')}</React.Fragment>
                ) : (
                    <React.Fragment>{this.props.t('PST')}</React.Fragment>
                )}
            </button>
        )
    }

    chanStripButton = () => {
        const isActive = this.props.settings.showChanStrip === this.faderIndex
        return (
            <button
                className={ClassNames('channel-strip-button', {
                    on: this.props.settings.showChanStrip,
                    active: isActive,
                })}
                onClick={(event) => {
                    this.handleShowChanStrip()
                }}
            >
                {this.props.label}
            </button>
        )
    }

    pflButton = () => {
        return (
            <button
                className={ClassNames('channel-pst-button', {
                    on: this.props.fader.pflOn,
                })}
                onClick={(event) => {
                    this.handlePfl()
                }}
                onTouchEnd={(event) => {
                    event.preventDefault()
                    this.handlePfl()
                }}
            >
                {this.props.t('PFL')}
            </button>
        )
    }

    ignoreButton = () => {
        return (
            <button
                className={ClassNames('channel-ignore-button', {
                    on: this.props.fader.ignoreAutomation,
                })}
                onClick={(event) => {
                    event.preventDefault()
                    this.handleIgnore()
                }}
                onTouchEnd={(event) => {
                    event.preventDefault()
                    this.handleIgnore()
                }}
            >
                {this.props.fader.ignoreAutomation ? 'MANUAL' : 'AUTO'}
            </button>
        )
    }

    muteButton = () => {
        return (
            window.mixerProtocol.channelTypes[0].toMixer.CHANNEL_MUTE_ON && (
                <button
                    className={ClassNames('channel-mute-button', {
                        on: this.props.fader.muteOn,
                    })}
                    onClick={(event) => {
                        event.preventDefault()
                        this.handleMute()
                    }}
                    onTouchEnd={(event) => {
                        event.preventDefault()
                        this.handleMute()
                    }}
                >
                    MUTE
                </button>
            )
        )
    }

    amixButton = () => {
        return (
            window.mixerProtocol.channelTypes[0].toMixer.CHANNEL_AMIX && (
                <button
                    className={ClassNames('channel-amix-button', {
                        on: this.props.fader.amixOn,
                        disabled:
                            this.props.fader.capabilities &&
                            !this.props.fader.capabilities.hasAMix,
                    })}
                    onClick={(event) => {
                        event.preventDefault()
                        this.handleAmix()
                    }}
                    onTouchEnd={(event) => {
                        event.preventDefault()
                        this.handleAmix()
                    }}
                >
                    AMix
                </button>
            )
        )
    }

    render() {
        return this.props.fader.showChannel === false ? null : (
            <div
                className={ClassNames('channel-body', {
                    'with-pfl': this.props.settings.showPfl,
                    'pgm-on': this.props.fader.pgmOn,
                    'vo-on': this.props.fader.voOn,
                    'mute-on': this.props.fader.muteOn,
                    'ignore-on': this.props.fader.ignoreAutomation,
                    'not-found': this.props.fader.disabled,
                })}
                ref={this._domRef}
            >
                <div className="channel-props">
                    {this.ignoreButton()}
                    {/* TODO - amix and mute cannot be shown at the same time due to css. Depends on protocol right now. */}
                    {this.muteButton()}
                    {this.amixButton()}
                </div>
                <div className="fader">
                    {this.handleVuMeter()}
                    {this.fader()}
                    {this.zeroButton()}
                </div>
                <div className="out-control">
                    {this.pgmButton()}

                    {this.props.settings.automationMode
                        ? this.voButton()
                        : this.slowButton()}
                    <br />
                </div>
                <div className="channel-control">
                    {this.chanStripButton()}
                    {this.props.settings.showPfl
                        ? this.pflButton()
                        : this.pstButton()}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IChannelInjectProps => {
    return {
        t: props.t,
        fader: state.faders[0].fader[props.faderIndex],
        settings: state.settings[0],
        channelType: 0 /* TODO: state.channels[0].channel[props.channelIndex].channelType, */,
        channelTypeIndex:
            props.faderIndex /* TODO: state.channels[0].channel[props.channelIndex].channelTypeIndex, */,
        label: getFaderLabel(props.faderIndex),
    }
}

export default compose(
    connect<any, IChannelInjectProps, any>(mapStateToProps),
    withTranslation()
)(Channel) as any
