import * as React from 'react';
import { connect } from "react-redux";

//assets:
import '../assets/css/VuMeter.css';
//Utils:
import { IMixerProtocol, MixerProtocolPresets, IMixerProtocolGeneric } from '../constants/MixerProtocolPresets';
import { any } from 'prop-types';

export interface IVuMeterInjectedProps {
    showSnaps: boolean
    mixerProtocol: string
    vuVal: number
}

interface IVuMeterProps {
    channelIndex: number
}

export class VuMeter extends React.PureComponent<IVuMeterInjectedProps> {
    mixerProtocol: IMixerProtocolGeneric;
    canvas: HTMLCanvasElement | undefined;

    totalPeak: number = 0;
    windowPeak: number = 0;
    windowLast: number = 0;
    WINDOW: number = 2000;

    constructor(props: any) {
        super(props);

        this.mixerProtocol = MixerProtocolPresets[this.props.mixerProtocol]  || MixerProtocolPresets.genericMidi;
    }

    totalHeight = () => {
        return (this.props.showSnaps ? 1 : 2) * 200 / (this.mixerProtocol.meter.max - this.mixerProtocol.meter.min);
    }

    getTotalPeak = () => {
        if (this.props.vuVal > this.totalPeak) {
            this.totalPeak = this.props.vuVal;
        }
        return this.totalHeight()*this.totalPeak;
    }

    getWindowPeak = () => {
        if (this.props.vuVal > this.windowPeak || (Date.now() - this.windowLast) > this.WINDOW) {
            this.windowPeak = this.props.vuVal;
            this.windowLast = Date.now()
        }
        return this.totalHeight()*this.windowPeak
    }

    calcLower = () => {
        let val = this.props.vuVal;
        if (val >= this.mixerProtocol.meter.test) {
            val = this.mixerProtocol.meter.test;
        }
        return this.totalHeight()*val;
    }

    calcMiddle = () => {
        let val = this.props.vuVal;
        if (val < this.mixerProtocol.meter.test) {
            val = this.mixerProtocol.meter.test;
        } else if (val >= this.mixerProtocol.meter.zero) {
            val = this.mixerProtocol.meter.zero;
        }
        return this.totalHeight()*(val-this.mixerProtocol.meter.test)+1;
    }

    calcUpper = () => {
        let val = this.props.vuVal;
        if (val < this.mixerProtocol.meter.zero) {
            val = this.mixerProtocol.meter.zero;
        }
        return this.totalHeight()*(val-this.mixerProtocol.meter.zero)+1;
    }

    setRef = (el: HTMLCanvasElement) => {
        this.canvas = el;

        this.paintVuMeter();
    }

    resetTotalPeak = () => {
        this.totalPeak = 0;
    }

    paintVuMeter = () => {
        if (!this.canvas) return

        const context = this.canvas.getContext("2d", {
            antialias: false,
            stencil: false,
            preserveDrawingBuffer: true
        })

        if (!context) return

        const range = (this.mixerProtocol.meter.max - this.mixerProtocol.meter.min)
        context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

        // lower part
        context.fillStyle = 'rgb(0, 122, 37)';
        context.fillRect(0, (this.totalHeight() - this.calcLower()), this.canvas.clientWidth, this.calcLower());
        
        // middle part
        context.fillStyle = 'rgb(53, 167, 0)';
        context.fillRect(0, (this.totalHeight() * (range - this.mixerProtocol.meter.test) - this.calcMiddle()), this.canvas.clientWidth, this.calcMiddle());

        // upper part (too high/clip)
        context.fillStyle = 'rgb(206, 0, 0)';
        context.fillRect(0, (this.totalHeight() * (range - this.mixerProtocol.meter.zero) - this.calcUpper()), this.canvas.clientWidth, this.calcUpper());

        // windowed peak
        const windowPeak = this.getWindowPeak();
        if (this.windowPeak < this.mixerProtocol.meter.zero) {
            context.fillStyle = 'rgb(16, 56, 0)';
        } else {
            context.fillStyle = 'rgb(100, 100, 100)';
        }
        context.fillRect(0, (this.totalHeight() - windowPeak), this.canvas.clientWidth, 2);
        
        // absolute peak
        if (this.totalPeak < this.mixerProtocol.meter.zero) {
            context.fillStyle = 'rgb(64, 64, 64)';
        } else {
            context.fillStyle = 'rgb(255, 0, 0)';
        }
        context.fillRect(0, (this.totalHeight() - this.getTotalPeak()), this.canvas.clientWidth, 2);
    }

    render() {
        this.paintVuMeter()

        return (
            <div className="vumeter-body"
                style={{
                    "height" : this.totalHeight() + 30
                }}
                onClick={this.resetTotalPeak}
            >
                <canvas
                    className="vumeter-canvas"
                    style={
                        {
                            "height": this.totalHeight(),
                            "top": "10px"
                        }
                    }
                    height={this.totalHeight()}
                    width={10}
                    ref={this.setRef}
                ></canvas>

            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IVuMeterInjectedProps => {
    return {
        vuVal: state.channels[0].vuMeters[props.channelIndex].vuVal,
        mixerProtocol: state.settings[0].mixerProtocol,
        showSnaps: state.settings[0].showSnaps
    }
}

export default connect<IVuMeterInjectedProps, any, any>(mapStateToProps)(VuMeter);
