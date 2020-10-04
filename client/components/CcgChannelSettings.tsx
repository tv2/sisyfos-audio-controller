import React from 'react'

import '../assets/css/CcgChannelSettings.css'
import { ICasparCGMixerGeometry } from '../../server/constants/MixerProtocolInterface'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { SOCKET_SET_INPUT_OPTION } from '../../server/constants/SOCKET_IO_DISPATCHERS'

interface IChannelSettingsInjectProps {
    label: string
    mixerProtocol: string
    sourceOption: string
}

interface IChannelProps {
    channelIndex: number
}

class CcgChannelInputSettings extends React.PureComponent<
    IChannelProps & IChannelSettingsInjectProps & Store
> {
    mixerProtocol: ICasparCGMixerGeometry | undefined

    constructor(props: any) {
        super(props)
        const protocol = window.mixerProtocol as ICasparCGMixerGeometry
        if (protocol.sourceOptions) {
            this.mixerProtocol = protocol
        }
    }

    handleOption = (prop: string, option: string) => {
        window.socketIoClient.emit(SOCKET_SET_INPUT_OPTION, {
            channel: this.props.channelIndex,
            prop: prop,
            option: option,
        })
    }

    render() {
        return (
            <div className="channel-settings-body">
                <h2>
                    {this.props.label || 'CH ' + (this.props.channelIndex + 1)}{' '}
                    INPUT :
                </h2>
                {this.mixerProtocol &&
                    this.mixerProtocol.sourceOptions &&
                    Object.getOwnPropertyNames(
                        this.mixerProtocol.sourceOptions.options
                    ).map((prop) => {
                        return (
                            <div className="channel-settings-group" key={prop}>
                                {Object.getOwnPropertyNames(
                                    this.mixerProtocol!.sourceOptions!.options[
                                        prop
                                    ]
                                ).map((option) => {
                                    return (
                                        <button
                                            key={option}
                                            className={
                                                'channel-settings-group-item' +
                                                (this.props.sourceOption ===
                                                this.mixerProtocol!
                                                    .sourceOptions!.options[
                                                    prop
                                                ][option]
                                                    ? ' active'
                                                    : '')
                                            }
                                            onClick={() =>
                                                this.handleOption(
                                                    prop,
                                                    this.mixerProtocol!
                                                        .sourceOptions!.options[
                                                        prop
                                                    ][option]
                                                )
                                            }
                                        >
                                            {option}
                                        </button>
                                    )
                                }) || null}
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
): IChannelSettingsInjectProps => {
    return {
        label: state.channels[0].chConnection[0].channel[props.channelIndex].label,
        mixerProtocol: state.settings[0].mixers[0].mixerProtocol,
        sourceOption: (state.channels[0].chConnection[0].channel[props.channelIndex].private ||
            {})['channel_layout'],
    }
}

export default connect<any, IChannelSettingsInjectProps>(mapStateToProps)(
    CcgChannelInputSettings
) as any
