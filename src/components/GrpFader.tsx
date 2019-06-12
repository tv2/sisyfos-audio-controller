import React, { PureComponent } from 'react';
import { connect } from "react-redux";
//@ts-ignore
import * as ClassNames from 'classnames';

import GrpVuMeter from './GrpVuMeter';
//assets:
import '../assets/css/GrpFader.css';
import { IMixerProtocol, MixerProtocolPresets, IMixerProtocolGeneric } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';
import { Store } from 'redux';

interface IGrpFaderInjectProps {
    mixerProtocol: string
    showSnaps: boolean
    faderLevel: number
    pgmOn: boolean
    pstOn: boolean
    label: string
    showChannel: boolean
    showPfl: boolean
}

interface IGrpFaderProps {
    faderIndex: number
}

class GrpFader extends PureComponent<IGrpFaderProps & IGrpFaderInjectProps & Store> {
    mixerProtocol: IMixerProtocol;
    faderIndex: number;

    constructor(props: any) {
        super(props);
        this.faderIndex = this.props.faderIndex;
        this.mixerProtocol = (MixerProtocolPresets[this.props.mixerProtocol] || MixerProtocolPresets.genericMidi) as IMixerProtocol;

    }

    public shouldComponentUpdate(nextProps: IGrpFaderInjectProps) {
        return (nextProps.pgmOn != this.props.pgmOn ||
            nextProps.pstOn != this.props.pstOn ||
            nextProps.showChannel != this.props.showChannel ||
            nextProps.faderLevel != this.props.faderLevel ||
            nextProps.label != this.props.label ||
            nextProps.mixerProtocol != this.props.mixerProtocol ||
            nextProps.showSnaps != this.props.showSnaps ||
            nextProps.showPfl != this.props.showPfl)
//ToDo: handle snaps state re-rendering:  nextProps.snapOn != this.props.snapOn ||
    }

    handlePgm() {
        this.props.dispatch({
            type:'TOGGLE_GRP_PGM',
            channel: this.faderIndex
        });
        window.mixerConnection.updateGrpOutLevel(this.faderIndex);
    }

    handlePst() {
        this.props.dispatch({
            type:'TOGGLE_GRP_PST',
            channel: this.faderIndex
        });
    }

    handleLevel(event: any) {
        this.props.dispatch({
            type:'SET_GRP_FADER_LEVEL',
            channel: this.faderIndex,
            level: event.target.value
        });
        window.mixerConnection.updateGrpOutLevel(this.faderIndex);
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

    pgmButton = () => {
        return (

            <button
                className={ClassNames("grpFader-pgm-button", {
                    'on': this.props.pgmOn
                })}
                onClick={event => {
                    this.handlePgm();
                }}
            >
                {this.props.label != "" ? this.props.label : ("GRP " + (this.faderIndex + 1)) }
            </button>
        )
    }

    pstButton = () => {
        return (
            <button
                className={ClassNames("grpFader-pst-button", {
                    'on': this.props.pstOn
                })}
                onClick={event => {
                    this.handlePst();
                }}
            >PST</button>
        )
    }

    render() {
        return (
        this.props.showChannel === false ?
            <div></div>
            :
                <div className={ClassNames("grpFader-body", {
                    "with-snaps": this.props.showSnaps,
                    "with-pfl": this.props.showPfl
                })}>
                {this.fader()}
                { this.mixerProtocol.fromMixer.GRP_VU != 'none' ? <GrpVuMeter faderIndex = {this.faderIndex}/> : ''}
                <br/>
                {this.pgmButton()}
                <br/>
                {this.pstButton()}
                <br/>
                <div className="grpFader-name">
                    {this.props.label != "" ? this.props.label : ("GRP " + (this.faderIndex + 1)) }
                </div>
                <div className="grpFader-gain-label">
                    GAIN: {Math.round(this.props.faderLevel * 100) / 100}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IGrpFaderInjectProps => {
    return {
        pgmOn: state.channels[0].grpFader[props.faderIndex].pgmOn,
        pstOn: state.channels[0].grpFader[props.faderIndex].pstOn,
        showChannel: state.channels[0].grpFader[props.faderIndex].showChannel,
        faderLevel: state.channels[0].grpFader[props.faderIndex].faderLevel,
        label: state.channels[0].grpFader[props.faderIndex].label,
        mixerProtocol: state.settings[0].mixerProtocol,
        showSnaps: state.settings[0].showSnaps,
        showPfl: state.settings[0].showPfl
    }
}

export default connect<any, any>(mapStateToProps)(GrpFader) as any;
