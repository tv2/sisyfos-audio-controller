import * as React from 'react'
import { connect } from 'react-redux'
import { vuMeters } from '../utils/SocketClientHandlers'

//assets:
import '../assets/css/VuMeter.css'
//Utils:

export interface VuMeterInjectedProps {
    faderIndex: number
    channel: number
}

interface VuMeterProps {
    faderIndex: number
}

export class VuMeter extends React.PureComponent<VuMeterInjectedProps> {
    canvas: HTMLCanvasElement | undefined

    totalPeak: number = 0
    windowPeak: number = 0
    windowLast: number = 0
    meterMax: number = 1
    meterMin: number = 0
    meterTest: number = 0.75
    meterZero: number = 0.75
    WINDOW: number = 2000

    private _painting = false
    private _previousVal = -1
    private _value = 0

    constructor(props: any) {
        super(props)
        this.meterMax = window.mixerProtocol.meter?.max || 1
        this.meterMin = window.mixerProtocol.meter?.min || 0
        this.meterTest = window.mixerProtocol.meter?.test || 0.75
        this.meterZero = window.mixerProtocol.meter?.zero || 0.75
    }

    componentDidMount() {
        if (this._painting) this.paintVuMeter()
    }

    totalHeight = () => {
        return (
            (400) /
            (this.meterMax - this.meterMin)
        )
    }

    getTotalPeak = () => {
        if (this._value > this.totalPeak) {
            this.totalPeak = this._value
        }
        return this.totalHeight() * this.totalPeak
    }

    getWindowPeak = () => {
        if (
            this._value > this.windowPeak ||
            Date.now() - this.windowLast > this.WINDOW
        ) {
            this.windowPeak = this._value
            this.windowLast = Date.now()
        }
        return this.totalHeight() * this.windowPeak
    }

    calcLower = () => {
        let val = this._value
        if (val >= this.meterTest) {
            val = this.meterTest
        }
        return this.totalHeight() * val
    }

    calcMiddle = () => {
        let val = this._value
        if (val < this.meterTest) {
            val = this.meterTest
        } else if (val >= this.meterZero) {
            val = this.meterZero
        }
        return this.totalHeight() * (val - this.meterTest) + 1
    }

    calcUpper = () => {
        let val = this._value
        if (val < this.meterZero) {
            val = this.meterZero
        }
        return this.totalHeight() * (val - this.meterZero) + 1
    }

    setRef = (el: HTMLCanvasElement) => {
        this.canvas = el

        this.paintVuMeter()
    }

    resetTotalPeak = () => {
        this.totalPeak = 0
    }

    paintVuMeter = () => {
        if (!this.canvas) {
            this._painting = false
            return
        }
        this._painting = true

        this._value = vuMeters[this.props.faderIndex]?.[this.props.channel] || 0

        if (this._value === this._previousVal) {
            this._painting = false
            window.requestAnimationFrame(this.paintVuMeter)
            return
        }
        this._previousVal = this._value

        const context = this.canvas.getContext('2d', {
            antialias: false,
            stencil: false,
            preserveDrawingBuffer: true,
        }) as CanvasRenderingContext2D

        if (!context) return

        const range = this.meterMax - this.meterMin
        context.clearRect(
            0,
            0,
            this.canvas.clientWidth,
            this.canvas.clientHeight
        )

        // lower part
        context.fillStyle = 'rgb(0, 122, 37)'
        context.fillRect(
            0,
            this.totalHeight() - this.calcLower(),
            this.canvas.clientWidth,
            this.calcLower()
        )

        // middle part
        context.fillStyle = 'rgb(53, 167, 0)'
        context.fillRect(
            0,
            this.totalHeight() * (range - this.meterTest) - this.calcMiddle(),
            this.canvas.clientWidth,
            this.calcMiddle()
        )

        // upper part (too high/clip)
        context.fillStyle = 'rgb(206, 0, 0)'
        context.fillRect(
            0,
            this.totalHeight() * (range - this.meterZero) - this.calcUpper(),
            this.canvas.clientWidth,
            this.calcUpper()
        )

        // windowed peak
        const windowPeak = this.getWindowPeak()
        if (this.windowPeak < this.meterZero) {
            context.fillStyle = 'rgb(16, 56, 0)'
        } else {
            context.fillStyle = 'rgb(100, 100, 100)'
        }
        context.fillRect(
            0,
            this.totalHeight() - windowPeak,
            this.canvas.clientWidth,
            2
        )

        // absolute peak
        if (this.totalPeak < this.meterZero) {
            context.fillStyle = 'rgb(64, 64, 64)'
        } else {
            context.fillStyle = 'rgb(255, 0, 0)'
        }
        context.fillRect(
            0,
            this.totalHeight() - this.getTotalPeak(),
            this.canvas.clientWidth,
            2
        )

        window.requestAnimationFrame(this.paintVuMeter)
    }

    render() {
        return (
            <div
                className="vumeter-body"
                style={{
                    height: this.totalHeight() + 30,
                }}
                onClick={this.resetTotalPeak}
            >
                <canvas
                    className="vumeter-canvas"
                    style={{
                        height: this.totalHeight(),
                        top: '10px',
                    }}
                    height={this.totalHeight()}
                    width={10}
                    ref={this.setRef}
                ></canvas>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): VuMeterInjectedProps => {
    return {
        faderIndex: props.faderIndex,
        channel: props.channel
    }
}

export default connect<VuMeterInjectedProps, any, any>(mapStateToProps)(
    VuMeter
)
