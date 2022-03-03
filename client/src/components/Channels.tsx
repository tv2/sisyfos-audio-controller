import * as React from 'react'
import { connect } from 'react-redux'
import ClassNames from 'classnames'

import Channel from './Channel'
import '../assets/css/Channels.css'
import { Store } from 'redux'
import {
    storeSetPage,
    storeShowLabelSetup,
    storeShowPagesSetup,
    storeShowSettings,
    storeShowStorage,
} from '../../../shared/src/actions/settingsActions'
import ChannelRouteSettings from './ChannelRouteSettings'
import ChanStrip from './ChanStrip'
import ChannelMonitorOptions from './ChannelMonitorOptions'
import { IFader } from '../../../shared/src/reducers/fadersReducer'
import { IChannels } from '../../../shared/src/reducers/channelsReducer'
import {
    ICustomPages,
    IMixerSettings,
    ISettings,
    PageType,
} from '../../../shared/src/reducers/settingsReducer'
import {
    SOCKET_NEXT_MIX,
    SOCKET_CLEAR_PST,
    SOCKET_RESTART_SERVER,
    SOCKET_TOGGLE_ALL_MANUAL,
} from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import ChanStripFull from './ChanStripFull'

interface IChannelsInjectProps {
    channels: IChannels
    faders: IFader[]
    settings: ISettings
    customPages: ICustomPages[]
    mixersOnline: boolean
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
            this.props.settings.showChanStripFull !==
                nextProps.settings.showChanStripFull ||
            this.props.settings.showMonitorOptions !==
                nextProps.settings.showMonitorOptions ||
            this.props.settings.customPages !==
                nextProps.settings.customPages ||
            this.props.mixersOnline !== nextProps.mixersOnline ||
            this.props.faders.length !== nextProps.faders.length ||
            this.props.settings.currentPage !==
                nextProps.settings.currentPage ||
            this.props.settings.numberOfCustomPages !==
                nextProps.settings.numberOfCustomPages ||
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
        this.props.dispatch(storeShowSettings())
    }

    handleShowStorage() {
        this.props.dispatch(storeShowStorage())
    }

    handleShowPagesSetting() {
        this.props.dispatch(storeShowPagesSetup())
    }

    handleShowLabelSetting() {
        this.props.dispatch(storeShowLabelSetup())
    }

    handlePages(type: PageType, i: number | string) {
        this.props.dispatch(storeSetPage(type, i))
    }

    renderPageButtons() {
        if (this.props.settings.enablePages === false) {
            return undefined
        }

        const curPage = this.props.settings.currentPage

        const customPageButtons = []
        const pages = this.props.customPages
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

        const isAllActive = curPage.type === PageType.All
        return (
            <React.Fragment>
                {customPageButtons}
                {/*numberedButtons*/}
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
        switch (curPage.type) {
            case PageType.All:
                return this.props.faders.map((value, index) => (
                    <Channel faderIndex={index} key={index} />
                ))
            case PageType.CustomPage:
                let pageIndex: number = this.props.customPages
                    .map((item: ICustomPages) => item.id)
                    .indexOf(curPage.id || '')
                return this.props.customPages[pageIndex].faders
                    .filter((value) => {
                        return (
                            value >= 0 &&
                            value < this.props.settings.numberOfFaders
                        )
                    })
                    .map((faderIndex, index) => {
                        return (
                            <Channel key={faderIndex} faderIndex={faderIndex} />
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
                {this.props.settings.showChanStripFull >= 0 ? (
                    <ChanStripFull
                        faderIndex={this.props.settings.showChanStripFull}
                    />
                ) : (
                    <div></div>
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
                        {this.props.mixersOnline ? (
                            <button
                                className={ClassNames(
                                    'button half channels-show-mixer-online',
                                    {
                                        connected: this.props.mixersOnline,
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
                                        connected: this.props.mixersOnline,
                                    }
                                )}
                                onClick={() => {
                                    this.handleReconnect()
                                }}
                            >
                                RESTART SERVER
                            </button>
                        )}

                        {window.location.search.includes('settings=1') ? (
                            <button
                                className="button half channels-show-settings-button"
                                onClick={() => {
                                    this.handleShowSettings()
                                }}
                            >
                                SETTINGS
                            </button>
                        ) : null}

                        <button
                            className="button half channels-show-storage-button"
                            onClick={() => {
                                this.handleShowStorage()
                            }}
                        >
                            STORAGE
                        </button>

                        {window.location.search.includes('settings=1') ? (
                            <button
                                className="button half channels-show-settings-button"
                                onClick={() => {
                                    this.handleShowPagesSetting()
                                }}
                            >
                                PAGES SETUP
                            </button>
                        ) : null}

                        {window.location.search.includes('settings=1') ? (
                            <button
                                className="button half channels-show-settings-button"
                                onClick={() => {
                                    this.handleShowLabelSetting()
                                }}
                            >
                                LABELS
                            </button>
                        ) : null}
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
        channels: state.channels[0].chMixerConnection[0].channel,
        faders: state.faders[0].fader,
        customPages: state.settings[0].customPages,
        settings: state.settings[0],
        mixersOnline: state.settings[0].mixers
            .map((m: IMixerSettings) => m.mixerOnline)
            .reduce((a: boolean, b: boolean) => a && b),
    }
}

export default connect<IChannelsInjectProps, any, any>(mapStateToProps)(
    Channels
)
