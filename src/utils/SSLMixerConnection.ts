//Node Modules:
import * as os from 'os'; // Used to display (log) network addresses on local machine
import * as net from 'net'

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolInterface';
import { IStore } from '../reducers/indexReducer';

export class SSLMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    SSLConnection: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.split('/').findIndex(ch => ch === '{channel}');

        this.SSLConnection = new net.Socket()
        // this.SSLConnection.connect(10001, this.store.settings[0].deviceIp, () => {
        this.SSLConnection.connect(16219, '0.tcp.ngrok.io', () => {
            console.log('Connected to SSL')

        }
        );
        //            remotePort: parseInt(this.store.settings[0].devicePort + '')
        this.setupMixerConnection();
    }

    addItemEvery(str: string, item: string, every: number) {
        for(let i = 0; i < str.length; i++){
          if(!(i % (every + 1))){
            str = str.substring(0, i) + item + str.substring(i);
          }
         }
        return str.substring(1);
      }

    setupMixerConnection() {
        this.SSLConnection
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
            .on('data', (data: any) => {
                let buffers = []
                let lastIndex = 0
                for (let index=1; index<data.length; index++) {
                    if (data[index] === 241) {
                        buffers.push(data.slice(lastIndex, index - 1))
                    } 
                }
                if (buffers.length === 0) {
                    buffers.push(data)
                }

                buffers.forEach((buffer) => {
                    if (buffer[1] === 6) {

                        let commandHex = buffer.toString('hex')
                        let channel = buffer[6]
                        let value = buffer.readUInt16BE(7)/1024
                        console.log('Buffer Hex: ', this.addItemEvery(commandHex, ' ', 2))
                        console.log('Buffer Channel: ', channel)
                        console.log('Buffer Value: ', value)
                        
                        let assignedFader = 1 + this.store.channels[0].channel[channel].assignedFader
                        if (!this.store.channels[0].channel[channel].fadeActive
                            && value > this.mixerProtocol.fader.min) {
                            window.storeRedux.dispatch({
                                type: 'SET_FADER_LEVEL',
                                channel: assignedFader - 1,
                                level: value
                            });
                            if (!this.store.faders[0].fader[assignedFader - 1].pgmOn) {
                                window.storeRedux.dispatch({
                                    type: 'TOGGLE_PGM',
                                    channel: assignedFader - 1
                                });
                            }
                            
                            if (window.huiRemoteConnection) {
                                window.huiRemoteConnection.updateRemoteFaderState(assignedFader - 1, value);
                            }
                            if (this.store.faders[0].fader[assignedFader - 1].pgmOn) {
                                this.store.channels[0].channel.map((channel: any, index: number) => {
                                    if (channel.assignedFader === assignedFader - 1) {
                                        this.updateOutLevel(index);
                                    }
                                })
                            }
                            
                        }
                    }
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

    checkSSLCommand(message: string, command: string) {
        if (!message) return false
        if (message.slice(0, command.length) === command) return true;
        return false;
    }

    sendOutMessage(oscMessage: string, channelIndex: number, value: string | number, type: string) {
        let valueNumber: number
        if (typeof value === 'string') {
            value = parseFloat(value)
        }
        
        valueNumber = value * 1024
        let valueByte = new Uint8Array([
            (valueNumber & 0xff00) >> 8,
            (valueNumber & 0x00ff),
        ])
//        let value = buffer.readUInt16BE(7)/1024
        //f1 06 ff 80 00 00 00 03 ff 7e
        let command = 'f1 06 ff 80 00 00 {channel} {level} 80'
        command = command.replace('{channel}', channelIndex.toString(16))
        command = command.replace('{level}', valueByte[0].toString(16) + ' ' + valueByte[1].toString(16))
        let a = command.split(' ')
        let buf = new Buffer(a.map((val:string) => { return parseInt(val, 16) }))
        this.SSLConnection.write(buf)
//        this.scpConnection.write(oscMessage + ' ' + (channel - 1) + ' 0 ' + valueNumber.toFixed(0) + '\n');
    }


    sendOutRequest(oscMessage: string, channel: number) {
        let channelString = channel.toString();
        let message = oscMessage.replace(
            "{channel}",
            channelString
        );
        if (message != 'none') {
            this.SSLConnection.send({
                address: message
            });
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        let faderIndex = this.store.channels[0].channel[channelIndex].assignedFader;
        if (this.store.faders[0].fader[faderIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
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

