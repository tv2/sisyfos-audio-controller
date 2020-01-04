//Node Modules:
const net = require('net')
import { store, state } from '../reducers/store'
import { huiRemoteConnection } from '../importClasses'

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolInterface'
import { IStore } from '../reducers/indexReducer'
import { SET_OUTPUT_LEVEL } from '../reducers/channelActions'
import { 
    SET_FADER_LEVEL,
    TOGGLE_PGM,
    SET_MUTE
 } from  '../reducers/faderActions'
import { SET_MIXER_ONLINE } from '../reducers/settingsActions';
import { logger } from './logger'

export class SSLMixerConnection {
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    SSLConnection: any;
    mixerOnlineTimer: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutLevelMessage = this.sendOutLevelMessage.bind(this);

        store.dispatch({
            type: SET_MIXER_ONLINE,
            mixerOnline: false
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.split('/').findIndex(ch => ch === '{channel}');

        this.SSLConnection = new net.Socket()
        this.SSLConnection.connect(state.settings[0].devicePort, state.settings[0].deviceIp, () => {
            logger.info('Connected to SSL', {})

        }
        );
        this.setupMixerConnection();
    }

    formatHexWithSpaces(str: string, item: string, every: number) {
        for(let i = 0; i < str.length; i++){
          if(!(i % (every + 1))){
            str = str.substring(0, i) + item + str.substring(i);
          }
         }
        return str.substring(1);
      }

    setupMixerConnection() {
        // Return command was an acknowledge:
        let lastWasAck = false

        this.SSLConnection
            .on("ready", () => {
                store.dispatch({
                    type: SET_MIXER_ONLINE,
                    mixerOnline: true
                });
                
                logger.info("Receiving state of desk", {})
                this.mixerProtocol.initializeCommands.map((item) => {
                    if (item.mixerMessage.includes("{channel}")) {
                        state.channels[0].channel.map((channel: any, index: any) => {
                            this.sendOutRequest(item.mixerMessage, index);
                        });
                    } else {
                        this.sendOutLevelMessage(item.mixerMessage, 0, item.value);
                    }
                });
                global.mainThreadHandler.updateFullClientStore()
            })
            .on('data', (data: any) => {
                clearTimeout(this.mixerOnlineTimer)
                store.dispatch({
                    type: SET_MIXER_ONLINE,
                    mixerOnline: true
                });
                
                let buffers = []
                let lastIndex = 0
                for (let index=1; index<data.length; index++) {
                    if (data[index] === 241) {
                        buffers.push(data.slice(lastIndex, index - 1))
                        lastIndex = index
                    } 
                }
                if (buffers.length === 0) {
                    buffers.push(data)  
                }

                buffers.forEach((buffer) => {
                    if (buffer[1] === 6 && buffer[2] === 255 && !lastWasAck) {
                        lastWasAck = false
                        // FADERLEVEL COMMAND:
                        try {
                            
                       
                            let commandHex = buffer.toString('hex')
                            let channel = buffer[6]
                            let value = buffer.readUInt16BE(7)/1024

                            let assignedFaderIndex = state.channels[0].channel[channel].assignedFader
                            if (!state.channels[0].channel[channel].fadeActive) {    
                                if (value > this.mixerProtocol.fader.min + (this.mixerProtocol.fader.max * state.settings[0].autoResetLevel / 100)) {
                                    store.dispatch({
                                        type: SET_FADER_LEVEL,
                                        channel: assignedFaderIndex,
                                        level: value
                                    });
                                    if (!state.faders[0].fader[assignedFaderIndex].pgmOn) {
                                        store.dispatch({
                                            type: TOGGLE_PGM,
                                            channel: assignedFaderIndex
                                        });
                                    }
                                    
                                    if (huiRemoteConnection) {
                                        huiRemoteConnection.updateRemoteFaderState(assignedFaderIndex, value);
                                    }
                                    if (state.faders[0].fader[assignedFaderIndex].pgmOn) {
                                        state.channels[0].channel.map((channel: any, index: number) => {
                                            if (channel.assignedFader === assignedFaderIndex) {
                                                this.updateOutLevel(index);
                                            }
                                        })
                                    }
                                } else if (state.faders[0].fader[assignedFaderIndex].pgmOn 
                                    || state.faders[0].fader[assignedFaderIndex].voOn)
                                {
                                    store.dispatch({
                                        type: SET_FADER_LEVEL,
                                        channel: assignedFaderIndex,
                                        level: value
                                    });
                                    state.channels[0].channel.forEach((item, index) => {
                                        if (item.assignedFader === assignedFaderIndex) {
                                            store.dispatch({
                                                type: SET_OUTPUT_LEVEL,
                                                channel: index,
                                                level: value
                                            });
                                        }
                                    })
                                }
                                global.mainThreadHandler.updatePartialStore(assignedFaderIndex)
                            }
                        } catch (error) {
                                logger.error('Error translating received message :' + String(error), {})
                        } 
                        
                    } else if (buffer[1] === 5 && buffer[2] === 255 && buffer[4] === 1 && !lastWasAck) {
                        lastWasAck = false
                        // MUTE ON/OFF COMMAND
                        let commandHex = buffer.toString('hex')
                        let channelIndex = buffer[6]
                        let value: boolean = buffer[7] === 0 ? true : false
                        logger.verbose('Receive Buffer Channel On/off: ' + this.formatHexWithSpaces(commandHex, ' ', 2), {})
                        
                        let assignedFaderIndex = state.channels[0].channel[channelIndex].assignedFader

                        store.dispatch({
                            type: SET_MUTE,
                            channel: assignedFaderIndex,
                            muteOn: value
                        });
                        
                        if (huiRemoteConnection) {
                            huiRemoteConnection.updateRemoteFaderState(assignedFaderIndex, value ? 1 : 0);
                        }
                        state.channels[0].channel.forEach((channel: any, index: number) => {
                            if (channel.assignedFader === assignedFaderIndex && index !== channelIndex) {
                                this.updateMuteState(index, state.faders[0].fader[assignedFaderIndex].muteOn);
                            }
                        })
                        global.mainThreadHandler.updatePartialStore(assignedFaderIndex)
                    } else {
                        let commandHex = buffer.toString('hex')
                        logger.verbose('Receieve Buffer Hex: ' + this.formatHexWithSpaces(commandHex, ' ', 2), {})
                    }
                    if (buffer[0] === 4) {
                        lastWasAck = true
                    }  else {
                        lastWasAck = false
                    }
                })    
            })
            .on('error', (error: any) => {
                logger.error("Error : " + String(error), {})
                logger.info("Lost SCP connection", {})
            });

        //Ping mixer to get mixerOnlineState
        let oscTimer = setInterval(
            () => {
                this.pingMixerCommand();
            },
            this.mixerProtocol.pingTime
        );
    }

    pingMixerCommand() {
        //Ping OSC mixer if mixerProtocol needs it.
        this.mixerProtocol.pingCommand.forEach((command) => {
           this.sendOutPingRequest();
       });
       global.mainThreadHandler.updateFullClientStore()
       this.mixerOnlineTimer = setTimeout(() => {
           store.dispatch({
               type: SET_MIXER_ONLINE,
               mixerOnline: false
           });
       }, this.mixerProtocol.pingTime)
   }

    checkSSLCommand(message: string, command: string) {
        if (!message) return false
        if (message.slice(0, command.length) === command) return true;
        return false;
    }

    calculate_checksum8(hexValues: string) {
        // convert input value to upper case
        hexValues = hexValues.toUpperCase();

        let strHex = new String("0123456789ABCDEF");
        let result = 0;
        let fctr = 16;

        for (let i = 0; i < hexValues.length; i++) {
            if (hexValues.charAt(i) == " ")
                continue;

            let v = strHex.indexOf(hexValues.charAt(i));
            if (v < 0) {
                result = -1;
                break;
            }
            result += v * fctr;

            if (fctr == 16)
                fctr = 1;
            else
                fctr = 16;
        }

        // Calculate 2's complement
        result = (~(result & 0xff) + 1) & 0xFF;
        // Convert result to string
        return strHex.charAt(Math.floor(result / 16)) + strHex.charAt(result % 16);
    }


    sendOutLevelMessage(sslMessage: string, channelIndex: number, value: string | number) {
        let valueNumber: number
        if (typeof value === 'string') {
            value = parseFloat(value)
        }
        if (value < 0) { 
            value = 0
        }
        valueNumber = value * 1024
        let valueByte = new Uint8Array([
            (valueNumber & 0x0000ff00) >> 8,
            (valueNumber & 0x000000ff),
        ])

        let channelByte = new Uint8Array([
            (channelIndex & 0x0000ff00) >> 8,
            (channelIndex & 0x000000ff),
        ])
        
        sslMessage = sslMessage.replace('{channel}', ('0' + channelByte[0].toString(16)).slice(-2) + ' ' + ('0' + channelByte[1].toString(16)).slice(-2))
        sslMessage = sslMessage.replace('{level}', ('0' + valueByte[0].toString(16)).slice(-2) + ' ' + ('0' + valueByte[1].toString(16)).slice(-2) + ' ')
        sslMessage = sslMessage + this.calculate_checksum8(sslMessage.slice(9))
        let a = sslMessage.split(' ')
        let buf = new Buffer(a.map((val:string) => { return parseInt(val, 16) }))
        
        logger.verbose("Send HEX: " + sslMessage, {}) 
        this.SSLConnection.write(buf)
    }

    sendOutRequest(sslMessage: string, channelIndex: number) {
        //let sslMessage = 'f1 06 00 80 00 00 {channel} {level}'
        let channelByte = new Uint8Array([
            (channelIndex & 0x0000ff00) >> 8,
            (channelIndex & 0x000000ff),
        ])
        sslMessage = sslMessage.replace('{channel}', ('0' + channelByte[0].toString(16)).slice(-2) + ' ' + ('0' + channelByte[1].toString(16)).slice(-2))
        sslMessage = sslMessage + ' ' + this.calculate_checksum8(sslMessage.slice(9))
        let a = sslMessage.split(' ')
        let buf = new Buffer(a.map((val:string) => { return parseInt(val, 16) }))
        
        logger.verbose("Send HEX: " + sslMessage, {}) 
        this.SSLConnection.write(buf)
    }

    sendOutPingRequest() {
        let sslMessage = 'f1 02 00 07 00'
        sslMessage = sslMessage + ' ' + this.calculate_checksum8(sslMessage.slice(9))
        let a = sslMessage.split(' ')
        let buf = new Buffer(a.map((val:string) => { return parseInt(val, 16) }))
        
        logger.verbose("Send HEX: " + sslMessage, {}) 
        this.SSLConnection.write(buf)
    }

    updateOutLevel(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let faderIndex = state.channels[0].channel[channelIndex].assignedFader;
        if (state.faders[0].fader[faderIndex].pgmOn) {
            store.dispatch({
                type:SET_OUTPUT_LEVEL,
                channel: channelIndex,
                level: state.faders[0].fader[faderIndex].faderLevel
            });
        }
        this.sendOutLevelMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex,
            state.channels[0].channel[channelIndex].outputLevel
        );
    }

    updatePflState(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        if (state.faders[0].fader[channelIndex].pflOn === true) {
            this.sendOutRequest(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0].mixerMessage,
                channelTypeIndex
            );
        } else {
            this.sendOutRequest(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0].mixerMessage,
                channelTypeIndex
            );
        }
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        if (muteOn === true) {
            this.sendOutRequest(
                this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_MUTE_ON[0].mixerMessage,
                channelTypeIndex
            );
        } else {
            this.sendOutRequest(
                this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_MUTE_OFF[0].mixerMessage,
                channelTypeIndex
            );
        }
    } 

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutLevelMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex,
            String(outputLevel)
        );
    }

    updateNextAux(channelIndex: number, level: number) {
        this.sendOutLevelMessage(
            this.mixerProtocol.channelTypes[0].toMixer.NEXT_SEND[0].mixerMessage,
            channelIndex + 128,
            level
        );
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

    updateChannelName(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let channelName = state.faders[0].fader[channelIndex].label;
        /*
        this.sendOutLevelMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_NAME[0].mixerMessage,
            channelTypeIndex,
            channelName
        );
        */
    }
}

