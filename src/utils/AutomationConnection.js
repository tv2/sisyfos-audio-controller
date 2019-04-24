//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform

//Utils:
import { AutomationPresets } from '../constants/AutomationPresets';
import { behringerMeter } from './productSpecific/behringer';
import { midasMeter } from './productSpecific/midas';

export class AutomationConnection {
    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.AutomationProtocol = AutomationPresets[this.store.settings[0].automationProtocol]  || AutomationPresets.sofie;

        this.oscConnection = new osc.UDPPort({
            localAddress: this.store.settings[0].localOscIp,
            localPort: parseInt(this.store.settings[0].localOscPort),
            remoteAddress: this.store.settings[0].machineOscIp,
            remotePort: parseInt(this.store.settings[0].machineOscPort)
        });
        this.setupMixerConnection();
    }

    setupMixerConnection() {
        this.oscConnection
        .on("ready", () => {
            this.mixerProtocol.initializeCommand.map((item) => {
                this.sendOutMessage(item.oscMessage, 1, item.value, item.type);
                console.log("Listening for OSC over UDP.");
            });
        })
        .on('message', (message) => {
            if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_FADER_LEVEL)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
                if (this.store.channels[0].channel[ch - 1].pgmOn && this.mixerProtocol.mode === 'master')
                {
                    this.updateOutLevel(ch-1);
                }
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_OUT_GAIN)){
                    let ch = message.address.split("/")[2];
                    if (this.store.channels[0].channel[ch - 1].pgmOn
                        && this.mixerProtocol.mode === 'master'
                        && !this.store.channels[0].channel[ch - 1].fadeActive) {
                        window.storeRedux.dispatch({
                            type:'SET_FADER_LEVEL',
                            channel: ch - 1,
                            level: message.args[0]
                    });
                }
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_VU)){
                if (this.store.settings[0].mixerProtocol === 'behringerxr') {
                    behringerMeter(message.args);
                } else if (this.store.settings[0].mixerProtocol === 'midas') {
                    midasMeter(message.args);
                } else {
                    let ch = message.address.split("/")[2];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                }
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_NAME)) {
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

        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            let oscTimer = setInterval(
                () => {
                    this.pingMixerCommand();
                },
                this.mixerProtocol.pingTime
            );
        }
    }

    pingMixerCommand() {
        //Ping OSC mixer if mixerProtocol needs it.
        this.mixerProtocol.pingCommand.map((command) => {
            this.sendOutMessage(
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

    sendOutMessage(oscMessage, channel, value, type) {
        let channelString = this.mixerProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
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

    updateOutLevel(channelIndex) {
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].outputLevel,
            "f"
        );
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_FADER_LEVEL,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].faderLevel,
            "f"
        );
    }

    updateFadeIOLevel(channelIndex, outputLevel) {
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            outputLevel,
            "f"
        );
    }

}

