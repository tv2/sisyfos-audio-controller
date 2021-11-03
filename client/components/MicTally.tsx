import * as React from 'react'
import { connect } from 'react-redux'

import '../assets/css/MicTally.css'
import { Store } from 'redux'
import { IChannels } from '../../server/reducers/channelsReducer'
import { IFader } from '../../server/reducers/fadersReducer'
import { ISettings } from '../../server/reducers/settingsReducer'
import { getFaderLabel } from '../utils/labels'


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

    render() {
        return (
            <div className="mic-tally-view">
                <ul className="mic-tally-list">
                { this.props.faders.map((fader) => {
                    const isOn = fader.pgmOn || fader.voOn
                    return (
                        <li className="c-mic-tally">
                            <span className={`c-mic-tally__status${isOn ? ' on': ''} `}>{ isOn ? 'ON' : 'OFF' }</span>
                            <span className={`c-mic-tally__label`}>{getFaderLabel(fader.monitor - 1)}</span>
                        </li>
                    )
                })}
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
