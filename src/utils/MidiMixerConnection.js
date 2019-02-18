//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
//import { midi } from 'midi';

//Utils:
import { MixerProtocolPresets } from './MixerProtocolPresets';

export class MidiMixerConnection {
    constructor(initialStore) {
        this.sendMidiMessage = this.sendMidiMessage.bind(this);
        this.updateMidiLevels = this.updateMidiLevels.bind(this);
        this.fadeInOut = this.fadeInOut.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol];

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
                this.sendMidiMessage(item.oscMessage, 1, item.value, item.type);
                console.log("Listening for OSC over UDP.");
            });
        })
        .on('message', (message) => {
            if (
                this.checkOscCommand(message.address, this.mixerProtocol.fromMixer.CHANNEL_FADER_LEVEL)
            ) {
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
                if (this.store.channels[0].channel[ch - 1].pgmOn) {
                    this.updateMidiLevel(ch-1);
                }
            }
            if (
                this.checkOscCommand(message.address, this.mixerProtocol.fromMixer.CHANNEL_VU)
            ) {
                if (this.store.settings[0].mixerProtocol === 'behringer') {
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
                this.checkOscCommand(message.address, this.mixerProtocol.fromMixer.CHANNEL_NAME)
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
            this.sendMidiMessage(
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

    sendMidiMessage(oscMessage, channel, value, type) {
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

    updateMidiLevels() {
        this.store.channels[0].channel.map((channel, index) => {
            this.updateMidiLevel(index);
        });
    }

    updateMidiLevel(channelIndex) {
        this.fadeInOut(channelIndex);
        if (this.mixerProtocol.mode === "master" && this.store.channels[0].channel[channelIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
                channel: channelIndex,
                level: this.store.channels[0].channel[channelIndex].faderLevel
            });
        }
        this.sendMidiMessage(
            this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].outputLevel,
            "f"
        );
        this.sendMidiMessage(
            this.mixerProtocol.toMixer.CHANNEL_FADER_LEVEL,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].faderLevel,
            "f"
        );
    }

    fadeInOut (channelIndex){
        if (this.store.channels[0].channel[channelIndex].pgmOn) {
            let val = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);

            let targetVal = this.mixerProtocol.fader.zero;
            if (this.mixerProtocol.mode === "master") {
                targetVal = parseFloat(this.store.channels[0].channel[channelIndex].faderLevel);
            }

            let timer = setInterval(() => {
                if ( val >= targetVal){
                    clearInterval(timer);
                } else {
                    val = val + 3*this.mixerProtocol.fader.step;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendMidiMessage(
                        this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
                        channelIndex+1,
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        } else {
            let val = this.store.channels[0].channel[channelIndex].outputLevel;
            let timer = setInterval(() => {
                if ( val <= this.mixerProtocol.fader.min){
                    clearInterval(timer);
                } else {
                    val = val - 3*this.mixerProtocol.fader.step;
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: val
                    });
                    this.sendMidiMessage(
                        this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
                        channelIndex+1,
                        this.store.channels[0].channel[channelIndex].outputLevel,
                        "f"
                    );
                }
            }, 1);
        }
    }
}

