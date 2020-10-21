import React from 'react'
//@ts-ignore
import * as ClassNames from 'classnames'

import '../assets/css/ChannelRouteSettings.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { storeShowPagesSetup } from '../../server/reducers/settingsActions'
import { IFader } from '../../server/reducers/fadersReducer'
import Select from 'react-select'
import { ICustomPages } from '..'

interface IPagesSettingsInjectProps {
    fader: IFader[]
}

interface IPagesProps {
    pageIndex: number
}

class PagesSettings extends React.PureComponent<
    IPagesProps & IPagesSettingsInjectProps & Store
> {
    pageIndex: number
    pageList: { label: string; value: number }[]

    constructor(props: any) {
        super(props)
        this.pageIndex = 0 // this.props.pageIndex
        this.pageList = window.customPagesList.map(
            (page: ICustomPages, index: number) => {
                return { label: page.label, value: index }
            }
        )
    }

    handleSelectPage(event: any) {
        this.pageIndex = event.value
        console.log('PAGE SELECTED', this.pageIndex)
    }

    handleAssignFader(fader: number, event: any) {
        if (event.target.checked === false) {
            console.log('Unbinding Fader')
            if (
                window.confirm(
                    'Unbind Fader from page ' +
                        String(fader + 1) +
                        ' from Page ' +
                        String(this.pageIndex + 1)
                )
            ) {
                window.customPagesList[this.pageIndex].faders.splice(
                    window.customPagesList[this.pageIndex].faders.indexOf(
                        fader
                    ),
                    1
                )
            }
        } else {
            console.log('Binding Channel')
            if (
                window.confirm(
                    'Bind Fader ' +
                        String(fader + 1) +
                        ' to Page ' +
                        String(this.pageIndex + 1) +
                        '?'
                )
            ) {
                window.customPagesList[this.pageIndex].faders.push(fader)
                window.customPagesList[this.pageIndex].faders.sort((a, b) => {
                    return a - b
                })
            }
        }
    }

    handleClearRouting() {
        if (window.confirm('REMOVE ALL FADER ASSIGNMENTS????')) {
            window.customPagesList[this.pageIndex].faders = []
        }
    }

    handleClose = () => {
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
                                checked: window.customPagesList[
                                    this.pageIndex
                                ].faders.includes(index),
                            })}
                        >
                            {' Fader ' + (index + 1) + ' : '}
                            <input
                                type="checkbox"
                                checked={window.customPagesList[
                                    this.pageIndex
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
                <Select
                    value={{
                        label:
                            window.customPagesList[this.pageIndex].label ||
                            'Page : ' + (this.pageIndex + 1),
                        value: this.pageIndex,
                    }}
                    onChange={(event: any) => this.handleSelectPage(event)}
                    options={this.pageList}
                />
                'Page : ' + (this.pageIndex + 1)}
                <button className="close" onClick={() => this.handleClose()}>
                    X
                </button>
                <button
                    className="button"
                    onClick={() => this.handleClearRouting()}
                >
                    CLEAR ALL
                </button>
                {this.renderFaderList()}
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): IPagesSettingsInjectProps => {
    return {
        fader: state.faders[0].fader,
    }
}

export default connect<any, IPagesSettingsInjectProps>(mapStateToProps)(
    PagesSettings
) as any
