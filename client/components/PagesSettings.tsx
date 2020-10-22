import React, { ChangeEvent } from 'react'
//@ts-ignore
import * as ClassNames from 'classnames'

import '../assets/css/ChannelRouteSettings.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import {
    storeShowPagesSetup,
    storeUpdatePagesList,
} from '../../server/reducers/settingsActions'
import { IFader } from '../../server/reducers/fadersReducer'
import Select from 'react-select'
import {
    SOCKET_GET_PAGES_LIST,
    SOCKET_SET_PAGES_LIST,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'
import { ICustomPages } from '../../server/reducers/settingsReducer'

interface IPagesSettingsInjectProps {
    customPages: ICustomPages[]
    fader: IFader[]
}

class PagesSettings extends React.PureComponent<
    IPagesSettingsInjectProps & Store
> {
    pageList: { label: string; value: number }[]
    state = { pageIndex: 0, label: '' }

    constructor(props: any) {
        super(props)

        this.pageList = this.props.customPages.map(
            (page: ICustomPages, index: number) => {
                return { label: page.label, value: index }
            }
        )
        this.setState({ label: this.props.customPages[0].label })
    }

    handleSelectPage(event: any) {
        this.setState({ pageIndex: event.value })
        this.setState({
            label: this.props.customPages[event.value].label,
        })
        console.log('PAGE SELECTED', this.state.pageIndex)
    }

    handleAssignFader(fader: number, event: any) {
        if (event.target.checked === false) {
            console.log('Unbinding Fader')
            if (
                window.confirm(
                    'Unbind Fader from page ' +
                        String(fader + 1) +
                        ' from Page ' +
                        String(this.state.pageIndex + 1)
                )
            ) {
                let nextPages: ICustomPages[] = Object.assign([], this.props.customPages)
                nextPages[this.state.pageIndex].faders.splice(
                    this.props.customPages[this.state.pageIndex].faders.indexOf(
                        fader
                    ),
                    1
                )
                window.storeRedux.dispatch(storeUpdatePagesList(nextPages))
                window.socketIoClient.emit(SOCKET_SET_PAGES_LIST, nextPages)
            }
        } else {
            console.log('Binding Channel')
            if (
                window.confirm(
                    'Bind Fader ' +
                        String(fader + 1) +
                        ' to Page ' +
                        String(this.state.pageIndex + 1) +
                        '?'
                )
            ) {
                let nextPages: ICustomPages[] = Object.assign([], this.props.customPages)
                nextPages[this.state.pageIndex].faders.push(fader)
                nextPages[this.state.pageIndex].faders.sort((a, b) => {
                    return a - b
                })
                window.storeRedux.dispatch(storeUpdatePagesList(nextPages))
                window.socketIoClient.emit(SOCKET_SET_PAGES_LIST, nextPages)
            }
        }
    }

    handleLabel = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({ label: event.target.value })
        this.pageList[this.state.pageIndex].label = this.props.customPages[
            this.state.pageIndex
        ].label
        let nextPages: ICustomPages[] = Object.assign([], this.props.customPages)
        nextPages[this.state.pageIndex].label = this.state.label

        window.storeRedux.dispatch(storeUpdatePagesList(nextPages))
        window.socketIoClient.emit(SOCKET_SET_PAGES_LIST, nextPages)
    }

    handleClearRouting() {
        if (window.confirm('REMOVE ALL FADER ASSIGNMENTS????')) {
            this.props.customPages[this.state.pageIndex].faders = []
        }
    }

    handleCancel = () => {
        window.socketIoClient.emit(SOCKET_GET_PAGES_LIST)
        this.props.dispatch(storeShowPagesSetup())
    }

    handleSave = () => {
        window.socketIoClient.emit(
            SOCKET_SET_PAGES_LIST,
            this.props.customPages
        )
        this.props.dispatch(storeShowPagesSetup())
    }

    renderFaderList() {
        return (
            <div>
                {this.props.fader.map((fader: IFader, index: number) => {
                    return (
                        <div
                            key={index}
                            className={ClassNames('channel-route-text', {
                                checked: this.props.customPages[
                                    this.state.pageIndex
                                ].faders.includes(index),
                            })}
                        >
                            {' Fader ' + (index + 1) + ' : '}
                            <input
                                type="checkbox"
                                checked={this.props.customPages[
                                    this.state.pageIndex
                                ].faders.includes(index)}
                                onChange={(event) =>
                                    this.handleAssignFader(index, event)
                                }
                            />
                            {fader.label}
                        </div>
                    )
                })}
            </div>
        )
    }

    render() {
        return (
            <div className="channel-route-body">
                <h2>CUSTOM PAGES</h2>
                <button
                    className="settings-cancel-button"
                    onClick={() => this.handleClearRouting()}
                >
                    CLEAR ALL
                </button>
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
                    SAVE SETTINGS
                </button>
                <Select
                    value={{
                        label:
                            this.props.customPages[this.state.pageIndex]
                                .label ||
                            'Page : ' + (this.state.pageIndex + 1),
                        value: this.state.pageIndex,
                    }}
                    onChange={(event: any) => this.handleSelectPage(event)}
                    options={this.pageList}
                />
                <label className="settings-input-field">
                    LABEL :
                    <input
                        name="label"
                        type="text"
                        value={this.state.label}
                        onChange={(event) => this.handleLabel(event)}
                    />
                </label>
                {this.renderFaderList()}
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IPagesSettingsInjectProps => {
    return {
        customPages: state.settings[0].customPages,
        fader: state.faders[0].fader,
    }
}

export default connect<any, IPagesSettingsInjectProps>(mapStateToProps)(
    PagesSettings
) as any
