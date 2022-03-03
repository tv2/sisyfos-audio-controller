import React, { ChangeEvent } from 'react'

import '../assets/css/LabelSettings.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import {
    storeShowLabelSetup,
} from '../../../shared/src/actions/settingsActions'
import { IFader } from '../../../shared/src/reducers/fadersReducer'
import {
    SOCKET_FLUSH_LABELS,
    SOCKET_SET_LABELS,
} from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import { ICustomPages } from '../../../shared/src/reducers/settingsReducer'
import { getChannelLabel } from '../utils/labels'
import { flushExtLabels, updateLabels } from '../../../shared/src/actions/faderActions'
import { storeFlushChLabels } from '../../../shared/src/actions/channelActions'

interface ILabelSettingsInjectProps {
    customPages: ICustomPages[]
    fader: IFader[]
}

class LabelSettings extends React.PureComponent<
    ILabelSettingsInjectProps & Store
> {
    state = {
        mutations: {} as Record<string, string>
    }

    constructor(props: any) {
        super(props)
    }

    componentDidMount() {
        this.setState({ label: this.props.customPages[0].label })
    }

    handleLabel = (event: ChangeEvent<HTMLInputElement>, index: number) => {
        console.log(event.target.value, index)
        this.setState({ mutations: { ...this.state.mutations, [index]: event.target.value }})
    }

    handleClearLabels() {
        if (window.confirm('Clear all user defined labels?')) {
            const faders = this.props.fader
                .map((f, i) => ({ label: f.userLabel, i }))
                .filter(f => f.label)
                .reduce((a, b) => ({ ...a, [b.i]: '' }), {} as Record<string, string>)
                
            this.props.dispatch(updateLabels(faders))
            this.props.dispatch(storeShowLabelSetup())
            window.socketIoClient.emit(SOCKET_SET_LABELS, { update: faders })
        }
    }

    handleFlushLabels() {
        if (window.confirm('Flush all external (automation and channel) labels?')) {
            this.props.dispatch(flushExtLabels())
            this.props.dispatch(storeFlushChLabels())
            window.socketIoClient.emit(SOCKET_FLUSH_LABELS)
        }
    }

    handleClose = () => {
        // window.socketIoClient.emit(SOCKET_GET_PAGES_LIST)
        this.props.dispatch(storeShowLabelSetup())
    }

    handleCancel = () => {
        // window.socketIoClient.emit(SOCKET_GET_PAGES_LIST)
        this.props.dispatch(storeShowLabelSetup())
    }

    handleSave = () => {
        this.props.dispatch(updateLabels(this.state.mutations))
        this.props.dispatch(storeShowLabelSetup())
        window.socketIoClient.emit(SOCKET_SET_LABELS, { update: this.state.mutations })
    }

    renderLabelList() {
        return (
            <div>
                {this.props.fader.map((fader: IFader, index: number) => {
                    const faderLabel = fader.label || '-'
                    const channelLabel = getChannelLabel(window.reduxState, index) || '-'
                    const mutated = this.state.mutations[index]
                    
                    return (
                        <React.Fragment>
                            <label className="settings-input-field">
                                {`Fader ${index + 1} (${faderLabel}/${channelLabel}) : `}
                                <input
                                    name="fadeTime"
                                    type="text"
                                    value={mutated ?? fader.userLabel}
                                    onChange={(ev) => this.handleLabel(ev, index)}
                                />
                            </label>
                            <br />
                        </React.Fragment>
                    )
                })}
            </div>
        )
    }

    render() {
        return (
            <div className="label-settings-body">
                <h2>CUSTOM LABELS</h2>
                <button className="close" onClick={() => this.handleClose()}>
                    X
                </button>
                {this.renderLabelList()}
                <button
                    className="button"
                    onClick={() => this.handleFlushLabels()}
                >
                    FLUSH EXTERNAL
                </button>
                <button
                    className="button"
                    onClick={() => this.handleClearLabels()}
                >
                    CLEAR ALL
                </button>
                <br />
                <button
                    className="settings-cancel-button"
                    onClick={() => {
                        this.handleCancel()
                    }}
                >
                    CANCEL
                </button>
                <button
                    className="settings-save-button"
                    onClick={() => {
                        this.handleSave()
                    }}
                >
                    SAVE LABELS
                </button>
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): ILabelSettingsInjectProps => {
    return {
        customPages: state.settings[0].customPages,
        fader: state.faders[0].fader,
    }
}

export default connect<any, ILabelSettingsInjectProps>(mapStateToProps)(
    LabelSettings
) as any
