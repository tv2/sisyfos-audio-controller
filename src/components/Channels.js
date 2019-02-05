import React, { PureComponent } from 'react';
import { connect } from "react-redux";

import Channel from './Channel';

//Utils:
import * as DEFAULTS from '../utils/DEFAULTS';
import '../assets/css/Channels.css';





class Channels extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }

    handleMix() {
        this.props.dispatch({
            type:'X_MIX'
        });
        this.props.oscServer.updateOscLevels();
    }

    handleSnapMix(snapIndex) {
        this.props.dispatch({
            type:'SNAP_MIX',
            snapIndex: snapIndex
        });
        this.props.oscServer.updateOscLevels();
    }

    snapMixButton(snapIndex) {
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
            {this.props.store.channelsReducer[0].channel.map((none, index) => {
                return <Channel
                            channelIndex = {index}
                            key={index}
                            oscServer = { this.props.oscServer}
                        />
                })
            }
            <br/>
            <div className="channels-mix-body">
                <button
                    className="channels-mix-button"
                    style = {{backgroundColor: "green"}}
                    onClick={() => {
                        this.handleMix();
                    }}
                >TAKE</button>
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


const mapStateToProps = (state) => {
    return {
        store: state
    }
}

export default connect(mapStateToProps)(Channels);
