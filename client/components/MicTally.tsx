import * as React from 'react'
import { connect } from 'react-redux'

import '../assets/css/MicTally.css'
import { Store } from 'redux'
import { IChannels } from '../../server/reducers/channelsReducer'
import { IFader } from '../../server/reducers/fadersReducer'
import { ISettings } from '../../server/reducers/settingsReducer'
import { getFaderLabel } from '../utils/labels'

import {
    SOCKET_TOGGLE_PGM,
    SOCKET_TOGGLE_VO,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'


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

    componentWillMount() {
        document.body.classList.add('v-mic-tally')
    }

    componentWillUnmount() {
        document.body.classList.remove('v-mic-tally')
    }

    toggleFader(index: number) {
      const fader = this.props.faders[index]

      if (fader.muteOn) {
        return
      }

      if (fader.voOn) {
        window.socketIoClient.emit(SOCKET_TOGGLE_VO, index)
      } else {
        window.socketIoClient.emit(SOCKET_TOGGLE_PGM, index)
      }
    }

    render() {
        return (
            <div className="mic-tally-view">
                <ul className="mic-tally-list">
                { this.props.faders
                    .map((fader, index) => {
                        if (!fader.showInMiniMonitor) {
                            return
                        }
                        const isOn = (fader.pgmOn || fader.voOn) && !fader.muteOn
                        return (
                            <li className="c-mic-tally" key={index}>
                                <div onClick={() => this.toggleFader(index)} className={`c-mic-tally__status${isOn ? ' on': ''}${fader.muteOn ? ' muted' : ''}`}>
                                  <div className="c-mic-tally__status__content">
                                    { isOn ? 'ON' : 'OFF' }
                                  </div>
                                </div>
                                <span className={`c-mic-tally__label`}>{getFaderLabel(index)}</span>
                            </li>
                        )
                    })
                  }
                </ul>
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
