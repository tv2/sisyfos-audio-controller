import * as React from 'react';
//@ts-ignore
import * as ClassNames from 'classnames';
import { connect } from "react-redux";
import VuMeter from './VuMeter';
import { Store } from 'redux';

//assets:
import '../assets/css/Channel.css';
import { IMixerProtocol, MixerProtocolPresets, IMixerProtocolGeneric } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';

interface IChannelInjectProps {
    pgmOn: boolean,
    pstOn: boolean,
    pflOn: boolean,
    showChannel: boolean,
    faderLevel: number,
    outputLevel: number,
    label: string,
    snapOn: boolean[],
    mixerProtocol: string,
    showSnaps: boolean
    showPfl: boolean
}

interface IChannelProps {
    channelIndex: number
}


class Channel extends React.PureComponent<IChannelProps & IChannelInjectProps & Store> {
    mixerProtocol: IMixerProtocolGeneric;
    channelIndex: number;

    constructor(props: any) {
        super(props);
        this.channelIndex = this.props.channelIndex;
        this.mixerProtocol = MixerProtocolPresets[this.props.mixerProtocol] || MixerProtocolPresets.genericMidi;
    }

    handlePgm() {
        this.props.dispatch({
            type:'TOGGLE_PGM',
            channel: this.channelIndex
        });
        window.mixerConnection.updateOutLevel(this.channelIndex);
        window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
    }

    handlePst() {
        this.props.dispatch({
            type:'TOGGLE_PST',
            channel: this.channelIndex
        });
    }

    handlePfl() {
        this.props.dispatch({
            type:'TOGGLE_PFL',
            channel: this.channelIndex
        });
        window.mixerConnection.updatePflState(this.channelIndex);
        window.huiRemoteConnection.updateRemotePgmPstPfl(this.channelIndex);
    }

    handleLevel(event: any) {
        this.props.dispatch({
            type:'SET_FADER_LEVEL',
            channel: this.channelIndex,
            level: parseFloat(event.target.value)
        });
        window.mixerConnection.updateOutLevel(this.channelIndex);
        window.huiRemoteConnection.updateRemoteFaderState(this.channelIndex, event.target.value)
    }


    handleSnap(snapIndex: number) {
        this.props.dispatch({
            type:'SET_SNAP',
            channel: this.channelIndex,
            snapIndex: snapIndex
        });
    }

    fader() {
        return (
            <input className="channel-volume-slider"
                id="typeinp"
                type="range"
                min={this.mixerProtocol.fader.min}
                max={this.mixerProtocol.fader.max}
                step={this.mixerProtocol.fader.step}
                value= {this.props.faderLevel}
                onChange={event => {
                    event.preventDefault();
                    this.handleLevel(event);
                }}
            />
        )
    }

    pgmButton = () => {
        return (

            <button
                className={ClassNames("channel-pgm-button", {
                    'on': this.props.pgmOn
                })}
                onClick={event => {
                    this.handlePgm();
                }}
            >
                {this.props.label != "" ? this.props.label : ("CH " + (this.channelIndex + 1)) }
            </button>
        )
    }

    pstButton = () => {
        return (
            <button
                className={ClassNames("channel-pst-button", {
                    'on': this.props.pstOn
                })}
                onClick={event => {
                    this.handlePst();
                }}
            >PST</button>
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
            <div></div>
            :
            <div className={ClassNames("channel-body", {
                "with-snaps": this.props.showSnaps,
                "with-pfl": this.props.showPfl
            })}>
                {this.fader()}
                <VuMeter channelIndex = {this.channelIndex}/>
                <br/>
                {this.pgmButton()}
                <br/>
                {this.pstButton()}
                <br/>
                {this.props.showPfl ?
                    <React.Fragment>
                        {this.pflButton()}
                        <br />
                    </React.Fragment>
                    : null
                }
                <div className="channel-name">
                    {this.props.label != "" ? this.props.label : ("CH " + (this.channelIndex + 1)) }
                </div>
                <div className="channel-gain-label">
                    GAIN: {Math.round(this.props.outputLevel * 100) / 100}
                    <br/>
                    TIME: {Date.now()}
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
        pgmOn: state.channels[0].channel[props.channelIndex].pgmOn,
        pstOn: state.channels[0].channel[props.channelIndex].pstOn,
        pflOn: state.channels[0].channel[props.channelIndex].pflOn,
        showChannel: state.channels[0].channel[props.channelIndex].showChannel,
        faderLevel: state.channels[0].channel[props.channelIndex].faderLevel,
        outputLevel: state.channels[0].channel[props.channelIndex].outputLevel,
        label: state.channels[0].channel[props.channelIndex].label,
        snapOn: state.channels[0].channel[props.channelIndex].snapOn.map((item: number) => {return item}),
        mixerProtocol: state.settings[0].mixerProtocol,
        showSnaps: state.settings[0].showSnaps,
        showPfl: state.settings[0].showPfl
    }
}

export default connect<any, IChannelInjectProps>(mapStateToProps)(Channel) as any;
