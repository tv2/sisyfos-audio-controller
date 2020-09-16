import * as React from 'react'
import { connect } from 'react-redux'
//@ts-ignore
import * as ClassNames from 'classnames'

import Channel from './Channel'
import '../assets/css/Channels.css'
import { Store } from 'redux'
import {
    TOGGLE_SHOW_SETTINGS,
    TOGGLE_SHOW_STORAGE,
    SET_PAGE,
} from '../../server/reducers/settingsActions'
import ChannelRouteSettings from './ChannelRouteSettings'
import ChanStrip from './ChanStrip'
import ChannelMonitorOptions from './ChannelMonitorOptions'
import { IChannels } from '../../server/reducers/channelsReducer'
import { IFader } from '../../server/reducers/fadersReducer'
import { ISettings, PageType } from '../../server/reducers/settingsReducer'
import {
    SOCKET_NEXT_MIX,
    SOCKET_CLEAR_PST,
    SOCKET_RESTART_SERVER,
    SOCKET_TOGGLE_ALL_MANUAL,
} from '../../server/constants/SOCKET_IO_DISPATCHERS'

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

    public shouldComponentUpdate(nextProps: IChannelsInjectProps) {
        return (
            this.props.settings.showOptions !==
                nextProps.settings.showOptions ||
            this.props.settings.showChanStrip !==
                nextProps.settings.showChanStrip ||
            this.props.settings.showMonitorOptions !==
                nextProps.settings.showMonitorOptions ||
            this.props.settings.mixerOnline !==
                nextProps.settings.mixerOnline ||
            this.props.faders.length !== nextProps.faders.length ||
            this.props.settings.currentPage !==
                nextProps.settings.currentPage ||
            this.props.settings.pageLength !== nextProps.settings.pageLength ||
            !!nextProps.faders.find(
                (f, i) =>
                    this.props.faders[i].ignoreAutomation !== f.ignoreAutomation
            )
        )
    }

    handleMix() {
        window.socketIoClient.emit(SOCKET_NEXT_MIX)
    }

    handleClearAllPst() {
        window.socketIoClient.emit(SOCKET_CLEAR_PST)
    }

    handleAllManual() {
        window.socketIoClient.emit(SOCKET_TOGGLE_ALL_MANUAL)
    }

    handleReconnect() {
        if (window.confirm('Are you sure you will restart server?')) {
            window.socketIoClient.emit(SOCKET_RESTART_SERVER)
        }
    }

    handleShowSettings() {
        this.props.dispatch({
            type: TOGGLE_SHOW_SETTINGS,
        })
    }

    handleShowStorage() {
        this.props.dispatch({
            type: TOGGLE_SHOW_STORAGE,
        })
    }

    handlePages(type: PageType, i: number | string) {
        if (typeof i === 'string') {
            this.props.dispatch({
                type: SET_PAGE,
                pageType: type,
                id: i,
            })
        } else {
            this.props.dispatch({
                type: SET_PAGE,
                pageType: type,
                start: i * this.props.settings.pageLength,
            })
        }
    }

    renderPageButtons() {
        if (this.props.settings.enablePages === false) {
            return undefined
        }

        const curPage = this.props.settings.currentPage

        const customPageButtons = []
        const pages = window.customPagesList
        if (pages) {
            for (const p of pages) {
                const isActive =
                    curPage.type === PageType.CustomPage && curPage.id === p.id
                customPageButtons.push(
                    <button
                        className={ClassNames('button half', {
                            active: isActive,
                        })}
                        onClick={() => {
                            this.handlePages(PageType.CustomPage, p.id)
                        }}
                    >
                        {p.label}
                    </button>
                )
            }
        }

        const numberedButtons = []
        const numberOfFaders = this.props.settings.numberOfFaders
        const pageLength = this.props.settings.pageLength
        for (let i = 0; i < Math.ceil(numberOfFaders / pageLength); i++) {
            const isActive =
                curPage.type === PageType.NumberedPage &&
                curPage.start === i * this.props.settings.pageLength
            numberedButtons.push(
                <button
                    className={ClassNames('button half', {
                        active: isActive,
                    })}
                    onClick={() => {
                        this.handlePages(PageType.NumberedPage, i)
                    }}
                >
                    CH{i * pageLength + 1}-
                    {Math.min((i + 1) * pageLength, numberOfFaders)}
                </button>
            )
        }

        const isAllActive = curPage.type === PageType.All
        return (
            <React.Fragment>
                {customPageButtons}
                {numberedButtons}
                <button
                    className={ClassNames('button half', {
                        active: isAllActive,
                    })}
                    onClick={() => {
                        this.handlePages(PageType.All, 0)
                    }}
                >
                    ALL
                </button>
            </React.Fragment>
        )
    }

    renderAllManualButton() {
        // TODO - ignore disabled / hidden faders?
        const isAllManual =
            this.props.faders.find((f) => f.ignoreAutomation !== true) ===
            undefined
        const isAnyManual = !!this.props.faders.find(
            (f) => f.ignoreAutomation === true
        )

        console.log('all manual', isAllManual, 'any manual', isAnyManual)

        return (
            <React.Fragment>
                <button
                    className={ClassNames('button button-all-manual', {
                        all: isAllManual,
                        any: isAnyManual && !isAllManual,
                    })}
                    onClick={() => {
                        this.handleAllManual()
                    }}
                >
                    MANUAL CONTROL
                </button>
            </React.Fragment>
        )
    }

    renderFaders() {
        const curPage = this.props.settings.currentPage
        const pageLength = this.props.settings.pageLength
        switch (curPage.type) {
            case PageType.All:
                return this.props.faders.map((value, index) => (
                    <Channel faderIndex={index} key={index} />
                ))
            case PageType.NumberedPage:
                return this.props.faders
                    .slice(
                        curPage.start,
                        Number(curPage.start!) + Number(pageLength)
                    )
                    .map((value, index) => (
                        <Channel
                            faderIndex={index + curPage.start!}
                            key={index + curPage.start!}
                        />
                    ))
            case PageType.CustomPage:
                const page = window.customPagesList.find(
                    (page) => page.id === curPage.id
                )
                if (!page) return

                return page.faders
                    .filter((value) => {
                        return (
                            value >= 0 &&
                            value < this.props.settings.numberOfFaders
                        )
                    })
                    .map((faderIndex, index) => {
                        return (
                            <Channel
                                faderIndex={faderIndex}
                                key={page.id + index}
                            />
                        )
                    })
        }
    }

    render() {
        return (
            <div className="channels-body">
                {typeof this.props.settings.showOptions === 'number' ? (
                    <ChannelRouteSettings
                        faderIndex={this.props.settings.showOptions}
                    />
                ) : null}
                {this.props.settings.showChanStrip >= 0 ? (
                    <div className="openChanStrip">
                        <ChanStrip
                            faderIndex={this.props.settings.showChanStrip}
                        />
                    </div>
                ) : (
                    <div className="closedChanStrip">
                        <ChanStrip
                            faderIndex={this.props.settings.showChanStrip}
                        />
                    </div>
                )}
                {this.props.settings.showMonitorOptions >= 0 ? (
                    <ChannelMonitorOptions
                        faderIndex={this.props.settings.showMonitorOptions}
                    />
                ) : null}
                <div className="channels-body-inner">{this.renderFaders()}</div>
                <br />
                <div className="channels-mix-body">
                    <div className="top">
                        {this.props.settings.mixerOnline ? (
                            <button
                                className={ClassNames(
                                    'button half channels-show-mixer-online',
                                    {
                                        connected: this.props.settings
                                            .mixerOnline,
                                    }
                                )}
                                onClick={() => {
                                    this.handleReconnect()
                                }}
                            >
                                MIXER ONLINE
                            </button>
                        ) : (
                            <button
                                className={ClassNames(
                                    'button half channels-show-mixer-online',
                                    {
                                        connected: this.props.settings
                                            .mixerOnline,
                                    }
                                )}
                                onClick={() => {
                                    this.handleReconnect()
                                }}
                            >
                                RESTART SERVER
                            </button>
                        )}

                        {window.location.search.includes(
                            'settings=0'
                        ) ? null : (
                            <button
                                className="button half channels-show-settings-button"
                                onClick={() => {
                                    this.handleShowSettings()
                                }}
                            >
                                SETTINGS
                            </button>
                        )}
                        {window.location.search.includes(
                            'settings=0'
                        ) ? null : (
                            <button
                                className="button channels-show-storage-button"
                                onClick={() => {
                                    this.handleShowStorage()
                                }}
                            >
                                STORAGE
                            </button>
                        )}
                    </div>
                    <div className="mid">
                        {this.renderAllManualButton()}
                        {!this.props.settings.showPfl && (
                            <React.Fragment>
                                <button
                                    className="button channels-clear-button"
                                    onClick={() => {
                                        this.handleClearAllPst()
                                    }}
                                >
                                    CLEAR NEXT
                                </button>
                                <button
                                    className="button channels-mix-button"
                                    onClick={() => {
                                        this.handleMix()
                                    }}
                                >
                                    NEXT TAKE
                                </button>
                            </React.Fragment>
                        )}
                    </div>
                    <div className="bot">{this.renderPageButtons()}</div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: any): IChannelsInjectProps => {
    return {
        channels: state.channels[0].channel,
        faders: state.faders[0].fader,
        settings: state.settings[0],
    }
}

export default connect<IChannelsInjectProps, any, any>(mapStateToProps)(
    Channels
)
