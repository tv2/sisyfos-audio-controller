import React, { ChangeEvent } from 'react'
import ClassNames from 'classnames'

import '../assets/css/ChannelMonitorOptions.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { SettingsActionTypes } from '../../../shared/src/actions/settingsActions'
import { Settings } from '../../../shared/src/reducers/settingsReducer'
import {
    SOCKET_SET_AUX_LEVEL,
    SOCKET_SET_FADER_MONITOR,
    SOCKET_SHOW_IN_MINI_MONITOR,
} from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import { getFaderLabel } from '../utils/labels'

interface MonitorSettingsInjectProps {
    label: string
    selectedProtocol: string
    numberOfChannelsInType: Array<number>
    channel: Array<any>
    fader: Array<any>
    settings: Settings
}

interface ChannelProps {
    faderIndex: number
}

class ChannelMonitorOptions extends React.PureComponent<
    ChannelProps & MonitorSettingsInjectProps & Store
> {
    faderIndex: number

    constructor(props: any) {
        super(props)
        this.faderIndex = this.props.faderIndex
    }

    handleAssignChannel(channel: number, event: any) {
        if (event.target.checked === false) {
            if (window.confirm('Remove monitoring on ' + String(channel + 1))) {
                window.socketIoClient.emit(SOCKET_SET_AUX_LEVEL, {
                    channel: channel,
                    auxIndex: this.props.fader[this.faderIndex].monitor - 1,
                    level: -1,
                })
            }
        } else {
            if (
                window.confirm(
                    'Enable monitoring of Channel ' + String(channel + 1) + '?'
                )
            ) {
                window.socketIoClient.emit(SOCKET_SET_AUX_LEVEL, {
                    channel: channel,
                    auxIndex: this.props.fader[this.faderIndex].monitor - 1,
                    level: 0,
                })
            }
        }
    }

    handleClearMonitorRouting() {
        if (
            window.confirm(
                'This will remove all monitor assignments to Aux :' +
                String(this.props.fader[this.faderIndex].monitor)
            )
        ) {
            this.props.channel.forEach((channel: any, index: number) => {
                window.socketIoClient.emit(SOCKET_SET_AUX_LEVEL, {
                    channel: index,
                    auxIndex: this.props.fader[this.faderIndex].monitor - 1,
                    level: -1,
                })
            })
        }
    }

    handleMixMinusRouting() {
        if (
            window.confirm(
                'Send all channels to Aux: ' +
                String(this.props.fader[this.faderIndex].monitor)
            )
        ) {
            this.props.channel.forEach((channel: any, index: number) => {
                window.socketIoClient.emit(SOCKET_SET_AUX_LEVEL, {
                    channel: index,
                    auxIndex: this.props.fader[this.faderIndex].monitor - 1,
                    level: 0,
                })
            })
        }
    }

    handleShowInMiniMonitor = (event: ChangeEvent<HTMLInputElement>) => {
        window.socketIoClient.emit(SOCKET_SHOW_IN_MINI_MONITOR, {
            faderIndex: this.faderIndex,
            showInMiniMonitor: event.target.checked,
        })
    }

    handleSetAux = (event: ChangeEvent<HTMLInputElement>) => {
        let value = parseFloat(event.target.value) || -1
        if (value > this.props.settings.mixers[0].numberOfAux || value < 0) {
            value = -1
        }
        window.socketIoClient.emit(SOCKET_SET_FADER_MONITOR, {
            faderIndex: this.faderIndex,
            auxIndex: value,
        })
    }

    handleClose = () => {
        this.props.dispatch({
            type: SettingsActionTypes.TOGGLE_SHOW_MONITOR_OPTIONS,
            channel: this.faderIndex,
        })
    }

    render() {
        return (
            <div className="channel-monitor-body">
                <h2>MONITOR ROUTE</h2>
                <h2>{this.props.label}</h2>
                <button className="close" onClick={() => this.handleClose()}>
                    X
                </button>
                <button
                    className="button"
                    onClick={() => this.handleClearMonitorRouting()}
                >
                    CLEAR ALL
                </button>
                <button
                    className="button"
                    onClick={() => this.handleMixMinusRouting()}
                >
                    ASSIGN ALL
                </button>
                <hr />
                <label className="input">MONITOR AUX SEND :</label>
                <input
                    title='Set the Aux Send for the monitor. Set to -1 to disable monitoring'
                    className="input-field"
                    value={this.props.fader[this.faderIndex].monitor}
                    onChange={(event) => this.handleSetAux(event)}
                />
                <br />
                <label className="input">SHOW IN MINI MONITORVIEW :</label>
                <input
                    title='Show this channel in the Mini MonitorView'
                    type="checkbox"
                    checked={
                        this.props.fader[this.faderIndex].showInMiniMonitor
                    }
                    onChange={(event) => this.handleShowInMiniMonitor(event)}
                />
                <hr />
                {this.props.channel.map((channel: any, index: number) => {
                    let isSelected: boolean = (
                        channel.auxLevel[
                            this.props.fader[this.faderIndex].monitor - 1
                        ] >= 0
                    )
                    return (
                        <div
                            key={index}
                            className={ClassNames('channel-monitor-text', {
                                checked: isSelected,
                            })}
                        >
                            {' Channel ' + (index + 1) + ' : '}
                            <input
                                title='Enable monitoring of this channel'
                                type="checkbox"
                                checked={isSelected}
                                onChange={(event) =>
                                    this.handleAssignChannel(index, event)
                                }
                            />
                            {isSelected ? 'Monitor this' : null}
                        </div>
                    )
                })}
            </div>
        )
    }
}

const mapStateToProps = (
    state: any,
    props: any
): MonitorSettingsInjectProps => {
    return {
        label: getFaderLabel(props.faderIndex, 'FADER'),
        selectedProtocol: state.settings[0].mixers[0].mixerProtocol,
        numberOfChannelsInType:
            state.settings[0].mixers[0].numberOfChannelsInType,
        channel: state.channels[0].chMixerConnection[0].channel,
        fader: state.faders[0].fader,
        settings: state.settings[0],
    }
}

export default connect<any, MonitorSettingsInjectProps>(mapStateToProps)(
    ChannelMonitorOptions
) as any
