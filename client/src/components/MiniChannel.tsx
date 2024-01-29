import * as React from 'react'
import ClassNames from 'classnames'
import { connect } from 'react-redux'
import { Store } from 'redux'
import '../assets/css/NoUiSlider.css'

//assets:
import '../assets/css/MiniChannel.css'
import { Fader } from '../../../shared/src/reducers/fadersReducer'
import { Channels } from '../../../shared/src/reducers/channelsReducer'
import { Settings } from '../../../shared/src/reducers/settingsReducer'
import { SettingsActionTypes } from '../../../shared/src/actions/settingsActions'
import { getFaderLabel } from '../utils/labels'

interface ChannelInjectProps {
    channels: Channels
    fader: Fader
    settings: Settings
    channelType: number
    channelTypeIndex: number
    label: string
}

interface ChannelProps {
    faderIndex: number
}

class MiniChannel extends React.Component<
    ChannelProps & ChannelInjectProps & Store
> {
    faderIndex: number

    constructor(props: any) {
        super(props)
        this.faderIndex = this.props.faderIndex
    }

    public shouldComponentUpdate(nextProps: ChannelInjectProps) {
        return (
            nextProps.fader.showChannel != this.props.fader.showChannel ||
            nextProps.label != this.props.label ||
            nextProps.settings.showChanStrip !=
                this.props.settings.showChanStrip
        )
    }

    handleShowChanStrip() {
        this.props.dispatch({
            type: SettingsActionTypes.TOGGLE_SHOW_CHAN_STRIP,
            channel: this.faderIndex,
        })
    }

    chanStripButton = () => {
        return (
            <button
                className={ClassNames('monitor-channel-strip-button', {
                    on:
                        this.props.settings.showChanStrip ===
                        this.props.channelTypeIndex,
                })}
                onClick={(event) => {
                    this.handleShowChanStrip()
                }}
            >
                {this.props.label}
            </button>
        )
    }

    render() {
        return this.props.fader.showChannel === false ? null : (
            <div className={ClassNames('monitor-channel-body', {})}>
                <React.Fragment>
                    {this.chanStripButton()}
                    <br />
                </React.Fragment>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): ChannelInjectProps => {
    return {
        channels: state.channels[0].chMixerConnection[0].channel,
        fader: state.faders[0].fader[props.faderIndex],
        settings: state.settings[0],
        channelType: 0 /* TODO: state.channels[0].channel[props.channelIndex].channelType, */,
        channelTypeIndex:
            props.faderIndex /* TODO: state.channels[0].chMixerConnection[0].channel[props.channelIndex].channelTypeIndex, */,
        label: getFaderLabel(props.faderIndex)
    }
}

export default connect<any, ChannelInjectProps, any>(mapStateToProps)(
    MiniChannel
) as any
