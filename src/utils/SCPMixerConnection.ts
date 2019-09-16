//Node Modules:
import * as os from 'os'; // Used to display (log) network addresses on local machine
import net from 'net'

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolInterface';
import { IStore } from '../reducers/indexReducer';
import { CLIENT_RENEG_LIMIT } from 'tls';

export class SCPMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    scpConnection: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });
        
        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.split('/').findIndex(ch => ch==='{channel}');

        this.scpConnection = net.connect(49280, this.store.settings[0].deviceIp, () => {
                console.log('Connected')
            }
            );
//            remotePort: parseInt(this.store.settings[0].devicePort + '')
        this.setupMixerConnection();
    }

    setupMixerConnection() {
        this.scpConnection
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
            if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_VU[0].mixerMessage)){
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: this.store.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                }
            )} else if ( this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_FADER_LEVEL[0].mixerMessage)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                let assignedFader = 1 + this.store.channels[0].channel[ch - 1].assignedFader

                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: assignedFader - 1,
                    level: message.args[0]
                });


                if (this.store.faders[0].fader[assignedFader - 1].pgmOn)
                {
                    this.store.channels[0].channel.map((channel: any, index: number) => {
                        if (channel.assignedFader === assignedFader - 1) {
                            window.storeRedux.dispatch({
                                type:'SET_OUTPUT_LEVEL',
                                channel: index,
                                level: message.args[0]
                            });
                            this.updateFadeIOLevel(index, this.store.faders[0].fader[assignedFader - 1].faderLevel);
                        }
                    })
                }

                if (!this.store.faders[0].fader[assignedFader - 1].pgmOn) {
                    window.storeRedux.dispatch({
                        type:'TOGGLE_PGM',
                        channel: assignedFader - 1
                    });
                }

                if (window.huiRemoteConnection) {
                    window.huiRemoteConnection.updateRemoteFaderState(assignedFader-1, message.args[0]);
                }
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                let assignedFader = 1 + this.store.channels[0].channel[ch - 1].assignedFader
                if (this.mixerProtocol.mode === 'master'
                    && !this.store.channels[0].channel[ch - 1].fadeActive
                    &&  message.args[0] > this.mixerProtocol.fader.min)
                {
                    window.storeRedux.dispatch({
                        type:'SET_FADER_LEVEL',
                        channel: assignedFader - 1,
                        level: message.args[0]
                    });
                    if (!this.store.faders[0].fader[assignedFader - 1].pgmOn) {
                        window.storeRedux.dispatch({
                            type:'TOGGLE_PGM',
                            channel: assignedFader
                        });
                    }

                    if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemoteFaderState(assignedFader - 1, message.args[0]);
                    }

                }
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_NAME[0].mixerMessage)) {
                                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: this.store.channels[0].channel[ch - 1].assignedFader,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            }
        })
        .on('error', (error: any) => {
            console.log("Error : ", error);
            console.log("Lost OSC connection");
        });

        this.scpConnection.open();
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
            this.scpConnection.send({
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
            this.scpConnection.send({
                address: message
            });
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex+1,
            this.store.channels[0].channel[channelIndex].outputLevel,
            "f"
        );
    }

    updatePflState(channelIndex: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        if (this.store.faders[0].fader[channelIndex].pflOn === true) {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0].mixerMessage,
                channelTypeIndex+1,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0].value,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0].type
            );
        } else {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0].mixerMessage,
                channelTypeIndex+1,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0].value,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0].type
            );
        }
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex+1,
            String(outputLevel),
            "f"
        );
    }

    updateChannelName(channelIndex: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let channelName = this.store.faders[0].fader[channelIndex].label;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_NAME[0].mixerMessage,
            channelTypeIndex+1,
            channelName,
            "s"
        );
    }
}

