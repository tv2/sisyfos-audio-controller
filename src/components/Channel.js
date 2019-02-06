import React, { PureComponent } from 'react';
import { connect } from "react-redux";

import VuMeter from './VuMeter';
//assets:
import '../assets/css/Channel.css';
//Utils:
import * as DEFAULTS from '../utils/DEFAULTS';


class Channel extends PureComponent {
    constructor(props) {
        super(props);
        this.channelIndex = this.props.channelIndex;
        this.oscServer = this.props.oscServer;
        this.state = {
        };

        this.pgmButton = this.pgmButton.bind(this);
        this.pstButton = this.pstButton.bind(this);
        this.snapButton = this.snapButton.bind(this);
        this.renderLabel = this.renderLabel.bind(this);
    }

    handlePgm() {
        this.props.dispatch({
            type:'SET_PGM',
            channel: this.channelIndex
        });
        this.oscServer.updateOscLevel(this.channelIndex);
    }

    handlePst() {
        this.props.dispatch({
            type:'SET_PST',
            channel: this.channelIndex
        });
    }

    handleLevel(event) {
        this.props.dispatch({
            type:'SET_FADER_LEVEL',
            channel: this.channelIndex,
            level: event.target.value
        });
        this.oscServer.updateOscLevel(this.channelIndex);
    }


    handleSnap(snapIndex) {
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
                        this.props.store.settings[0].showSnaps
                        ?   {width: "220px"}
                        :   {width: "460px"},
                        this.props.store.settings[0].showSnaps
                        ?   {marginTop: "140px"}
                        :   {marginTop: "260px"},
                        this.props.store.settings[0].showSnaps
                        ?   {transform: "translate(-40px, 0) rotate(270deg) "}
                        :   {transform: "translate(-160px, 0) rotate(270deg) "}
                    )
                }
                id="typeinp"
                type="range"
                min={DEFAULTS.MIN_FADER}
                max={DEFAULTS.MAX_FADER}
                step={DEFAULTS.STEP_FADER}
                value= {this.props.store.channels[0].channel[this.channelIndex].faderLevel}
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
                        this.props.store.channels[0].channel[this.channelIndex].pgmOn
                        ? {backgroundColor: "green"}
                        : {backgroundColor: "rgb(59, 73, 59)"},
                        this.props.store.settings[0].showSnaps
                        ?   {height: "40px"}
                        :   {height: "90px"},
                        this.props.store.settings[0].showSnaps
                        ?   {marginTop: "130px"}
                        :   {marginTop: "260px"}
                    )
                }
                onClick={event => {
                    this.handlePgm(event);
                }}
            >PGM</button>
        )
    }

    pstButton() {
        return (
            <button
                className="channel-pst-button"
                style={
                    Object.assign(
                        this.props.store.channels[0].channel[this.channelIndex].pstOn
                        ? {backgroundColor: "red"}
                        : {backgroundColor: "rgb(66, 27, 27)"},
                        this.props.store.settings[0].showSnaps
                        ?   {height: "40px"}
                        :   {height: "90px"}
                    )
                }
                onClick={event => {
                    this.handlePst(event);
                }}
            >PST</button>
        )
    }

    snapButton(snapIndex) {
        if (this.props.store.settings[0].showSnaps) {
            return (
                <div key={snapIndex} className="channel-snap-line">
                    <button
                        className="channel-snap-button"
                        style={this.props.store.channels[0].channel[this.channelIndex].snapOn[snapIndex]
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

    renderLabel() {
        if (this.props.store.channels[0].channel[this.channelIndex].label === "") {
            return (
                <div className="channel-name">
            CH {this.channelIndex + 1}
        </div>
            )
        }
        return (
        <div className="channel-name">
            {this.props.store.channels[0].channel[this.channelIndex].label}
        </div>
        )
    }

    render() {
        return (
        <div className="channel-body">
            {this.fader()}
            <VuMeter channelIndex = {this.channelIndex}/>
            <br/>
            {this.pgmButton()}
            <br/>
            {this.pstButton()}
            <br/>
            {this.renderLabel()}
            <div className="channel-gain-label">
                GAIN: {parseInt(this.props.store.channels[0].channel[this.channelIndex].outputLevel*100)/100}
            </div>
            <div className="channel-snap-body">
                {this.props.store.channels[0].channel[this.channelIndex].snapOn
                    .map((none, index) => {
                        return this.snapButton(index)
                    })
                }
            </div>
        </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(Channel);
