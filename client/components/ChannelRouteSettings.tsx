import React from 'react'
//@ts-ignore
import * as ClassNames from 'classnames'

import '../assets/css/ChannelRouteSettings.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { storeShowOptions } from '../../server/reducers/settingsActions'
import { SOCKET_SET_ASSIGNED_FADER } from '../../server/constants/SOCKET_IO_DISPATCHERS'
import { IChannel, IchConnection } from '../../server/reducers/channelsReducer'
import { IFader } from '../../server/reducers/fadersReducer'

interface IChannelSettingsInjectProps {
    label: string
    chConnections: IchConnection[]
    channel: IChannel[]
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
            this.props.chConnections.forEach(
                (chConnection: IchConnection, mixerIndex: number) => {
                    chConnection.channel.forEach(
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
                if (this.props.channel.length > index) {
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

    renderMixer(chConnection: IchConnection, mixerIndex: number) {
        return (
            <div>
                <p className="channel-route-mixer-name">
                    {' '}
                    {'MIXER ' + (mixerIndex + 1)}
                </p>
                {chConnection.channel.map((channel: any, index: number) => {
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
                <h2>{this.props.label || 'FADER ' + (this.faderIndex + 1)}</h2>
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
                {this.props.chConnections.map(
                    (chConnection: IchConnection, mixerIndex: number) =>
                        this.renderMixer(chConnection, mixerIndex)
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
        label: state.faders[0].fader[props.faderIndex].label,
        chConnections: state.channels[0].chConnection,
        channel: state.channels[0].chConnection[0].channel,
        fader: state.faders[0].fader,
    }
}

export default connect<any, IChannelSettingsInjectProps>(mapStateToProps)(
    ChannelRouteSettings
) as any
