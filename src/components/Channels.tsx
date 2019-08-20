import * as React from 'react';
import { connect } from "react-redux";

import Channel from './Channel';
import '../assets/css/Channels.css';
import { Store } from 'redux';
import { IAppProps } from './App';
import ChannelRouteSettings from './ChannelRouteSettings';

class Channels extends React.Component<IAppProps & Store> {
    constructor(props: any) {
        super(props);
    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return this.props.store.settings[0].showOptions !== nextProps.store.settings[0].showOptions;
    }


    handleMix() {
        this.props.dispatch({
            type:'X_MIX'
        });
        window.mixerGenericConnection.updateOutLevels();
    }

    handleClearAllChannels() {
        this.props.dispatch({
            type:'FADE_TO_BLACK'
        });
        window.mixerGenericConnection.updateOutLevels();
    }

    handleSnapMix(snapIndex: number) {
        this.props.dispatch({
            type:'SNAP_RECALL',
            snapIndex: snapIndex
        });
        window.mixerGenericConnection.updateOutLevels();
    }

    handleShowSnaps() {
        this.props.dispatch({
            type:'TOGGLE_SHOW_SNAPS',
        });
    }


    handleShowSettings() {
        this.props.dispatch({
            type:'TOGGLE_SHOW_SETTINGS',
        });
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
            {(typeof this.props.store.settings[0].showOptions === "number") ?
                <ChannelRouteSettings faderIndex={this.props.store.settings[0].showOptions}/>
                :
                ""
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
                    className="channels-show-snaps-button"
                    onClick={() => {
                        this.handleShowSnaps();
                    }}
                >SNAPS</button>
                <button
                    className="channels-show-settings-button"
                    onClick={() => {
                        this.handleShowSettings();
                    }}
                >SETTINGS</button>
                <button
                    className="channels-mix-button"
                    onClick={() => {
                        this.handleMix();
                    }}
                >TAKE</button>
                <button
                    className="channels-clear-button"
                    onClick={() => {
                        this.handleClearAllChannels();
                    }}
                >CLEAR PGM</button>
                <br/>
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
