//Node Modules:
import React, { PureComponent } from 'react';
import os from 'os'; // Used to display (log) network addresses on local machine
import osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform
import { connect } from "react-redux";

//Utils:
import * as DEFAULTS from '../utils/DEFAULTS';

export class OscServer {
    constructor() {
        this.sendOscMessage = this.sendOscMessage.bind(this);
        this.updateOscLevels = this.updateOscLevels.bind(this);
        this.fadeInOut = this.fadeInOut.bind(this);

        this.oscConnection = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: DEFAULTS.DEFAULT_OSC_PORT,
            remoteAddress: "0.0.0.0",
            remotePort: DEFAULTS.DEFAULT_MACHINE_OSC_PORT
        });
        this.setupOscServer();

        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });
    }

    setupOscServer() {
        this.oscConnection
        .on("ready", () => {
            let ipAddresses = this.getThisMachineIpAddresses();

            console.log("Listening for OSC over UDP.");
            ipAddresses.forEach((address) => {
                console.log("OSC Host:", address + ", Port:", this.oscConnection.options.localPort);
            });
        })
        .on('message', (message) => {
            if (message.address.substr(-6) === 'volume') {
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
                if (this.store.channels[0].channel[ch - 1].pgmOn) {
                    this.updateOscLevel(ch-1);
                }
            }
            if (
                message.address.substr(-2) === 'vu' &&
                message.address.substr(0, 6) === "/track" &&
                message.address.length > 9
            ) {
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_VU_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
            }
            if (message.address.substr(-4) ==="name") {
                    let ch = message.address.split("/")[2];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: ch - 1,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            }

        })
        .on('error', () => {
            console.log("Lost OSC connection");
        });

        this.oscConnection.open();
        console.log(`OSC listening on port ` + DEFAULTS.DEFAULT_OSC_PORT );
    }

    sendOscMessage(oscAddress, value, type) {
        this.oscConnection.send({
            address: oscAddress,
            args: [
                {
                    type: type,
                    value: value
                },
                {
                    type: type,
                    value: value
                }
            ]
        });
    }

    updateOscLevels() {
        this.store.channels[0].channel.map((channel, index) => {
            this.fadeInOut(index);
            this.sendOscMessage("/track/" + (index +1 ) + "/fx/1/fxparam/1/value",
            channel.outputLevel,
            "f"
            );
            this.sendOscMessage("/track/" + (index +1 ) + "/volume",
            channel.faderLevel,
            "f"
            );
        });
    }

    updateOscLevel(channelIndex) {
        this.fadeInOut(channelIndex);
        this.sendOscMessage(
            "/track/" + (channelIndex + 1 ) + "/volume",
            this.store.channels[0].channel[channelIndex].faderLevel,
            "f"
        );
    }

    fadeInOut (channelIndex){
        if (this.store.channels[0].channel[channelIndex].pgmOn) {
            let val = this.store.channels[0].channel[channelIndex].outputLevel;
            let timer = setInterval(() => {
                if ( val >= DEFAULTS.ZERO_FADER){
                    clearInterval(timer);
                } else {
                    val = val + 3*DEFAULTS.STEP_FADER;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendOscMessage(
                        "/track/" + (channelIndex + 1 ) + "/fx/1/fxparam/1/value",
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        } else {
            let val = this.store.channels[0].channel[channelIndex].outputLevel;
            let timer = setInterval(() => {
                if ( val <= DEFAULTS.MIN_FADER){
                    clearInterval(timer);
                } else {
                    val = val - 3*DEFAULTS.STEP_FADER;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendOscMessage(
                        "/track/" + (channelIndex + 1 ) + "/fx/1/fxparam/1/value",
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        }
    }

    getThisMachineIpAddresses() {
        let interfaces = os.networkInterfaces();
        let ipAddresses = [];
        for (let deviceName in interfaces) {
            let addresses = interfaces[deviceName];
            for (let i = 0; i < addresses.length; i++) {
                let addressInfo = addresses[i];
                if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                    ipAddresses.push(addressInfo.address);
                }
            }
        }
        return ipAddresses;
    }

}

