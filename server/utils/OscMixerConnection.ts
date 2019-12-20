//Node Modules:
const osc = require('osc')

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolInterface';
import { behringerMeter } from './productSpecific/behringer';
import { midasMeter } from './productSpecific/midas';
import { IStore } from '../reducers/indexReducer';
import { SET_OUTPUT_LEVEL, SET_AUX_LEVEL } from '../reducers/channelActions'
import { 
    SET_VU_LEVEL, 
    SET_FADER_LEVEL,
    SET_CHANNEL_LABEL,
    TOGGLE_PGM
} from '../reducers/faderActions'
import { SET_MIXER_ONLINE } from '../reducers/settingsActions';
import { SOCKET_SET_VU } from '../constants/SOCKET_IO_DISPATCHERS';

export class OscMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    oscConnection: any;
    mixerOnlineTimer: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
        });


        global.storeRedux.dispatch({
            type: SET_MIXER_ONLINE,
            mixerOnline: false
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.split('/').findIndex(ch => ch==='{channel}');

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
            
            this.mixerProtocol.initializeCommands.forEach((item) => {
                if (item.mixerMessage.includes("{channel}")) {
                    this.store.channels[0].channel.map((channel: any, index: any) => {
                        this.sendOutRequest(item.mixerMessage,(index +1));
                    });
                } else {
                    this.sendOutMessage(item.mixerMessage, 1, item.value, item.type);
                }
            });
            global.storeRedux.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: true
            });            
            global.socketServer.emit('set-store', global.storeRedux.getState())
        })
        .on('message', (message: any) => {
            clearTimeout(this.mixerOnlineTimer)
            global.storeRedux.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: true
            });
            if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_VU[0].mixerMessage)){
                if (this.store.settings[0].mixerProtocol.includes('behringer')) {
                    behringerMeter(message.args);
                } else if (this.store.settings[0].mixerProtocol.includes('midas')) {
                    midasMeter(message.args);
                } else {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    global.storeRedux.dispatch({
                        type:SET_VU_LEVEL,
                        channel: this.store.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    global.socketServer.emit(
                        SOCKET_SET_VU, 
                        {
                            faderIndex: this.store.channels[0].channel[ch - 1].assignedFader,
                            level: message.args[0]
                        }
                    )
                }
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                let assignedFaderIndex = this.store.channels[0].channel[ch - 1].assignedFader


                if (!this.store.channels[0].channel[ch - 1].fadeActive)
                    {                    
                    if  (message.args[0] > this.mixerProtocol.fader.min + (this.mixerProtocol.fader.max * this.store.settings[0].autoResetLevel / 100)) {
                        global.storeRedux.dispatch({
                            type: SET_FADER_LEVEL,
                            channel: assignedFaderIndex,
                            level: message.args[0]
                        });
                        this.store.channels[0].channel.forEach((item, index) => {
                            if (item.assignedFader === assignedFaderIndex) {
                                global.storeRedux.dispatch({
                                    type: SET_OUTPUT_LEVEL,
                                    channel: index,
                                    level: message.args[0]
                                });
                            }
                        })
                        if (!this.store.faders[0].fader[assignedFaderIndex].pgmOn) {
                            if (message.args[0] > this.mixerProtocol.fader.min) {
                                global.storeRedux.dispatch({
                                    type: TOGGLE_PGM,
                                    channel: assignedFaderIndex
                                });
                            }
                        }
                    } else if (this.store.faders[0].fader[assignedFaderIndex].pgmOn 
                            || this.store.faders[0].fader[assignedFaderIndex].voOn)
                        {
                        global.storeRedux.dispatch({
                            type: SET_FADER_LEVEL,
                            channel: assignedFaderIndex,
                            level: message.args[0]
                        });
                        this.store.channels[0].channel.forEach((item, index) => {
                            if (item.assignedFader === assignedFaderIndex) {
                                global.storeRedux.dispatch({
                                    type: SET_OUTPUT_LEVEL,
                                    channel: index,
                                    level: message.args[0]
                                });
                            }
                        })
                    }
                    global.socketServer.emit('set-store', global.storeRedux.getState())

                    if (global.huiRemoteConnection) {
                        global.huiRemoteConnection.updateRemoteFaderState(assignedFaderIndex, message.args[0]);
                    }
                } 
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .AUX_LEVEL[0].mixerMessage)){

                let commandArray: string[] = this.mixerProtocol.channelTypes[0].fromMixer
                .AUX_LEVEL[0].mixerMessage.split('/')
                let messageArray: string[] = message.address.split('/')
                let ch = 0
                let auxIndex = 0

                commandArray.forEach((commandPart: string, index: number) => {
                    if (commandPart === '{channel}') {
                        ch = parseFloat(messageArray[index])
                    } else if (commandPart === '{argument}') {
                        auxIndex = parseFloat(messageArray[index]) - 1
                    }
                })

                global.storeRedux.dispatch({
                    type: SET_AUX_LEVEL,
                    channel: ch - 1,
                    auxIndex: auxIndex,
                    level: message.args[0]
                });
                global.socketServer.emit('set-store', global.storeRedux.getState())
 
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_NAME[0].mixerMessage)) {
                                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    global.storeRedux.dispatch({
                        type: SET_CHANNEL_LABEL,
                        channel: this.store.channels[0].channel[ch - 1].assignedFader,
                        label: message.args[0]
                    });
                global.socketServer.emit('set-store', global.storeRedux.getState())
                console.log("OSC message: ", message.address);
            }
        })
        .on('error', (error: any) => {
            global.storeRedux.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: false
            });
            global.socketServer.emit('set-store', global.storeRedux.getState())
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
        global.socketServer.emit('set-store', global.storeRedux.getState())
        this.mixerOnlineTimer = setTimeout(() => {
            global.storeRedux.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: false
            });
        }, this.mixerProtocol.pingTime)
    }

    checkOscCommand(message: string, command: string): boolean {
        if (message === command) return true;
        let messageArray: string[] = message.split('/')
        let commandArray: string[] = command.split('/')
        let status: boolean = true
        if (messageArray.length !== commandArray.length) {
            return false
        }
        commandArray.forEach((commandPart: string, index: number) => {
            if (commandPart === '{channel}') {
                if (typeof(parseFloat(messageArray[index])) !== 'number') { status = false }
            } else if (commandPart === '{argument}') {
                if (typeof(parseFloat(messageArray[index])) !== 'number') { status = false }
            } else if (commandPart !== messageArray[index]) {
                status = false
            }            
        })
        return status
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

    updateMuteState(channelIndex: number, muteOn: boolean) {
        return true
    } 

    updateNextAux(channelIndex: number, level: number) {
        return true
    }

    updateThreshold(channelIndex: number, level: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let thr = this.mixerProtocol.channelTypes[channelType].toMixer.THRESHOLD[0]
        level = level * (thr.max-thr.min) + thr.min
        this.sendOutMessage(
            thr.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateRatio(channelIndex: number, level: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let ratio = this.mixerProtocol.channelTypes[channelType].toMixer.RATIO[0]
        level = level * (ratio.max-ratio.min) + ratio.min
        this.sendOutMessage(
            ratio.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateLow(channelIndex: number, level: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let low = this.mixerProtocol.channelTypes[channelType].toMixer.LOW[0]
        level = level * (low.max-low.min) + low.min
        this.sendOutMessage(
            low.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateMid(channelIndex: number, level: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let mid = this.mixerProtocol.channelTypes[channelType].toMixer.MID[0]
        level = level * (mid.max-mid.min) + mid.min
        this.sendOutMessage(
            mid.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateHigh(channelIndex: number, level: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let high = this.mixerProtocol.channelTypes[channelType].toMixer.HIGH[0]
        level = level * (high.max-high.min) + high.min
        this.sendOutMessage(
            high.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channel = this.store.channels[0].channel[channelIndex].channelTypeIndex+1
        let auxSendCmd = this.mixerProtocol.channelTypes[channelType].toMixer.AUX_LEVEL[0]
        let auxSendNumber = this.mixerProtocol.leadingZeros ? ("0"+String(auxSendIndex + 1)).slice(-2) : String(auxSendIndex + 1);
        let message = auxSendCmd.mixerMessage.replace('{argument}', auxSendNumber)

        level = level * (auxSendCmd.max-auxSendCmd.min) + auxSendCmd.min
        this.sendOutMessage(
            message,
            channel,
            level,
            "f"
        );
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

