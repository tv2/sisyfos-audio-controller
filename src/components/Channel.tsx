import * as React from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';
import { connect } from "react-redux";
import VuMeter from './VuMeter';
import { Store } from 'redux';
import ReactSlider from 'react-slider'


//assets:
import '../assets/css/Channel.css';
import { SOCKET_TOGGLE_PGM, SOCKET_TOGGLE_VO, SOCKET_TOGGLE_PST, SOCKET_TOGGLE_PFL, SOCKET_TOGGLE_MUTE, SOCKET_SET_FADERLEVEL, SOCKET_TOGGLE_SHOW_CH_STRIP } from '../../server/constants/SOCKET_IO_DISPATCHERS'
import { 
    TOGGLE_SNAP
} from '../../server/reducers/faderActions'
import { IFader } from '../../server/reducers/fadersReducer';
import { IChannels } from '../../server/reducers/channelsReducer';
import { ISettings } from '../../server/reducers/settingsReducer';
import { TOGGLE_SHOW_CHAN_STRIP } from '../../server/reducers/settingsActions';

interface IChannelInjectProps {
    channels: IChannels 
    fader: IFader
    settings: ISettings
    channelType: number,
    channelTypeIndex: number,
    snapOn: boolean[],
}

interface IChannelProps {
    faderIndex: number
}


class Channel extends React.Component<IChannelProps & IChannelInjectProps & Store> {
    faderIndex: number;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
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
        window.socketIoClient.emit( SOCKET_TOGGLE_PGM, this.faderIndex)
    }

    handleVo() {
        window.socketIoClient.emit( SOCKET_TOGGLE_VO, this.faderIndex)
    }

    handlePst() {
        window.socketIoClient.emit( SOCKET_TOGGLE_PST, this.faderIndex)
    }

    handlePfl() {
        window.socketIoClient.emit( SOCKET_TOGGLE_PFL, this.faderIndex)

        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemotePgmPstPfl(this.faderIndex);
        }
    }

    handleMute() {
        window.socketIoClient.emit( SOCKET_TOGGLE_MUTE, this.faderIndex)

        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemotePgmPstPfl(this.faderIndex);
        }
    }

    handleLevel(event: any) {
        window.socketIoClient.emit( SOCKET_SET_FADERLEVEL, 
            {
                'faderIndex' :this.faderIndex,
                'level': parseFloat(event)
            })

        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(this.faderIndex, event)
        }
    }


    handleShowChanStrip() {
        this.props.dispatch({
            type: TOGGLE_SHOW_CHAN_STRIP,
            channel: this.faderIndex
        });
    }


    handleSnap(snapIndex: number) {
        this.props.dispatch({
            type: TOGGLE_SNAP,
            channel: this.faderIndex,
            snapIndex: snapIndex
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
                {this.props.fader.label != "" ? this.props.fader.label : ("CH " + (this.faderIndex + 1)) }
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
            {this.props.fader.label != "" ? this.props.fader.label : (window.mixerProtocol.channelTypes[this.props.channelType].channelTypeName + " " + (this.props.channelTypeIndex + 1)) }
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
                <VuMeter faderIndex = {this.faderIndex}/>
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
        fader: state.faders[0].fader[props.faderIndex],
        settings: state.settings[0],
        channelType: 0, /* TODO: state.channels[0].channel[props.channelIndex].channelType, */
        channelTypeIndex: props.faderIndex ,/* TODO: state.channels[0].channel[props.channelIndex].channelTypeIndex, */
        snapOn: state.faders[0].fader[props.faderIndex].snapOn.map((item: number) => {return item}),
    }
}

export default connect<any, IChannelInjectProps, any>(mapStateToProps)(Channel) as any;
