import React from 'react'
import ClassNames from 'classnames'

import '../assets/css/ChannelRouteSettings.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { storeShowOptions } from '../../../shared/src/actions/settingsActions'
import { SOCKET_ASSIGN_CH_TO_FADER, SOCKET_REMOVE_ALL_CH_ASSIGNMENTS } from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import { IchMixerConnection } from '../../../shared/src/reducers/channelsReducer'
import { IChannelReference, IFader } from '../../../shared/src/reducers/fadersReducer'
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
        console.log('Bind/Unbind Channel')
        if (
            window.confirm(
                'Bind/Unbind Mixer ' +
                String(mixerIndex + 1) +
                ' Channel ' +
                String(channel + 1) +
                ' from Fader ' +
                String(this.faderIndex + 1)
            )
        ) {
            // Check if channel already is assigned to another fader and remove that binding prior to bind it to the new fader
            if (event.target.checked) {
                this.props.fader.forEach((fader: any, index: number) => {
                    if (fader.assignedChannels.includes({ mixerIndex: mixerIndex, channelIndex: channel })) {
                        window.socketIoClient.emit(SOCKET_ASSIGN_CH_TO_FADER, {
                            mixerIndex: mixerIndex,
                            channel: channel,
                            faderIndex: index,
                            assigned: false
                        })
                    }
                })
            }


            window.socketIoClient.emit(SOCKET_ASSIGN_CH_TO_FADER, {
                mixerIndex: mixerIndex,
                channel: channel,
                faderIndex: this.faderIndex,
                assigned: event.target.checked
            })
        }
    }

    handleClearRouting() {
        if (window.confirm('REMOVE ALL FADER ASSIGNMENTS????')) {
            window.socketIoClient.emit(SOCKET_REMOVE_ALL_CH_ASSIGNMENTS)
        }
    }

    handle1to1Routing() {
        if (window.confirm('Reassign all Faders 1:1 to Channels????')) {
            this.props.fader.forEach((fader: any, index: number) => {
                if (this.props.chMixerConnections[0].channel.length > index) {
                    window.socketIoClient.emit(SOCKET_ASSIGN_CH_TO_FADER, {
                        mixerIndex: 0,
                        channel: index,
                        faderIndex: index,
                        assign: true
                    })
                }
            })
        }
    }

    handleClose = () => {
        this.props.dispatch(storeShowOptions(this.faderIndex))
    }

    isChannelAssignedToFader = (channel: IChannelReference) => {
        return (this.props.fader[this.faderIndex].assignedChannels?.includes(channel))
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
                                    this.isChannelAssignedToFader({ mixerIndex: mixerIndex, channelIndex: index }),
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
                            {this.isChannelAssignedToFader({ mixerIndex: mixerIndex, channelIndex: index })
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
                    onClick={() => this.handle1to1Routing()}
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
