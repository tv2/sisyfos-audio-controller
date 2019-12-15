//Node Modules:
const net = require('net')

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolInterface'
import { IStore } from '../reducers/indexReducer'
import { SET_OUTPUT_LEVEL } from '../reducers/channelActions'
import { 
    SET_VU_LEVEL, 
    SET_FADER_LEVEL,
    SET_CHANNEL_LABEL,
    TOGGLE_PGM
} from '../reducers/faderActions'



export class QlClMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    scpConnection: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.split('/').findIndex(ch => ch === '{channel}');

        this.scpConnection = new net.Socket()
        this.scpConnection.connect(50000, this.store.settings[0].deviceIp, () => {
            console.log('Connected to Yamaha mixer')

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
                            this.sendOutRequest(item.mixerMessage, (index + 1));
                        });
                    } else {
                        this.sendOutMessage(item.mixerMessage, 0, item.value, item.type);
                    }
                });
            })
            .on('data', (buffer: any) => {
                let messages: string[] = buffer.toString().split('\n')
                messages.forEach((message) => {
                    if (this.checkSCPCommand(message, this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_VU[0].mixerMessage)) {
                            let mixerValues: string[] = message.split(' ')
                            let ch = parseInt(mixerValues[3])
                            let assignedFader = 1 + this.store.channels[0].channel[ch - 1].assignedFader
                            let mixerValue = parseInt(mixerValues[6])
                            global.storeRedux.dispatch({
                                type: SET_VU_LEVEL,
                                channel: assignedFader,
                                level: mixerValue
                        }
                        )
                    } else if (this.checkSCPCommand(message, this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_OUT_GAIN[0].mixerMessage)) {
                        let mixerValues: string[] = message.split(' ')
                        let ch = 1 + parseInt(mixerValues[3])
                        let assignedFader = 1 + this.store.channels[0].channel[ch - 1].assignedFader
                        let mixerLevel: number = parseFloat(mixerValues[5])
                        let faderLevel =  Math.pow(2, (mixerLevel - 1000) / 2000)
                        //let faderLevel = Math.log10((mixerLevel + 32768) / (1000 + 32768))
                        if (!this.store.channels[0].channel[ch - 1].fadeActive
                            && faderLevel > this.mixerProtocol.fader.min) {
                            global.storeRedux.dispatch({
                                type: SET_FADER_LEVEL,
                                channel: assignedFader - 1,
                                level: faderLevel
                            });
                            if (!this.store.faders[0].fader[assignedFader - 1].pgmOn) {
                                global.storeRedux.dispatch({
                                    type: TOGGLE_PGM,
                                    channel: assignedFader - 1
                                });
                            }

                            if (global.huiRemoteConnection) {
                                global.huiRemoteConnection.updateRemoteFaderState(assignedFader - 1, faderLevel);
                            }
                            if (this.store.faders[0].fader[assignedFader - 1].pgmOn) {
                                this.store.channels[0].channel.map((channel: any, index: number) => {
                                    if (channel.assignedFader === assignedFader - 1) {
                                        this.updateOutLevel(index);
                                    }
                                })
                            }

                        }
                        } /*else if (this.checkSCPCommand(message, this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_NAME[0].mixerMessage)) {
                        let ch = message.split("/")[this.cmdChannelIndex];
                        global.storeRedux.dispatch({
                            type: SET_CHANNEL_LABEL,
                            channel: this.store.channels[0].channel[ch - 1].assignedFader,
                            label: message.args[0]
                        });
                        console.log("OSC message: ", message);
                    }*/
                })
            })
            .on('error', (error: any) => {
                console.log("Error : ", error);
                console.log("Lost SCP connection");
            });

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

    checkSCPCommand(message: string, command: string) {
        if (!message) return false
        if (message.slice(0, command.length) === command) return true;
        return false;
    }

    sendOutMessage(oscMessage: string, channelIndex: number, value: string | number, type: string) {
        let valueNumber: number
        if (typeof value === 'string') {
            value = parseFloat(value)
        }
        
        valueNumber = value * 2048
        let valueByte = new Uint8Array([
            (valueNumber & 0xff00) >> 8,
            (valueNumber & 0x00ff),
        ])

        //f0 43 10 3e 19 01 00 37 00 00 00 00 00 00 00 07 0e f7
        let command = 'f0 43 10 3e 19 01 00 37 00 00 00 {channel} 00 00 00 {level} f7'
        command = command.replace('{channel}', channelIndex.toString(16))
        command = command.replace('{level}', valueByte[0].toString(16) + ' ' + valueByte[1].toString(16))
        let a = command.split(' ')
        let buf = new Buffer(a.map((val:string) => { return parseInt(val, 16) }))
        this.scpConnection.write(buf)
//        this.scpConnection.write(oscMessage + ' ' + (channel - 1) + ' 0 ' + valueNumber.toFixed(0) + '\n');
    }


    sendOutRequest(oscMessage: string, channel: number) {
        let channelString = channel.toString();
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
        let faderIndex = this.store.channels[0].channel[channelIndex].assignedFader;
        if (this.store.faders[0].fader[faderIndex].pgmOn) {
            global.storeRedux.dispatch({
                type:SET_OUTPUT_LEVEL,
                channel: channelIndex,
                level: this.store.faders[0].fader[faderIndex].faderLevel
            });
        }
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex,
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
                channelTypeIndex,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0].value,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0].type
            );
        } else {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0].mixerMessage,
                channelTypeIndex,
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
        return true
    }
    updateRatio(channelIndex: number, level: number) {        
        return true

    }
    updateLow(channelIndex: number, level: number) {
         return true
    }
    updateMid(channelIndex: number, level: number) {
        return true
    }
    updateHigh(channelIndex: number, level: number) {
        return true
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        return true
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex,
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
            channelTypeIndex,
            channelName,
            "s"
        );
    }
}

