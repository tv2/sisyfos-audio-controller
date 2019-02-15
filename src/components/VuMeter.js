import React, { PureComponent } from 'react';
import { connect } from "react-redux";

//assets:
import '../assets/css/VuMeter.css';
//Utils:
import { OscPresets } from '../utils/OSCPRESETS';

class VuMeter extends PureComponent {
    constructor(props) {
        super(props);
        this.channelIndex = this.props.channelIndex;


        this.state = {
        };
        this.oscPreset = OscPresets[this.props.store.settings[0].oscPreset];

        this.totalHeight = this.totalHeight.bind(this);
        this.calcLower = this.calcLower.bind(this);
        this.calcMiddle = this.calcMiddle.bind(this);
        this.calcUpper = this.calcUpper.bind(this);
    }

    totalHeight() {
        return (this.props.store.settings[0].showSnaps ? 1 : 2) * 200 / (this.oscPreset.meter.max - this.oscPreset.meter.min);
    }

    calcLower() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val >= this.oscPreset.meter.test) {
            val = this.oscPreset.meter.test;
        }
        return this.totalHeight()*val;
    }

    calcMiddle() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val < this.oscPreset.meter.test) {
            val = this.oscPreset.meter.test;
        } else if (val >= this.oscPreset.meter.zero) {
            val = this.oscPreset.meter.zero;
        }
        return this.totalHeight()*(val-this.oscPreset.meter.test)+1;
    }

    calcUpper() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val < this.oscPreset.meter.zero) {
            val = this.oscPreset.meter.zero;
        }
        return this.totalHeight()*(val-this.oscPreset.meter.zero)+1;
    }

    render() {

        return (
            <div className="vumeter-body"
                style={{
                    "height" : this.totalHeight() + 30
                }}
            >
                <canvas
                    className="vumeter-lower-part"
                    style={
                        {
                            "height": this.calcLower(),
                            "top": "5px"
                        }
                    }
                ></canvas>
                <canvas
                    className="vumeter-middle-part"
                    style={
                        {
                            "height": this.calcMiddle(),
                            "top": this.totalHeight()*this.oscPreset.meter.test+5
                        }
                    }
                ></canvas>
                <canvas
                    className="vumeter-upper-part"
                    style={
                        {
                            "height": this.calcUpper(),
                            "top": this.totalHeight()*this.oscPreset.meter.zero+5
                        }
                    }></canvas>

            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(VuMeter);
