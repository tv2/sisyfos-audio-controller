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

    handleAssignChannel(mixerIndex: number, channelIndex: number, event: any) {
        console.log('Bind/Unbind Channel')
        if (
            window.confirm(
                'Bind/Unbind Mixer ' +
                String(mixerIndex + 1) +
                ' Channel ' +
                String(channelIndex + 1) +
                ' from Fader ' +
                String(this.faderIndex + 1)
            )
        ) {
            // Check if channel already is assigned to another fader and remove that binding prior to bind it to the new fader
            if (event.target.checked) {
                this.props.fader.forEach((fader: IFader, index: number) => {
                    if (fader.assignedChannels.some((assignedChan) => {
                        return assignedChan.mixerIndex === mixerIndex && assignedChan.channelIndex === channelIndex
                    })) {
                        window.socketIoClient.emit(SOCKET_ASSIGN_CH_TO_FADER, {
                            mixerIndex: mixerIndex,
                            channel: channelIndex,
                            faderIndex: index,
                            assigned: false
                        })
                    }
                })
            }


            window.socketIoClient.emit(SOCKET_ASSIGN_CH_TO_FADER, {
                mixerIndex: mixerIndex,
                channel: channelIndex,
                faderIndex: this.faderIndex,
                assigned: event.target.checked
            })
        }
    }

    handleClearAllRouting() {
        if (window.confirm('REMOVE ALL FADER ASSIGNMENTS????')) {
            window.socketIoClient.emit(SOCKET_REMOVE_ALL_CH_ASSIGNMENTS)
        }
    }

    handleOneToOneRouting() {
        if (window.confirm('Reassign all Faders 1:1 to Channels????')) {
            window.socketIoClient.emit(SOCKET_REMOVE_ALL_CH_ASSIGNMENTS)
            this.props.fader.forEach((fader: any, index: number) => {
                if (this.props.chMixerConnections[0].channel.length > index) {
                    window.socketIoClient.emit(SOCKET_ASSIGN_CH_TO_FADER, {
                        mixerIndex: 0,
                        channel: index,
                        faderIndex: index,
                        assigned: true
                    })
                }
            })
        }
    }

    handleClose = () => {
        this.props.dispatch(storeShowOptions(this.faderIndex))
    }

    getAssignedToFaderIndex = (channel: IChannelReference): number => {
        let assignedFaderIndex = -1
        this.props.fader.forEach((fader: any, index: number) => {

            if (fader.assignedChannels.some((assignedChan: IChannelReference) => {
                return assignedChan.channelIndex === channel.channelIndex && assignedChan.mixerIndex === channel.mixerIndex
            }))
                assignedFaderIndex = index
        })
        return assignedFaderIndex
    }


    renderMixer(chMixerConnection: IchMixerConnection, mixerIndex: number) {
        return (
            <div>
                <p className="channel-route-mixer-name">
                    {' '}
                    {'MIXER ' + (mixerIndex + 1)}
                </p>
                {chMixerConnection.channel.map((channel: any, index: number) => {
                    const assignedFaderIndex = this.getAssignedToFaderIndex({ mixerIndex: mixerIndex, channelIndex: index })
                    return (
                        <div
                            key={index}
                            className={ClassNames('channel-route-text', {
                                checked:
                                    assignedFaderIndex === this.faderIndex,
                            })}
                        >
                            {' Channel ' + (index + 1) + ' : '}
                            <input
                                type="checkbox"
                                checked={
                                    assignedFaderIndex === this.faderIndex
                                }
                                onChange={(event) =>
                                    this.handleAssignChannel(
                                        mixerIndex,
                                        index,
                                        event
                                    )
                                }
                            />
                            {assignedFaderIndex >= 0
                                ? '   (Fader ' +
                                (assignedFaderIndex + 1) +
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
                    onClick={() => this.handleClearAllRouting()}
                >
                    CLEAR ALL
                </button>
                <button
                    className="button"
                    onClick={() => this.handleOneToOneRouting()}
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
