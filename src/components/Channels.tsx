import * as React from 'react';
import { connect } from "react-redux";
//@ts-ignore
import * as ClassNames from 'classnames';

import Channel from './Channel';
import '../assets/css/Channels.css';
import { Store } from 'redux';
import { 
    X_MIX,
    NEXT_MIX,
    CLEAR_PST,
    SNAP_RECALL
} from  '../reducers/faderActions'
import {
    TOGGLE_SHOW_SETTINGS,
    TOGGLE_SHOW_SNAPS,
    TOGGLE_SHOW_STORAGE
} from '../reducers/settingsActions'
import { IAppProps } from './App';
import ChannelRouteSettings from './ChannelRouteSettings';
import ChanStrip from './ChanStrip'
import ChannelMonitorOptions from './ChannelMonitorOptions';
const { dialog } = require('electron').remote;


class Channels extends React.Component<IAppProps & Store> {
    constructor(props: any) {
        super(props);
        this.props.store.settings[0].showChanStrip = -1
    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return this.props.store.settings[0].showOptions !== nextProps.store.settings[0].showOptions 
        || this.props.store.settings[0].showChanStrip !== nextProps.store.settings[0].showChanStrip
        || this.props.store.settings[0].mixerOnline !== nextProps.store.settings[0].mixerOnline;
    }


    handleMix() {
        if (this.props.store.settings[0].automationMode) {
            this.props.dispatch({
                type: NEXT_MIX
            });
        } else {
            this.props.dispatch({
                type: X_MIX
            });
        }
        window.mixerGenericConnection.updateOutLevels();
    }

    handleClearAllPst() {
        this.props.dispatch({
            type: CLEAR_PST
        });
        window.mixerGenericConnection.updateOutLevels();
    }

    handleSnapMix(snapIndex: number) {
        this.props.dispatch({
            type: SNAP_RECALL,
            snapIndex: snapIndex
        });
        window.mixerGenericConnection.updateOutLevels();
    }

    handleShowSnaps() {
        this.props.dispatch({
            type: TOGGLE_SHOW_SNAPS,
        });
    }

    handleReconnect() {
        location.reload();
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

    saveFile() {
        const options = {
            type: 'saveFile',
            title: 'Save Current Setup',
            message: 'Stores the current state of Sisyfos - including Fader-Channel Routing',
        };
        let response = dialog.showSaveDialogSync(options)
        if (response === 'save') {
            console.log('SAVING CURRENT STATE')
        }
    }

    loadFile() {
        const options = {
            type: 'loadFile',
            title: 'Load selected file',
            message: 'Loading Fader and Channels state',
        };
        let response = dialog.showOpenDialogSync(options)
        console.log('LOAD STATE? :', response)
    }

    snapMixButton(snapIndex: number) {
        return (
            <div key={snapIndex} className="channels-snap-mix-line">
                <button
                    className="channels-snap-mix-button"
                    onClick={event => {
                        this.handleSnapMix(snapIndex);
                    }}
                >SNAP {snapIndex + 1 }</button>
                <br/>
            </div>
        )
    }

    render() {
        return (
        <div className="channels-body">
            {(typeof this.props.store.settings[0].showOptions === 'number') ?
                <ChannelRouteSettings faderIndex={this.props.store.settings[0].showOptions}/>
                :
                null
            }
            {(this.props.store.settings[0].showChanStrip >= 0) ?
                <ChanStrip faderIndex={this.props.store.settings[0].showChanStrip}/>
                :
                null
            }
            {(this.props.store.settings[0].showMonitorOptions >= 0) ?
                <ChannelMonitorOptions faderIndex={this.props.store.settings[0].showMonitorOptions}/>
                :
                null
            }
            {this.props.store.faders[0].fader.map((none: any, index: number) => {
                return <Channel
                            channelIndex = {index}
                            key={index}
                        />
                })
            }
            <br/>
            <div className="channels-mix-body">
            <button
                className={
                    ClassNames("channels-show-mixer-online", {
                    "connected": this.props.store.settings[0].mixerOnline
                })}
                onClick={() => {
                    this.handleReconnect();
                }}
            >{this.props.store.settings[0].mixerOnline ? 'MIXER ONLINE' : 'RECONNECT'}</button>
            
            {(this.props.store.settings[0].automationMode ||
                  this.props.store.settings[0].offtubeMode) ?
                    null 
                    : <React.Fragment>
                        {<button
                            className="channels-show-snaps-button"
                            onClick={() => {
                                this.handleShowSnaps();
                            }}
                        >SNAPS
                        </button>}
                        <br />
                    </React.Fragment>
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

                {(this.props.store.settings[0].automationMode ||
                  this.props.store.settings[0].offtubeMode) ?
                    null 
                    : <React.Fragment>
                        <div className="channels-snap-mix-body">
                            {this.snapMixButton(0)}
                            {this.snapMixButton(1)}
                            {this.snapMixButton(2)}
                            {this.snapMixButton(3)}
                            {this.snapMixButton(4)}
                            {this.snapMixButton(5)}
                            {this.snapMixButton(6)}
                            {this.snapMixButton(7)}
                        </div>
                    </React.Fragment>
                }
            </div>
        </div>
        )
    }
}


const mapStateToProps = (state: any): IAppProps => {
    return {
        store: state
    }
}

export default connect<IAppProps, any, any>(mapStateToProps)(Channels);
