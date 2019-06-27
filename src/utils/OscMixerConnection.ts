//Node Modules:
import * as os from 'os'; // Used to display (log) network addresses on local machine
import * as osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolPresets';
import { behringerMeter } from './productSpecific/behringer';
import { midasMeter } from './productSpecific/midas';
import { IStore } from '../reducers/indexReducer';

export class OscMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    oscConnection: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.fromMixer.CHANNEL_OUT_GAIN.split('/').findIndex(ch => ch==='{channel}');

        this.oscConnection = new osc.UDPPort({
            localAddress: this.store.settings[0].localIp,
            localPort: parseInt(this.store.settings[0].localOscPort + ''),
            remoteAddress: this.store.settings[0].deviceIp,
            remotePort: parseInt(this.store.settings[0].devicePort + '')
        });
        this.setupMixerConnection();
    }

    setupMixerConnection() {
        this.oscConnection
        .on("ready", () => {
            console.log("Receiving state of desk");
            this.mixerProtocol.initializeCommands.map((item) => {
                if (item.mixerMessage.includes("{channel}")) {
                    this.store.channels[0].channel.map((channel: any, index: any) => {
                        this.sendOutRequest(item.mixerMessage,(index +1));
                    });
                } else {
                    this.sendOutMessage(item.mixerMessage, 1, item.value, item.type);
                }
            });
        })
        .on('message', (message: any) => {
            if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_VU)){
                if (this.store.settings[0].mixerProtocol.includes('behringer')) {
                    behringerMeter(message.args);
                } else if (this.store.settings[0].mixerProtocol.includes('midas')) {
                    midasMeter(message.args);
                } else {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                }
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_FADER_LEVEL)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });

                if (window.huiRemoteConnection) {
                    window.huiRemoteConnection.updateRemoteFaderState(ch-1, message.args[0]);
                }

                if (this.mixerProtocol.mode === 'master') {
                    if (this.store.channels[0].channel[ch - 1].pgmOn)
                    {
                        this.updateOutLevel(ch-1);
                    }
                }
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_OUT_GAIN)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                if (this.mixerProtocol.mode === 'master'
                    && !this.store.channels[0].channel[ch - 1].fadeActive
                    &&  message.args[0] > this.mixerProtocol.fader.min)
                {
                    window.storeRedux.dispatch({
                        type:'SET_FADER_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                    if (!this.store.channels[0].channel[ch - 1].pgmOn) {
                        window.storeRedux.dispatch({
                            type:'TOGGLE_PGM',
                            channel: ch - 1
                        });
                    }

                    if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemoteFaderState(ch-1, message.args[0]);
                    }

                }
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_NAME)) {
                                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: ch - 1,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            }
        })
        .on('error', (error: any) => {
            console.log("Error : ", error);
            console.log("Lost OSC connection");
        });

        this.oscConnection.open();
        console.log(`OSC listening on port ` + this.store.settings[0].localOscPort );

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
                command.mixerMessage,
                0,
                command.value,
                command.type
            );
        });
    }

    checkOscCommand(message: string, command: string) {
        if (message === command) return true;

        let cmdArray = command.split("{channel}");
        if (message.substr(0, cmdArray[0].length) === cmdArray[0])
        {
            if (
                message.substr(-cmdArray[1].length) === cmdArray[1] &&
                message.length >= command.replace("{channel}", "").length
            ) {
                return true;
            } else if (
                cmdArray[1] === "" &&
                message.length >= command.replace("{channel}", "").length
            ) {
                return true;
            }
        }
        return false;
    }

    sendOutMessage(oscMessage: string, channel: number, value: string | number, type: string) {
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


    sendOutRequest(oscMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        let message = oscMessage.replace(
                "{channel}",
                channelString
            );
        if (message != 'none') {
            this.oscConnection.send({
                address: message
            });
        }
    }

    updateOutLevel(channelIndex: number) {
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

    updatePflState(channelIndex: number) {
        if (this.store.channels[0].channel[channelIndex].pflOn === true) {
            this.sendOutMessage(
                this.mixerProtocol.toMixer.PFL_ON.mixerMessage,
                channelIndex+1,
                this.mixerProtocol.toMixer.PFL_ON.value,
                this.mixerProtocol.toMixer.PFL_ON.type
            );
        } else {
            this.sendOutMessage(
                this.mixerProtocol.toMixer.PFL_OFF.mixerMessage,
                channelIndex+1,
                this.mixerProtocol.toMixer.PFL_OFF.value,
                this.mixerProtocol.toMixer.PFL_OFF.type
            );
        }
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            String(outputLevel),
            "f"
        );
    }
}

