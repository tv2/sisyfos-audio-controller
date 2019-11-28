import * as React from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';
import { connect } from "react-redux";
import VuMeter from './VuMeter';
import { Store } from 'redux';
import ReactSlider from 'react-slider'


//assets:
import '../assets/css/Channel.css';
import { MixerProtocolPresets} from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
import { 
    SET_FADER_LEVEL, 
    TOGGLE_PGM,
    TOGGLE_VO,
    TOGGLE_PST,
    TOGGLE_PFL,
    TOGGLE_MUTE,
    TOGGLE_SNAP
} from '../reducers/faderActions'
import { 
    TOGGLE_SHOW_CHAN_STRIP,
    TOGGLE_SHOW_OPTION
} from '../reducers/settingsActions'
import { IFader } from '../reducers/fadersReducer';
import { IChannels } from '../reducers/channelsReducer';
import { ISettings } from '../reducers/settingsReducer';

interface IChannelInjectProps {
    channels: IChannels 
    fader: IFader
    settings: ISettings
    channelType: number,
    channelTypeIndex: number,
    snapOn: boolean[],
}

interface IChannelProps {
    channelIndex: number
}


class Channel extends React.Component<IChannelProps & IChannelInjectProps & Store> {
    mixerProtocol: IMixerProtocolGeneric;
    channelIndex: number;

    constructor(props: any) {
        super(props);
        this.channelIndex = this.props.channelIndex;
        this.mixerProtocol = MixerProtocolPresets[this.props.settings.mixerProtocol] || MixerProtocolPresets.genericMidi;
    }

    public shouldComponentUpdate(nextProps: IChannelInjectProps) {
        let snapChanged: boolean = false;
        nextProps.snapOn.map((snapOn, index) => {
            if (snapOn === this.props.snapOn[index]) {
                snapChanged = true;
            }
        })
        return (
            nextProps.fader.pgmOn != this.props.fader.pgmOn ||
            nextProps.fader.pstOn != this.props.fader.pstOn ||
            nextProps.fader.pflOn != this.props.fader.pflOn ||
            nextProps.fader.showChannel != this.props.fader.showChannel ||
            nextProps.fader.faderLevel != this.props.fader.faderLevel ||
            nextProps.fader.label != this.props.fader.label ||
            nextProps.settings.mixerProtocol != this.props.settings.mixerProtocol ||
            nextProps.settings.showSnaps != this.props.settings.showSnaps ||
            nextProps.settings.showPfl != this.props.settings.showPfl ||
            nextProps.settings.showChanStrip != this.props.settings.showChanStrip ||
            snapChanged
        )
    }

    handlePgm() {
        window.mixerGenericConnection.checkForAutoResetThreshold(this.channelIndex)
        this.props.dispatch({
            type: TOGGLE_PGM,
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateOutLevel(this.channelIndex);
        if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handleVo() {
        window.mixerGenericConnection.checkForAutoResetThreshold(this.channelIndex)
        this.props.dispatch({
            type: TOGGLE_VO,
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateOutLevel(this.channelIndex);
        if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handlePst() {        
        this.props.dispatch({
            type: TOGGLE_PST,
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateNextAux(this.channelIndex);
    }

    handlePfl() {
        this.props.dispatch({
            type: TOGGLE_PFL,
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updatePflState(this.channelIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handleMute() {
        this.props.dispatch({
            type: TOGGLE_MUTE,
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateMuteState(this.channelIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handleLevel(event: any) {
        this.props.dispatch({
            type: SET_FADER_LEVEL,
            channel: this.channelIndex,
            level: parseFloat(event)
        });
        window.mixerGenericConnection.updateOutLevel(this.channelIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(this.channelIndex, event)
        }
    }


    handleSnap(snapIndex: number) {
        this.props.dispatch({
            type: TOGGLE_SNAP,
            channel: this.channelIndex,
            snapIndex: snapIndex
        });
    }

    handleShowOptions() {
        this.props.dispatch({
            type: TOGGLE_SHOW_OPTION,
            channel: this.channelIndex
        });
    }

    handleShowChanStrip() {
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: this.channelIndex
        });
    }

    fader() {
        let thumb = 'channel-volume-thumb' + (this.props.fader.pgmOn ? '-color-pgm' : '') +  (this.props.fader.voOn ? '-color-vo' : '')
        if (this.props.fader.muteOn) {
            thumb = 'channel-volume-thumb-color-mute'
        }
        return (
            <ReactSlider 
                className="channel-volume-fader"
                thumbClassName = { thumb }
                orientation="vertical"
                invert
                min={0}
                max={1}
                step={0.01}
                value= {this.props.fader.faderLevel}
                onChange={(event: any) => {
                    this.handleLevel(event);
                }}
            />
        )
    }


    pgmButton = () => {
        return (

            <button
                className={ClassNames("channel-pgm-button", {
                    'on': this.props.fader.pgmOn,
                    'mute': this.props.fader.muteOn
                })}
                onClick={event => {
                    this.handlePgm();
                }}
            >
                {this.props.fader.label != "" ? this.props.fader.label : ("CH " + (this.channelIndex + 1)) }
            </button>
        )
    }


    voButton = () => {
        return (

            <button
                className={ClassNames("channel-vo-button", {
                    'on': this.props.fader.voOn,
                    'mute': this.props.fader.muteOn,
                })}
                onClick={event => {
                    this.handleVo();
                }}
            >
                VO
            </button>
        )
    }

    pstButton = () => {
        return (
            <button
                className={ClassNames("channel-pst-button", {
                    'on': this.props.fader.pstOn,
                    'vo': this.props.fader.pstVoOn
                })}
                onClick={event => {
                    this.handlePst();
                }}
            >
            {this.props.settings.automationMode ? 
                <React.Fragment>
                    CUE NEXT
                </React.Fragment>
                :
                <React.Fragment>
                    PST
                </React.Fragment>
            }
            </button>
        )
    }

    chanStripButton = () => {
        return (
            <button
                className={ClassNames("channel-strip-button", {
                    'on': this.props.settings.showChanStrip
                })}
                onClick={event => {
                    this.handleShowChanStrip();
                }}
            >
            {this.props.fader.label != "" ? this.props.fader.label : (this.mixerProtocol.channelTypes[this.props.channelType].channelTypeName + " " + (this.props.channelTypeIndex + 1)) }
            </button>
        )
    }

    pflButton = () => {
        return (
            <button
                className={ClassNames("channel-pfl-button", {
                    'on': this.props.fader.pflOn
                })}
                onClick={event => {
                    this.handlePfl();
                }}
            >PFL</button>
        )
    }

    muteButton = () => {
        return (
            <button
                className={ClassNames("channel-mute-button", {
                    'on': this.props.fader.muteOn
                })}
                onClick={event => {
                    this.handleMute();
                }}
            >
            MUTE
            </button>
        )
    }


    snapButton = (snapIndex: number) => {
        if (this.props.settings.showSnaps) {
            return (
                <div key={snapIndex} className="channel-snap-line">
                    <button
                        className={ClassNames("channel-snap-button", {
                            'on': this.props.snapOn[snapIndex]
                        })}
                        onClick={event => {
                            this.handleSnap(snapIndex);
                        }}
                    >{snapIndex + 1 }</button>
                    <br/>
                </div>
            )
        } else {
            return("")
        }
    }

    render() {
        return (
        this.props.fader.showChannel === false ?
            null
            :
            <div
                className={
                    ClassNames("channel-body", {
                    "with-snaps": this.props.settings.showSnaps,
                    "with-pfl": this.props.settings.showPfl,
                    "mute-on": this.props.fader.muteOn
                })}>
                {this.muteButton()}
                <br/>
                <h4 className="channel-zero-indicator">_____</h4>
                {this.fader()}
                <VuMeter channelIndex = {this.channelIndex}/>
                <br/>
                {this.pgmButton()}
                <br/>
                {this.props.settings.automationMode ?
                    <React.Fragment>
                        {this.voButton()}
                        <br />
                    </React.Fragment>
                    : null
                }
                <React.Fragment>
                    {this.pstButton()}
                    <br/>
                </React.Fragment>
                {this.props.settings.showPfl ?
                    <React.Fragment>
                        {this.pflButton()}
                        <br />
                    </React.Fragment>
                    : null
                }
                <React.Fragment>
                    {this.chanStripButton()}
                    <br/>
                </React.Fragment>
                <div className="channel-snap-body">
                    {this.props.snapOn
                        .map((none: any, index: number) => {
                            return this.snapButton(index)
                        })
                    }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IChannelInjectProps => {
    return {
        channels: state.channels[0].channel,
        fader: state.faders[0].fader[props.channelIndex],
        settings: state.settings[0],
        channelType: 0, /*state.channels[0].channel[props.channelIndex].channelType, */
        channelTypeIndex: props.channelIndex ,/* state.channels[0].channel[props.channelIndex].channelTypeIndex, */
        snapOn: state.faders[0].fader[props.channelIndex].snapOn.map((item: number) => {return item}),
    }
}

export default connect<any, IChannelInjectProps, any>(mapStateToProps)(Channel) as any;
