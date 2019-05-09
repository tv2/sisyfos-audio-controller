import React, { PureComponent } from 'react';
import { connect } from "react-redux";

import GrpVuMeter from './GrpVuMeter';
//assets:
import '../assets/css/GrpFader.css';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';

class GrpFader extends PureComponent {
    constructor(props) {
        super(props);
        this.faderIndex = this.props.faderIndex;
        this.mixerConnection = this.props.mixerConnection;
        this.state = {
        };
        this.mixerProtocol = MixerProtocolPresets[this.props.mixerProtocol] || MixerProtocolPresets.genericMidi;

        this.pgmButton = this.pgmButton.bind(this);
        this.pstButton = this.pstButton.bind(this);

    }

    handlePgm() {
        this.props.dispatch({
            type:'TOGGLE_GRP_PGM',
            channel: this.faderIndex
        });
        this.mixerConnection.updateGrpOutLevel(this.faderIndex);
    }

    handlePst() {
        this.props.dispatch({
            type:'TOGGLE_GRP_PST',
            channel: this.faderIndex
        });
    }

    handleLevel(event) {
        this.props.dispatch({
            type:'SET_GRP_FADER_LEVEL',
            channel: this.faderIndex,
            level: event.target.value
        });
        this.mixerConnection.updateGrpOutLevel(this.faderIndex);
    }

    fader() {
        return (
            <input className="grpFader-volume-slider"
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
                className="grpFader-pgm-button"
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
                    this.handlePgm(event);
                }}
            >
                {this.props.label != "" ? this.props.label : ("GRP " + (this.faderIndex + 1)) }
            </button>
        )
    }

    pstButton() {
        return (
            <button
                className="grpFader-pst-button"
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
                    this.handlePst(event);
                }}
            >PST</button>
        )
    }

    render() {
        return (
        this.props.showChannel === false ?
            <div></div>
            :
            <div className="grpFader-body">
                {this.fader()}
                <GrpVuMeter faderIndex = {this.faderIndex}/>
                <br/>
                {this.pgmButton()}
                <br/>
                {this.pstButton()}
                <br/>
                <div className="grpFader-name">
                    {this.props.label != "" ? this.props.label : ("GRP " + (this.faderIndex + 1)) }
                </div>
                <div className="grpFader-gain-label">
                    GAIN: {parseInt(this.props.faderLevel*100)/100}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    return {
        pgmOn: state.channels[0].grpFader[props.faderIndex].pgmOn,
        pstOn: state.channels[0].grpFader[props.faderIndex].pstOn,
        showChannel: state.channels[0].grpFader[props.faderIndex].showChannel,
        faderLevel: state.channels[0].grpFader[props.faderIndex].faderLevel,
        label: state.channels[0].grpFader[props.faderIndex].label,
        mixerProtocol: state.settings[0].mixerProtocol,
        showSnaps: state.settings[0].showSnaps
    }
}

export default connect(mapStateToProps)(GrpFader);
