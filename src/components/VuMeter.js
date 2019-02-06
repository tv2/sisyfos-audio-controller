import React, { PureComponent } from 'react';
import { connect } from "react-redux";

//assets:
import '../assets/css/VuMeter.css';
//Utils:
import * as DEFAULTS from '../utils/DEFAULTS';

class VuMeter extends PureComponent {
    constructor(props) {
        super(props);
        this.channelIndex = this.props.channelIndex;

        this.state = {
        };

        this.totalHeight = this.totalHeight.bind(this);
        this.calcLower = this.calcLower.bind(this);
        this.calcMiddle = this.calcMiddle.bind(this);
        this.calcUpper = this.calcUpper.bind(this);
    }

    totalHeight() {
        return (this.props.store.settings[0].showSnaps ? 1 : 2) * 200 / (DEFAULTS.MAX_METER - DEFAULTS.MIN_METER);
    }

    calcLower() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val >= DEFAULTS.TEST_METER) {
            val = DEFAULTS.TEST_METER;
        }
        return this.totalHeight()*val;
    }

    calcMiddle() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val < DEFAULTS.TEST_METER) {
            val = DEFAULTS.TEST_METER;
        } else if (val >= DEFAULTS.ZERO_METER) {
            val = DEFAULTS.ZERO_METER;
        }
        return this.totalHeight()*(val-DEFAULTS.TEST_METER)+1;
    }

    calcUpper() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val < DEFAULTS.ZERO_METER) {
            val = DEFAULTS.ZERO_METER;
        }
        return this.totalHeight()*(val-DEFAULTS.ZERO_METER)+1;
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
                            "top": this.totalHeight()*DEFAULTS.TEST_METER+5
                        }
                    }
                ></canvas>
                <canvas
                    className="vumeter-upper-part"
                    style={
                        {
                            "height": this.calcUpper(),
                            "top": this.totalHeight()*DEFAULTS.ZERO_METER+5
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
