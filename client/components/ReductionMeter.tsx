import * as React from 'react'
import { connect } from "react-redux"

//assets:
import '../assets/css/ReductionMeter.css'
//Utils:

export interface IReductionMeterInjectedProps {
    reductionVal: number
}

interface IVuMeterProps {
    faderIndex: number
}

export class ReductionMeter extends React.Component<IReductionMeterInjectedProps> {
    canvas: HTMLCanvasElement | undefined

    totalPeak: number = 0
    windowPeak: number = 0
    windowLast: number = 0
    WINDOW: number = 2000

    constructor(props: any) {
        super(props)
    }

    public shouldComponentUpdate(nextProps: IReductionMeterInjectedProps) {
        return (
            nextProps.reductionVal != this.props.reductionVal
        )
    }

    totalHeight = () => {
        return 170 / (window.mixerProtocol.meter.max - window.mixerProtocol.meter.min)
    }

    getTotalPeak = () => {
        if (this.props.reductionVal > this.totalPeak) {
            this.totalPeak = this.props.reductionVal
        }
        return this.totalHeight()*this.totalPeak
    }

    getWindowPeak = () => {
        if (this.props.reductionVal > this.windowPeak || (Date.now() - this.windowLast) > this.WINDOW) {
            this.windowPeak = this.props.reductionVal
            this.windowLast = Date.now()
        }
        return this.totalHeight()*this.windowPeak
    }

    calcLower = () => {
        let val = this.props.reductionVal
        if (val >= window.mixerProtocol.meter.test) {
            val = window.mixerProtocol.meter.test
        }
        return val
    }

    calcMiddle = () => {
        let val = this.props.reductionVal
        if (val < window.mixerProtocol.meter.test) {
            val = window.mixerProtocol.meter.test
        } else if (val >= window.mixerProtocol.meter.zero) {
            val = window.mixerProtocol.meter.zero
        }
        return val+1
    }

    calcUpper = () => {
        let val = this.props.reductionVal
        if (val < window.mixerProtocol.meter.zero) {
            val = window.mixerProtocol.meter.zero
        }
        return val+1
    }

    setRef = (element: HTMLCanvasElement) => {
        this.canvas = element

        this.paintVuMeter()
    }

    resetTotalPeak = () => {
        this.totalPeak = 0
    }

    paintVuMeter = () => {
        if (!this.canvas) return

        const context = this.canvas.getContext("2d", {
            antialias: false,
            stencil: false,
            preserveDrawingBuffer: true
        }) as CanvasRenderingContext2D

        if (!context) return

        context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight)

        // lower part
        context.fillStyle = 'rgb(0, 122, 37)'
        context.fillRect(0, 0, this.canvas.clientWidth, this.calcLower()) //(this.totalHeight() - this.calcLower()), this.canvas.clientWidth, this.calcLower())

        // middle part
        let middle = this.calcMiddle()
        let middleRef = this.totalHeight() * window.mixerProtocol.meter.test
        context.fillStyle = 'rgb(53, 167, 0)'
        context.fillRect(0, middleRef, this.canvas.clientWidth, middle)// (this.totalHeight() * (range - window.mixerProtocol.meter.test) - this.calcMiddle()), this.canvas.clientWidth, this.calcMiddle())

        // upper part (too high/clip)
        let upper = this.calcUpper()
        let upperRef = this.totalHeight() * window.mixerProtocol.meter.zero
        context.fillStyle = 'rgb(206, 0, 0)'
        context.fillRect(0, upperRef, this.canvas.clientWidth, upper)

        // windowed peak
        const windowPeak = this.getWindowPeak()
        if (this.windowPeak < window.mixerProtocol.meter.zero) {
            context.fillStyle = 'rgb(16, 56, 0)'
        } else {
            context.fillStyle = 'rgb(100, 100, 100)'
        }
        context.fillRect(0, (this.totalHeight() - windowPeak), this.canvas.clientWidth, 2)

        // absolute peak
        if (this.totalPeak < window.mixerProtocol.meter.zero) {
            context.fillStyle = 'rgb(64, 64, 64)'
        } else {
            context.fillStyle = 'rgb(255, 0, 0)'
        }
        context.fillRect(0, (this.totalHeight() - this.getTotalPeak()), this.canvas.clientWidth, 2)
    }

    render() {
        this.paintVuMeter()

        return (
            <div className="reductionmeter-body"
                style={{
                    "height" : this.totalHeight() + 30
                }}
                onClick={this.resetTotalPeak}
            >
                <canvas
                    className="reductionmeter-canvas"
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

const mapStateToProps = (state: any, props: any): IReductionMeterInjectedProps => {
    return {
        reductionVal: state.faders[0].vuMeters[props.faderIndex].reductionVal
    }
}

export default connect<IReductionMeterInjectedProps, any, any>(mapStateToProps)(ReductionMeter)
