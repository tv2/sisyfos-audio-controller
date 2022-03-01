import * as React from 'react'
import { connect } from 'react-redux'

import '../assets/css/MiniChannels.css'
import { Store } from 'redux'
import { IFader } from '../../../shared/src/reducers/fadersReducer'
import { IChannels } from '../../../shared/src/reducers/channelsReducer'
import { ISettings } from '../../../shared/src/reducers/settingsReducer'
import MiniChannel from './MiniChannel'
import MiniChanStrip from './MiniChanStrip'

interface IChannelsInjectProps {
    channels: IChannels
    faders: IFader[]
    settings: ISettings
}

class Channels extends React.Component<IChannelsInjectProps & Store> {
    constructor(props: any) {
        super(props)
        this.props.settings.showMonitorOptions = -1
    }

    public shouldComponentUpdate(nextProps: IChannelsInjectProps) {
        return (
            this.props.settings.showOptions !==
                nextProps.settings.showOptions ||
            this.props.settings.showChanStrip !==
                nextProps.settings.showChanStrip ||
            this.props.settings.showMonitorOptions !==
                nextProps.settings.showMonitorOptions ||
            this.props.settings.mixers[0].mixerOnline !==
                nextProps.settings.mixers[0].mixerOnline ||
            this.props.faders.length !== nextProps.faders.length
        )
    }

    render() {
        return (
            <div className="mini-channels-body">
                {this.props.faders.map((fader: IFader, index: number) => {
                    return fader.showInMiniMonitor ? (
                        <MiniChannel faderIndex={index} key={index} />
                    ) : null
                })}
                {this.props.settings.showChanStrip >= 0 ? (
                    <div className="openChanStrip">
                        <MiniChanStrip
                            faderIndex={this.props.settings.showChanStrip}
                        />
                    </div>
                ) : (
                    <div className="closedChanStrip">
                        <MiniChanStrip
                            faderIndex={this.props.settings.showChanStrip}
                        />
                    </div>
                )}
            </div>
        )
    }
}

const mapStateToProps = (state: any): IChannelsInjectProps => {
    return {
        channels: state.channels[0].chMixerConnection[0].channel,
        faders: state.faders[0].fader,
        settings: state.settings[0],
    }
}

export default connect<IChannelsInjectProps, any, any>(mapStateToProps)(
    Channels
)
