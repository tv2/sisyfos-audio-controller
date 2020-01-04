import * as React from 'react';
import { connect } from "react-redux";
//@ts-ignore
import * as ClassNames from 'classnames';

import Channel from './Channel';
import '../assets/css/Channels.css';
import { Store } from 'redux';
import {
    TOGGLE_SHOW_SETTINGS,
    TOGGLE_SHOW_STORAGE
} from '../../server/reducers/settingsActions'
import ChannelRouteSettings from './ChannelRouteSettings';
import ChanStrip from './ChanStrip'
import ChannelMonitorOptions from './ChannelMonitorOptions';
import { IChannels } from '../../server/reducers/channelsReducer';
import { IFader } from '../../server/reducers/fadersReducer';
import { ISettings } from '../../server/reducers/settingsReducer';
import { SOCKET_NEXT_MIX, SOCKET_CLEAR_PST, SOCKET_RESTART_SERVER } from '../../server/constants/SOCKET_IO_DISPATCHERS';

interface IChannelsInjectProps {
    channels: IChannels 
    faders: IFader[]
    settings: ISettings
}

class Channels extends React.Component<IChannelsInjectProps & Store> {
    constructor(props: any) {
        super(props);
        this.props.settings.showMonitorOptions = -1
    }

    public shouldComponentUpdate(nextProps: IChannelsInjectProps) {
        return this.props.settings.showOptions !== nextProps.settings.showOptions 
        || this.props.settings.showChanStrip !== nextProps.settings.showChanStrip
        || this.props.settings.showMonitorOptions !== nextProps.settings.showMonitorOptions
        || this.props.settings.mixerOnline !== nextProps.settings.mixerOnline
        || this.props.faders.length !== nextProps.faders.length;
    }

    handleMix() {
        window.socketIoClient.emit(SOCKET_NEXT_MIX)
    }

    handleClearAllPst() {
        window.socketIoClient.emit(SOCKET_CLEAR_PST)
    }

    handleReconnect() {
        if (window.confirm('Are you sure you will restart server?')) {
            window.socketIoClient.emit(SOCKET_RESTART_SERVER)
        }
    }


    handleShowSettings() {
        this.props.dispatch({
            type: TOGGLE_SHOW_SETTINGS,
        });
    }

    handleShowStorage() {
        this.props.dispatch({
            type: TOGGLE_SHOW_STORAGE,
        });
    }

    render() {
        return (
        <div className="channels-body">
            {(typeof this.props.settings.showOptions === 'number') ?
                <ChannelRouteSettings faderIndex={this.props.settings.showOptions}/>
                :
                null
            }
            {(this.props.settings.showChanStrip >= 0) ?
                <ChanStrip faderIndex={this.props.settings.showChanStrip}/>
                :
                null
            }
            {(this.props.settings.showMonitorOptions >= 0) ?
                <ChannelMonitorOptions faderIndex={this.props.settings.showMonitorOptions}/>
                :
                null
            }
            {this.props.faders.map((none: any, index: number) => {
                return <Channel
                            faderIndex = {index}
                            key={index}
                        />
                })
            }
            <br/>
            <div className="channels-mix-body">
                {this.props.settings.mixerOnline ?
                <button
                    className={
                        ClassNames("channels-show-mixer-online", {
                        "connected": this.props.settings.mixerOnline
                    })}
                    onClick={() => {
                        this.handleReconnect()
                    }}
                >
                    MIXER ONLINE
                </button>
                :
                <button
                    className={
                        ClassNames("channels-show-mixer-online", {
                        "connected": this.props.settings.mixerOnline
                    })}
                    onClick={() => {
                        this.handleReconnect()
                    }}
                >
                    RESTART SERVER
                </button>
                }
                
                <button
                    className="channels-show-settings-button"
                    onClick={() => {
                        this.handleShowSettings();
                    }}
                >SETTINGS</button>

                <button
                    className="channels-show-storage-button"
                    onClick={() => {
                        this.handleShowStorage();
                    }}
                >STORAGE</button>

                <button
                    className="channels-clear-button"
                    onClick={() => {
                        this.handleClearAllPst();
                    }}
                >CLEAR NEXT</button>
                <br/>

                {<button
                    className="channels-mix-button"
                    onClick={() => {
                        this.handleMix();
                    }}
                >NEXT TAKE
                </button>}
                <br />
            </div>
        </div>
        )
    }
}


const mapStateToProps = (state: any):  IChannelsInjectProps => {
    return {
        channels: state.channels[0].channel,
        faders: state.faders[0].fader,
        settings: state.settings[0]
    }
}

export default connect<IChannelsInjectProps, any, any>(mapStateToProps)(Channels);
