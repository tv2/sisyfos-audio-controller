import React, { PureComponent } from 'react';
import { connect } from "react-redux";

//assets:
import '../assets/css/VuMeter.css';
//Utils:
import * as DEFAULTS from '../utils/DEFAULTS';

const TOTALHEIGHT = 200 / (DEFAULTS.MAX_METER - DEFAULTS.MIN_METER);

class VuMeter extends PureComponent {
    constructor(props) {
        super(props);
        this.channelIndex = this.props.channelIndex;

        this.state = {
        };

        this.calcLower = this.calcLower.bind(this);
        this.calcMiddle = this.calcMiddle.bind(this);
        this.calcUpper = this.calcUpper.bind(this);
    }

    calcLower() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val >= DEFAULTS.TEST_METER) {
            val = DEFAULTS.TEST_METER;
        }
        return TOTALHEIGHT*val;
    }

    calcMiddle() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val < DEFAULTS.TEST_METER) {
            val = DEFAULTS.TEST_METER;
        } else if (val >= DEFAULTS.ZERO_METER) {
            val = DEFAULTS.ZERO_METER;
        }
        return TOTALHEIGHT*(val-DEFAULTS.TEST_METER)+1;
    }

    calcUpper() {
        let val = this.props.store.channels[0].channel[this.channelIndex].vuVal;
        if (val < DEFAULTS.ZERO_METER) {
            val = DEFAULTS.ZERO_METER;
        }
        return TOTALHEIGHT*(val-DEFAULTS.ZERO_METER)+1;
    }

    render() {
        return (
            <div className="vumeter-body">
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
                            "top": TOTALHEIGHT*DEFAULTS.TEST_METER+5
                        }
                    }
                ></canvas>
                <canvas
                    className="vumeter-upper-part"
                    style={
                        {
                            "height": this.calcUpper(),
                            "top": TOTALHEIGHT*DEFAULTS.ZERO_METER+5
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
