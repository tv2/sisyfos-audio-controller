import * as React from 'react'
//@ts-ignore
import * as ClassNames from 'classnames'
import { connect } from 'react-redux'
import VuMeter from './VuMeter'
import { Store, compose } from 'redux'
import Nouislider from 'nouislider-react'
import '../assets/css/NoUiSlider.css'

//assets:
import '../assets/css/Channel.css'
import {
    SOCKET_TOGGLE_PGM,
    SOCKET_TOGGLE_VO,
    SOCKET_TOGGLE_PST,
    SOCKET_TOGGLE_PFL,
    SOCKET_TOGGLE_MUTE,
    SOCKET_SET_FADERLEVEL,
    SOCKET_TOGGLE_IGNORE,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
import { IFader } from '../../server/reducers/fadersReducer'
import { IChannels } from '../../server/reducers/channelsReducer'
import { ISettings } from '../../server/reducers/settingsReducer'
import { TOGGLE_SHOW_CHAN_STRIP } from '../../server/reducers/settingsActions'
import { withTranslation } from 'react-i18next'

interface IChannelInjectProps {
    t: any
    channels: IChannels
    fader: IFader
    settings: ISettings
    channelType: number
    channelTypeIndex: number
}

interface IChannelProps {
    faderIndex: number
}

class Channel extends React.Component<
    IChannelProps & IChannelInjectProps & Store
> {
    faderIndex: number

    constructor(props: any) {
        super(props)
        this.faderIndex = this.props.faderIndex
    }

    public shouldComponentUpdate(nextProps: IChannelInjectProps) {
        return (
            nextProps.fader.pgmOn != this.props.fader.pgmOn ||
            nextProps.fader.voOn != this.props.fader.voOn ||
            nextProps.fader.pstOn != this.props.fader.pstOn ||
            nextProps.fader.pflOn != this.props.fader.pflOn ||
            nextProps.fader.muteOn != this.props.fader.muteOn ||
            nextProps.fader.ignoreAutomation !=
                this.props.fader.ignoreAutomation ||
            nextProps.fader.showChannel != this.props.fader.showChannel ||
            nextProps.fader.faderLevel != this.props.fader.faderLevel ||
            nextProps.fader.label != this.props.fader.label ||
            nextProps.settings.mixerProtocol !=
                this.props.settings.mixerProtocol ||
            nextProps.settings.showSnaps != this.props.settings.showSnaps ||
            nextProps.settings.showPfl != this.props.settings.showPfl ||
            nextProps.settings.showChanStrip !=
                this.props.settings.showChanStrip
        )
    }

    handlePgm() {
        window.socketIoClient.emit(SOCKET_TOGGLE_PGM, this.faderIndex)
    }

    handleVo() {
        window.socketIoClient.emit(SOCKET_TOGGLE_VO, this.faderIndex)
    }

    handlePst() {
        window.socketIoClient.emit(SOCKET_TOGGLE_PST, this.faderIndex)
    }

    handlePfl() {
        window.socketIoClient.emit(SOCKET_TOGGLE_PFL, this.faderIndex)
        if (
            this.props.settings.chanStripFollowsPFL &&
            !this.props.fader.pflOn &&
            this.props.settings.showChanStrip !== this.faderIndex
        ) {
            this.handleShowChanStrip()
        }
    }

    handleMute() {
        window.socketIoClient.emit(SOCKET_TOGGLE_MUTE, this.faderIndex)
    }

    handleIgnore() {
        window.socketIoClient.emit(SOCKET_TOGGLE_IGNORE, this.faderIndex)
    }

    handleLevel(event: any) {
        window.socketIoClient.emit(SOCKET_SET_FADERLEVEL, {
            faderIndex: this.faderIndex,
            level: parseFloat(event),
        })
    }

    handleShowChanStrip() {
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: this.faderIndex,
        })
    }

    fader() {
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
            />
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
                {this.props.fader.label != ''
                    ? this.props.fader.label
                    : 'CH ' + (this.faderIndex + 1)}
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
        return (
            <button
                className={ClassNames('channel-strip-button', {
                    on: this.props.settings.showChanStrip,
                })}
                onClick={(event) => {
                    this.handleShowChanStrip()
                }}
            >
                {this.props.fader.label != ''
                    ? this.props.fader.label
                    : 'CH ' + (this.faderIndex + 1)}
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
            >
                {this.ignoreButton()}
                {this.muteButton()}
                <br />
                <h4 className="channel-zero-indicator">_____</h4>
                {this.fader()}
                <VuMeter faderIndex={this.faderIndex} />
                <br />
                {this.pgmButton()}
                <br />
                {this.props.settings.automationMode ? (
                    <React.Fragment>
                        {this.voButton()}
                        <br />
                    </React.Fragment>
                ) : null}
                {!this.props.settings.showPfl ? (
                    <React.Fragment>
                        {this.pstButton()}
                        <br />
                    </React.Fragment>
                ) : null}
                {this.props.settings.showPfl ? (
                    <React.Fragment>
                        {this.pflButton()}
                        <br />
                    </React.Fragment>
                ) : null}
                <React.Fragment>
                    {this.chanStripButton()}
                    <br />
                </React.Fragment>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IChannelInjectProps => {
    return {
        t: props.t,
        channels: state.channels[0].channel,
        fader: state.faders[0].fader[props.faderIndex],
        settings: state.settings[0],
        channelType: 0 /* TODO: state.channels[0].channel[props.channelIndex].channelType, */,
        channelTypeIndex:
            props.faderIndex /* TODO: state.channels[0].channel[props.channelIndex].channelTypeIndex, */,
    }
}

export default compose(
    connect<any, IChannelInjectProps, any>(mapStateToProps),
    withTranslation()
)(Channel) as any
