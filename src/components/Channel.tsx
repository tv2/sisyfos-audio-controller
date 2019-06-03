import React, { PureComponent } from 'react';
import { connect } from "react-redux";
import VuMeter from './VuMeter';

//assets:
import '../assets/css/Channel.css';
import { IMixerProtocol, MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';


class Channel extends PureComponent<any, any> {
    mixerProtocol: IMixerProtocol;
    channelIndex: number;
    mixerConnection: any;

    constructor(props: any) {
        super(props);
        this.channelIndex = this.props.channelIndex;
        this.mixerConnection = this.props.mixerConnection;
        this.state = {
        };
        this.mixerProtocol = MixerProtocolPresets[this.props.mixerProtocol] || MixerProtocolPresets.genericMidi;

        this.pgmButton = this.pgmButton.bind(this);
        this.pstButton = this.pstButton.bind(this);
        this.pflButton = this.pflButton.bind(this);
        this.snapButton = this.snapButton.bind(this);
    }

    handlePgm() {
        this.props.dispatch({
            type:'TOGGLE_PGM',
            channel: this.channelIndex
        });
        this.mixerConnection.updateOutLevel(this.channelIndex);
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
        this.mixerConnection.updatePflState(this.channelIndex);
    }

    handleLevel(event: any) {
        this.props.dispatch({
            type:'SET_FADER_LEVEL',
            channel: this.channelIndex,
            level: event.target.value
        });
        this.mixerConnection.updateOutLevel(this.channelIndex);
        this.props.huiRemoteConnection.updateRemoteFaderLevel(this.channelIndex, event.target.value)
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
                style= {
                    Object.assign(
                        this.props.showSnaps
                        ?   {
                                width: "220px",
                                marginTop: "140px",
                                transform: "translate(-40px, 0) rotate(270deg) "
                            }
                        :   {
                                width: "460px",
                                marginTop: "260px",
                                transform: "translate(-160px, 0) rotate(270deg) "
                            }
                    )
                }
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

    pgmButton() {
        return (

            <button
                className="channel-pgm-button"
                style={
                    Object.assign(
                        this.props.pgmOn
                        ? {backgroundColor: "red"}
                        : {backgroundColor: "rgb(66, 27, 27)"},
                        this.props.showSnaps
                        ?   {
                                height: "40px",
                                marginTop: "130px"
                            }
                        :   {
                                height: "90px",
                                marginTop: "260px"
                            }
                    )
                }
                onClick={event => {
                    this.handlePgm();
                }}
            >
                {this.props.label != "" ? this.props.label : ("CH " + (this.channelIndex + 1)) }
            </button>
        )
    }

    pstButton() {
        return (
            <button
                className="channel-pst-button"
                style={
                    Object.assign(
                        this.props.pstOn
                        ? {backgroundColor: "green"}
                        : {backgroundColor: "rgb(59, 73, 59)"},
                        this.props.showSnaps
                        ?   {height: "40px"}
                        :   {height: "90px"}
                    )
                }
                onClick={event => {
                    this.handlePst();
                }}
            >PST</button>
        )
    }


    pflButton() {
        return (
            <button
                className="channel-pfl-button"
                style={
                    Object.assign(
                        this.props.pflOn
                        ? {backgroundColor: "rgb(17, 0, 255)"}
                        : {backgroundColor: "rgb(9, 0, 59)"},
                        this.props.showSnaps
                        ?   {height: "40px"}
                        :   {height: "90px"}
                    )
                }
                onClick={event => {
                    this.handlePfl();
                }}
            >PFL</button>
        )
    }

    snapButton(snapIndex: number) {
        if (this.props.showSnaps) {
            return (
                <div key={snapIndex} className="channel-snap-line">
                    <button
                        className="channel-snap-button"
                        style={this.props.snapOn[snapIndex]
                            ? {backgroundColor: "rgb(183, 182, 20)"}
                            : {backgroundColor: "rgb(89, 83, 10)"}
                        }
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
            <div className="channel-body">
                {this.fader()}
                <VuMeter channelIndex = {this.channelIndex}/>
                <br/>
                {this.pgmButton()}
                <br/>
                {this.pstButton()}
                <br/>
                {this.pflButton()}
                <br/>
                <div className="channel-name">
                    {this.props.label != "" ? this.props.label : ("CH " + (this.channelIndex + 1)) }
                </div>
                <div className="channel-gain-label">
                    GAIN: {parseInt(this.props.outputLevel)*100/100}
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

const mapStateToProps = (state: any, props: any) => {
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
        showSnaps: state.settings[0].showSnaps
    }
}

export default connect<any, any>(mapStateToProps)(Channel) as any;
