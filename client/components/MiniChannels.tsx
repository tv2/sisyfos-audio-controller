import * as React from 'react'
import { connect } from 'react-redux'
//@ts-ignore
import * as ClassNames from 'classnames'

import '../assets/css/MiniChannels.css'
import { Store } from 'redux'
import {
    TOGGLE_SHOW_SETTINGS,
    TOGGLE_SHOW_STORAGE,
} from '../../server/reducers/settingsActions'
import ChanStrip from './ChanStrip'
import { IChannels } from '../../server/reducers/channelsReducer'
import { IFader } from '../../server/reducers/fadersReducer'
import { ISettings } from '../../server/reducers/settingsReducer'
import {
    SOCKET_NEXT_MIX,
    SOCKET_CLEAR_PST,
    SOCKET_RESTART_SERVER,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
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
            this.props.settings.mixerOnline !==
                nextProps.settings.mixerOnline ||
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
        channels: state.channels[0].channel,
        faders: state.faders[0].fader,
        settings: state.settings[0],
    }
}

export default connect<IChannelsInjectProps, any, any>(mapStateToProps)(
    Channels
)
