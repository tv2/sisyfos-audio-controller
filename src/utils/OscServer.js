//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform

//Utils:
import { OscPresets } from '../utils/OSCPRESETS';
import { behringerMeter } from '../utils/productSpecific/behringer';

export class OscServer {
    constructor(initialStore) {
        this.sendOscMessage = this.sendOscMessage.bind(this);
        this.updateOscLevels = this.updateOscLevels.bind(this);
        this.fadeInOut = this.fadeInOut.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = initialStore;
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.oscPreset = OscPresets[this.store.settings[0].oscPreset];

        this.oscConnection = new osc.UDPPort({
            localAddress: this.store.settings[0].localOscIp,
            localPort: parseInt(this.store.settings[0].localOscPort),
            remoteAddress: this.store.settings[0].machineOscIp,
            remotePort: parseInt(this.store.settings[0].machineOscPort)
        });
        this.setupOscServer();
    }

    setupOscServer() {
        this.oscConnection
        .on("ready", () => {
            this.oscPreset.initializeCommand.map((item) => {
                this.sendOscMessage(item.oscMessage, 1, item.value, item.type);
                console.log("Listening for OSC over UDP.");
            });
        })
        .on('message', (message) => {
            if (
                this.checkOscCommand(message.address, this.oscPreset.fromMixer.CHANNEL_FADER_LEVEL)
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
                this.checkOscCommand(message.address, this.oscPreset.fromMixer.CHANNEL_VU)
            ) {
                if (this.store.settings[0].oscPreset === 'behringer') {
                    behringerMeter(message.args);
                } else {
                    let ch = message.address.split("/")[2];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                }
            }
            if (
                this.checkOscCommand(message.address, this.oscPreset.fromMixer.CHANNEL_NAME)
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
        .on('error', (error) => {
            console.log("Error : ", error);
            console.log("Lost OSC connection");
        });

        this.oscConnection.open();
        console.log(`OSC listening on port ` + this.store.settings[0].oscPort );

        //Ping OSC mixer if OSCpreset needs it.
        if (this.oscPreset.pingTime > 0) {
            let oscTimer = setInterval(
                this.pingMixerCommand(),
                this.oscPreset.pingTime
            );
        }
    }

    pingMixerCommand() {
        //Ping OSC mixer if OSCpreset needs it.
        this.oscPreset.pingCommand.map((command) => {
            this.sendOscMessage(
                command.oscMessage,
                0,
                command.value,
                command.type
            );
        });
    }


    checkOscCommand(message, command) {
        if (message === command) return true;

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

    sendOscMessage(oscMessage, channel, value, type) {
        let channelString = this.oscPreset.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        let message = oscMessage.replace(
                "{channel}",
                channelString
            );
        if (message != 'none') {
            this.oscConnection.send({
                address: message,
                args: [
                    {
                        type: type,
                        value: value
                    }
                ]
            });
        }
    }

    updateOscLevels() {
        this.store.channels[0].channel.map((channel, index) => {
            this.updateOscLevel(index);
        });
    }

    updateOscLevel(channelIndex) {
        this.fadeInOut(channelIndex);
        if (this.oscPreset.mode === "master" && this.store.channels[0].channel[channelIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
                channel: channelIndex,
                level: this.store.channels[0].channel[channelIndex].faderLevel
            });
        }
        this.sendOscMessage(
            this.oscPreset.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].outputLevel,
            "f"
        );
        this.sendOscMessage(
            this.oscPreset.toMixer.CHANNEL_FADER_LEVEL,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].faderLevel,
            "f"
        );
    }

    fadeInOut (channelIndex){
        if (this.store.channels[0].channel[channelIndex].pgmOn) {
            let val = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);

            let targetVal = this.store.settings[0].fader.zero;
            if (this.oscPreset.mode === "master") {
                targetVal = parseFloat(this.store.channels[0].channel[channelIndex].faderLevel);
            }

            let timer = setInterval(() => {
                if ( val >= targetVal){
                    clearInterval(timer);
                } else {
                    val = val + 3*this.store.settings[0].fader.step;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendOscMessage(
                        this.oscPreset.toMixer.CHANNEL_OUT_GAIN,
                        channelIndex+1,
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
                        this.oscPreset.toMixer.CHANNEL_OUT_GAIN,
                        channelIndex+1,
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        }
    }
}

