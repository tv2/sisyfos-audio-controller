import React from 'react'
import ClassNames from 'classnames'

import '../assets/css/ChannelRouteSettings.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { storeShowOptions } from '../../../shared/src/actions/settingsActions'
import { SOCKET_SET_ASSIGNED_FADER } from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import { IchMixerConnection } from '../../../shared/src/reducers/channelsReducer'
import { IFader } from '../../../shared/src/reducers/fadersReducer'
import { getFaderLabel } from '../utils/labels'

interface IChannelSettingsInjectProps {
    label: string
    chMixerConnections: IchMixerConnection[]
    fader: IFader[]
}

interface IChannelProps {
    faderIndex: number
}

class ChannelRouteSettings extends React.PureComponent<
    IChannelProps & IChannelSettingsInjectProps & Store
> {
    faderIndex: number

    constructor(props: any) {
        super(props)
        this.faderIndex = this.props.faderIndex
    }

    handleAssignChannel(mixerIndex: number, channel: number, event: any) {
        if (event.target.checked === false) {
            console.log('Unbinding Channel')
            if (
                window.confirm(
                    'Unbind Mixer ' +
                        String(mixerIndex + 1) +
                        ' Channel ' +
                        String(channel + 1) +
                        ' from Fader ' +
                        String(this.faderIndex + 1)
                )
            ) {
                window.socketIoClient.emit(SOCKET_SET_ASSIGNED_FADER, {
                    mixerIndex: mixerIndex,
                    channel: channel,
                    faderAssign: -1,
                })
            }
        } else {
            console.log('Binding Channel')
            if (
                window.confirm(
                    'Bind Mixer ' +
                        String(mixerIndex + 1) +
                        ' Channel ' +
                        String(channel + 1) +
                        ' to Fader ' +
                        String(this.faderIndex + 1) +
                        '?'
                )
            ) {
                window.socketIoClient.emit(SOCKET_SET_ASSIGNED_FADER, {
                    mixerIndex: mixerIndex,
                    channel: channel,
                    faderAssign: this.faderIndex,
                })
            }
        }
    }

    handleClearRouting() {
        if (window.confirm('REMOVE ALL FADER ASSIGNMENTS????')) {
            this.props.chMixerConnections.forEach(
                (chMixerConnection: IchMixerConnection, mixerIndex: number) => {
                    chMixerConnection.channel.forEach(
                        (channel: any, index: number) => {
                            window.socketIoClient.emit(
                                SOCKET_SET_ASSIGNED_FADER,
                                {
                                    mixerIndex: mixerIndex,
                                    channel: index,
                                    faderAssign: -1,
                                }
                            )
                        }
                    )
                }
            )
        }
    }

    handle11Routing() {
        if (window.confirm('Reassign all Faders 1:1 to Channels????')) {
            this.props.fader.forEach((fader: any, index: number) => {
                if (this.props.chMixerConnections[0].channel.length > index) {
                    window.socketIoClient.emit(SOCKET_SET_ASSIGNED_FADER, {
                        mixerIndex: 0,
                        channel: index,
                        faderAssign: index,
                    })
                }
            })
        }
    }

    handleClose = () => {
        this.props.dispatch(storeShowOptions(this.faderIndex))
    }

    renderMixer(chMixerConnection: IchMixerConnection, mixerIndex: number) {
        return (
            <div>
                <p className="channel-route-mixer-name">
                    {' '}
                    {'MIXER ' + (mixerIndex + 1)}
                </p>
                {chMixerConnection.channel.map((channel: any, index: number) => {
                    return (
                        <div
                            key={index}
                            className={ClassNames('channel-route-text', {
                                checked:
                                    channel.assignedFader === this.faderIndex,
                            })}
                        >
                            {' Channel ' + (index + 1) + ' : '}
                            <input
                                type="checkbox"
                                checked={
                                    channel.assignedFader === this.faderIndex
                                }
                                onChange={(event) =>
                                    this.handleAssignChannel(
                                        mixerIndex,
                                        index,
                                        event
                                    )
                                }
                            />
                            {channel.assignedFader >= 0
                                ? '   (Fader ' +
                                  (channel.assignedFader + 1) +
                                  ')'
                                : ' (not assigned)'}
                        </div>
                    )
                })}
            </div>
        )
    }

    render() {
        return (
            <div className="channel-route-body">
                <h2>{this.props.label}</h2>
                <button className="close" onClick={() => this.handleClose()}>
                    X
                </button>
                <button
                    className="button"
                    onClick={() => this.handleClearRouting()}
                >
                    CLEAR ALL
                </button>
                <button
                    className="button"
                    onClick={() => this.handle11Routing()}
                >
                    ROUTE 1.Mixer 1:1
                </button>
                <hr />
                {this.props.chMixerConnections.map(
                    (chMixerConnection: IchMixerConnection, mixerIndex: number) =>
                        this.renderMixer(chMixerConnection, mixerIndex)
                )}
            </div>
        )
    }
}

const mapStateToProps = (
    state: any,
    props: any
): IChannelSettingsInjectProps => {
    return {
        label: getFaderLabel(props.faderIndex, 'FADER'),
        chMixerConnections: state.channels[0].chMixerConnection,
        fader: state.faders[0].fader,
    }
}

export default connect<any, IChannelSettingsInjectProps>(mapStateToProps)(
    ChannelRouteSettings
) as any
