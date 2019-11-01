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
import { IMixerProtocolGeneric, ICasparCGMixerGeometry } from '../constants/MixerProtocolInterface';
import { any, number } from 'prop-types';

interface IChannelInjectProps {
    pgmOn: boolean,
    voOn: boolean,
    pstOn: boolean,
    pstVoOn: boolean,
    pflOn: boolean,
    muteOn: boolean,
    channelType: number,
    channelTypeIndex: number,
    showChannel: boolean,
    showChanStrip: boolean,
    faderLevel: number,
    label: string,
    snapOn: boolean[],
    mixerProtocol: string,
    showSnaps: boolean,
    automationMode: boolean,
    offtubeMode: boolean,
    showPfl: boolean
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
        this.mixerProtocol = MixerProtocolPresets[this.props.mixerProtocol] || MixerProtocolPresets.genericMidi;
    }

    public shouldComponentUpdate(nextProps: IChannelInjectProps) {
        let snapChanged: boolean = false;
        nextProps.snapOn.map((snapOn, index) => {
            if (snapOn === this.props.snapOn[index]) {
                snapChanged = true;
            }
        })
        return (
            nextProps.pgmOn != this.props.pgmOn ||
            nextProps.pstOn != this.props.pstOn ||
            nextProps.pflOn != this.props.pflOn ||
            nextProps.showChannel != this.props.showChannel ||
            nextProps.faderLevel != this.props.faderLevel ||
            nextProps.label != this.props.label ||
            nextProps.mixerProtocol != this.props.mixerProtocol ||
            nextProps.showSnaps != this.props.showSnaps ||
            nextProps.showPfl != this.props.showPfl ||
            snapChanged
        )
    }

    handlePgm() {
        this.props.dispatch({
            type:'TOGGLE_PGM',
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateOutLevel(this.channelIndex);
        if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handleVo() {
        this.props.dispatch({
            type:'TOGGLE_VO',
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateOutLevel(this.channelIndex);
        if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handlePst() {        
        this.props.dispatch({
            type:'TOGGLE_PST',
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateNextAux(this.channelIndex);
    }

    handlePfl() {
        this.props.dispatch({
            type:'TOGGLE_PFL',
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updatePflState(this.channelIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handleMute() {
        this.props.dispatch({
            type:'TOGGLE_MUTE',
            channel: this.channelIndex
        });
        window.mixerGenericConnection.updateMuteState(this.channelIndex);
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
        }
    }

    handleLevel(event: any) {
        this.props.dispatch({
            type:'SET_FADER_LEVEL',
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
            type:'SET_SNAP',
            channel: this.channelIndex,
            snapIndex: snapIndex
        });
    }

    handleShowOptions() {
        this.props.dispatch({
            type: 'TOGGLE_SHOW_OPTION',
            channel: this.channelIndex
        });
    }

    handleShowChanStrip() {
        this.props.dispatch({
            type: 'TOGGLE_SHOW_CHAN_STRIP',
            channel: this.channelIndex
        });
    }

    fader() {
        let thumb = 'channel-volume-thumb' + (this.props.pgmOn ? '-color-pgm' : '') +  (this.props.voOn ? '-color-vo' : '')
        if (this.props.muteOn) {
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
                value= {this.props.faderLevel}
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
                    'on': this.props.pgmOn,
                    'mute': this.props.muteOn
                })}
                onClick={event => {
                    this.handlePgm();
                }}
            >
                {this.props.label != "" ? this.props.label : ("CH " + (this.channelIndex + 1)) }
            </button>
        )
    }


    voButton = () => {
        return (

            <button
                className={ClassNames("channel-vo-button", {
                    'on': this.props.voOn,
                    'mute': this.props.muteOn,
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
                    'on': this.props.pstOn,
                    'vo': this.props.pstVoOn
                })}
                onClick={event => {
                    this.handlePst();
                }}
            >
            {this.props.automationMode ? 
                <React.Fragment>
                    NEXT
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
                    'on': this.props.showChanStrip
                })}
                onClick={event => {
                    this.handleShowChanStrip();
                }}
            >
            {this.props.label != "" ? this.props.label : (this.mixerProtocol.channelTypes[this.props.channelType].channelTypeName + " " + (this.props.channelTypeIndex + 1)) }
            </button>
        )
    }

    pflButton = () => {
        return (
            <button
                className={ClassNames("channel-pfl-button", {
                    'on': this.props.pflOn
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
                    'on': this.props.muteOn
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
        if (this.props.showSnaps) {
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
        this.props.showChannel === false ?
            null
            :
            <div
                className={
                    ClassNames("channel-body", {
                    "with-snaps": this.props.showSnaps,
                    "with-pfl": this.props.showPfl,
                    "mute-on": this.props.muteOn
                })}>
                {this.muteButton()}
                <br/>
                <h4 className="channel-zero-indicator">_____</h4>
                {this.fader()}
                <VuMeter channelIndex = {this.channelIndex}/>
                <br/>
                {this.pgmButton()}
                <br/>
                {this.props.automationMode ?
                    <React.Fragment>
                        {this.voButton()}
                        <br />
                    </React.Fragment>
                    : null
                }
                {this.props.offtubeMode ?
                    null :
                    <React.Fragment>
                        {this.pstButton()}
                        <br/>
                    </React.Fragment>
                }
                <br />
                {this.props.showPfl ?
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
                <div className="channel-name">
                </div>
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
        pgmOn: state.faders[0].fader[props.channelIndex].pgmOn,
        voOn: state.faders[0].fader[props.channelIndex].voOn,
        pstOn: state.faders[0].fader[props.channelIndex].pstOn,
        pstVoOn: state.faders[0].fader[props.channelIndex].pstVoOn,
        pflOn: state.faders[0].fader[props.channelIndex].pflOn,
        muteOn: state.faders[0].fader[props.channelIndex].muteOn,
        showChannel: state.faders[0].fader[props.channelIndex].showChannel,
        faderLevel: state.faders[0].fader[props.channelIndex].faderLevel,
        channelType: 0, /*state.channels[0].channel[props.channelIndex].channelType, */
        channelTypeIndex: props.channelIndex ,/* state.channels[0].channel[props.channelIndex].channelTypeIndex, */
        label: state.faders[0].fader[props.channelIndex].label,
        snapOn: state.faders[0].fader[props.channelIndex].snapOn.map((item: number) => {return item}),
        mixerProtocol: state.settings[0].mixerProtocol,
        automationMode: state.settings[0].automationMode,
        offtubeMode: state.settings[0].offtubeMode,
        showSnaps: state.settings[0].showSnaps,
        showChanStrip: state.settings[0].showChanStrip,
        showPfl: state.settings[0].showPfl
    }
}

export default connect<any, IChannelInjectProps, any>(mapStateToProps)(Channel) as any;
