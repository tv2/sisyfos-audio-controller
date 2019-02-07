//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform

//Utils:
import { OscPresets } from '../utils/OSCPRESETS';


const oscPreset = OscPresets.reaper;

export class OscServer {
    constructor(initialStore) {
        this.sendOscMessage = this.sendOscMessage.bind(this);
        this.updateOscLevels = this.updateOscLevels.bind(this);
        this.fadeInOut = this.fadeInOut.bind(this);

        this.store = initialStore;
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.oscConnection = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: this.store.settings[0].oscPort,
            remoteAddress: this.store.settings[0].machineOscIp,
            remotePort: this.store.settings[0].machineOscPort
        });
        this.setupOscServer();

    }

    setupOscServer() {
        this.oscConnection
        .on("ready", () => {
            oscPreset.initializeCommand.map((item) => {
                this.sendOscMessage(item.oscMessage, item.value, item.type);
                console.log("Listening for OSC over UDP.");
            });
        })
        .on('message', (message) => {
            if (
                this.checkOscCommand(message.address, oscPreset.fromMixer.CHANNEL_FADER_LEVEL)
            ) {
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
                this.checkOscCommand(message.address, oscPreset.fromMixer.CHANNEL_VU)
            ) {
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_VU_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
            }
            if (
                this.checkOscCommand(message.address, oscPreset.fromMixer.CHANNEL_NAME)
            ) {
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
        console.log(`OSC listening on port ` + this.store.settings[0].oscPort );
    }


    checkOscCommand(message, command) {
        let cmdArray = command.split("{channel}");
        if (
            message.substr(0, cmdArray[0].length) === cmdArray[0] &&
            message.substr(-cmdArray[1].length) === cmdArray[1] &&
            message.length >= command.replace("{channel}", "").length
        ) {
            return true;
        } else {
            return false;
        }
    }

    sendOscMessage(oscMessage, value, type) {
        this.oscConnection.send({
            address: oscMessage,
            args: [
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
            this.sendOscMessage(
                oscPreset.toMixer.CHANNEL_OUT_GAIN.replace("{channel}", index+1),
                channel.outputLevel,
                "f"
            );
            this.sendOscMessage(
                oscPreset.toMixer.CHANNEL_FADER_LEVEL.replace("{channel}", index+1),
            channel.faderLevel,
            "f"
            );
        });
    }

    updateOscLevel(channelIndex) {
        this.fadeInOut(channelIndex);
        this.sendOscMessage(
            oscPreset.toMixer.CHANNEL_FADER_LEVEL.replace("{channel}", channelIndex+1),
            this.store.channels[0].channel[channelIndex].faderLevel,
            "f"
        );
    }

    fadeInOut (channelIndex){
        if (this.store.channels[0].channel[channelIndex].pgmOn) {
            let val = this.store.channels[0].channel[channelIndex].outputLevel;
            let timer = setInterval(() => {
                if ( val >= this.store.settings[0].fader.zero){
                    clearInterval(timer);
                } else {
                    val = val + 3*this.store.settings[0].fader.step;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendOscMessage(
                        oscPreset.toMixer.CHANNEL_OUT_GAIN.replace("{channel}", channelIndex+1),
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        } else {
            let val = this.store.channels[0].channel[channelIndex].outputLevel;
            let timer = setInterval(() => {
                if ( val <= this.store.settings[0].fader.min){
                    clearInterval(timer);
                } else {
                    val = val - 3*this.store.settings[0].fader.step;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendOscMessage(
                        oscPreset.toMixer.CHANNEL_OUT_GAIN.replace("{channel}", channelIndex+1),
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        }
    }
}

