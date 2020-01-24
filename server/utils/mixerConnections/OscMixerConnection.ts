//Node Modules:
const osc = require('osc')
import { store, state } from '../../reducers/store'
import { huiRemoteConnection } from '../../mainClasses'
import { socketServer } from '../../expressHandler'


//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import { behringerMeter } from './productSpecific/behringer'
import { midasMeter } from './productSpecific/midas'
import { SET_OUTPUT_LEVEL, SET_AUX_LEVEL } from '../../reducers/channelActions'
import { 
    SET_VU_LEVEL, 
    SET_FADER_LEVEL,
    SET_CHANNEL_LABEL,
    TOGGLE_PGM,
    SET_FADER_THRESHOLD,
    SET_FADER_RATIO,
    SET_FADER_LO_MID,
    SET_FADER_MID,
    SET_FADER_HIGH,
    SET_FADER_LOW
} from '../../reducers/faderActions'
import { SET_MIXER_ONLINE } from '../../reducers/settingsActions';
import { SOCKET_SET_VU } from '../../constants/SOCKET_IO_DISPATCHERS';
import { logger } from '../logger'

export class OscMixerConnection {
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    oscConnection: any;
    mixerOnlineTimer: any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        store.dispatch({
            type: SET_MIXER_ONLINE,
            mixerOnline: false
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.split('/').findIndex(ch => ch==='{channel}');

        this.oscConnection = new osc.UDPPort({
            localAddress: state.settings[0].localIp,
            localPort: parseInt(state.settings[0].localOscPort + ''),
            remoteAddress: state.settings[0].deviceIp,
            remotePort: parseInt(state.settings[0].devicePort + '')
        });
        this.setupMixerConnection();
    }

    setupMixerConnection() {
        this.oscConnection
        .on("ready", () => {
            logger.info("Receiving state of desk", {})
            this.initialCommands()
            
            store.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: true
            });            
            global.mainThreadHandler.updateFullClientStore()
        })
        .on('message', (message: any) => {
            clearTimeout(this.mixerOnlineTimer)
            store.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: true
            });
            logger.verbose("Received OSC message: " + message.address, {})
            if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_VU[0].mixerMessage)){
                if (state.settings[0].mixerProtocol.includes('behringer')) {
                    behringerMeter(message.args);
                } else if (state.settings[0].mixerProtocol.includes('midas')) {
                    midasMeter(message.args);
                } else {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type:SET_VU_LEVEL,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    socketServer.emit(
                        SOCKET_SET_VU, 
                        {
                            faderIndex: state.channels[0].channel[ch - 1].assignedFader,
                            level: message.args[0]
                        }
                    )
                }
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                let assignedFaderIndex = state.channels[0].channel[ch - 1].assignedFader


                if (!state.channels[0].channel[ch - 1].fadeActive)
                    {                    
                    if  (message.args[0] > this.mixerProtocol.fader.min + (this.mixerProtocol.fader.max * state.settings[0].autoResetLevel / 100)) {
                        store.dispatch({
                            type: SET_FADER_LEVEL,
                            channel: assignedFaderIndex,
                            level: message.args[0]
                        });
                        state.channels[0].channel.forEach((item, index) => {
                            if (item.assignedFader === assignedFaderIndex) {
                                store.dispatch({
                                    type: SET_OUTPUT_LEVEL,
                                    channel: index,
                                    level: message.args[0]
                                });
                            }
                        })
                        if (!state.faders[0].fader[assignedFaderIndex].pgmOn) {
                            if (message.args[0] > this.mixerProtocol.fader.min) {
                                store.dispatch({
                                    type: TOGGLE_PGM,
                                    channel: assignedFaderIndex
                                });
                            }
                        }
                    } else if (state.faders[0].fader[assignedFaderIndex].pgmOn 
                            || state.faders[0].fader[assignedFaderIndex].voOn)
                        {
                        store.dispatch({
                            type: SET_FADER_LEVEL,
                            channel: assignedFaderIndex,
                            level: message.args[0]
                        });
                        state.channels[0].channel.forEach((item, index) => {
                            if (item.assignedFader === assignedFaderIndex) {
                                store.dispatch({
                                    type: SET_OUTPUT_LEVEL,
                                    channel: index,
                                    level: message.args[0]
                                });
                            }
                        })
                    }
                    global.mainThreadHandler.updatePartialStore(assignedFaderIndex)

                    if (huiRemoteConnection) {
                        huiRemoteConnection.updateRemoteFaderState(assignedFaderIndex, message.args[0]);
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
                logger.verbose('Aux Message Channel : ' + ch + '  Aux Index :' + auxIndex + ' Level : ' + message.args[0])
                store.dispatch({
                    type: SET_AUX_LEVEL,
                    channel: ch - 1,
                    auxIndex: auxIndex,
                    level: message.args[0]
                });
                global.mainThreadHandler.updateFullClientStore()
 
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .CHANNEL_NAME[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type: SET_CHANNEL_LABEL,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        label: message.args[0]
                    });
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .THRESHOLD[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type: SET_FADER_THRESHOLD,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .RATIO[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex]
                    let ratio = this.mixerProtocol.channelTypes[0].fromMixer.RATIO[0]
                    let level = message.args[0] / ((ratio.max-ratio.min) + ratio.min)
                    store.dispatch({
                        type: SET_FADER_RATIO,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: level
                    })
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .LOW[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type: SET_FADER_LOW,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .LO_MID[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type: SET_FADER_LO_MID,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .MID[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type: SET_FADER_MID,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer
                .HIGH[0].mixerMessage)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    store.dispatch({
                        type: SET_FADER_HIGH,
                        channel: state.channels[0].channel[ch - 1].assignedFader,
                        level: message.args[0]
                    });
                    global.mainThreadHandler.updatePartialStore(state.channels[0].channel[ch - 1].assignedFader)
            } else {
                logger.verbose("Unknown OSC message: " + message.address, {})
            }
        })
        .on('error', (error: any) => {
            store.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: false
            });
            global.mainThreadHandler.updateFullClientStore()
            logger.error("Error : " + String(error), {})
            logger.info("Lost OSC connection", {})
        });

        this.oscConnection.open();
        logger.info(`OSC listening on port ` + String(state.settings[0].localOscPort ), {})

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

    initialCommands() {
        this.mixerProtocol.initializeCommands.forEach((item, itemIndex: number) => {
            setTimeout(() => {
                if (item.mixerMessage.includes("{channel}")) {
                    if (item.type === 'aux') {
                        state.channels[0].channel.forEach((channel: any, index: number) => {
                            channel.auxLevel.forEach((auxLevel: any, auxIndex: number) => {
                                setTimeout(() => {
                                    this.sendOutRequestAux(item.mixerMessage, auxIndex +1, state.faders[0].fader[channel.assignedFader].monitor)
                                },
                                state.faders[0].fader[channel.assignedFader].monitor * 10 + auxIndex * 100)
                            })
                        })
                    } else {
                        state.channels[0].channel.map((channel: any, index: any) => {
                            this.sendOutRequest(item.mixerMessage,(index +1));
                        });
                    }                     
                    
                } else {
                    this.sendOutMessage(item.mixerMessage, 1, item.value, item.type);
                }
            },
            itemIndex * 100)
        });
    }

    pingMixerCommand() {
         //Ping OSC mixer if mixerProtocol needs it.
         this.mixerProtocol.pingCommand.map((command) => {
            logger.verbose('Sending OSC command :' + command.mixerMessage, {})
            this.sendOutMessage(
                command.mixerMessage,
                0,
                command.value,
                command.type
            );
        });
        global.mainThreadHandler.updateFullClientStore()
        this.mixerOnlineTimer = setTimeout(() => {
            store.dispatch({
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

    sendOutRequestAux(oscMessage: string, channel: number, auxSend: number) {
        let channelString = this.mixerProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        let message = oscMessage.replace(
            "{channel}",
            channelString
        );
        let auxSendNumber = this.mixerProtocol.leadingZeros ? ("0"+String(auxSend)).slice(-2) : String(auxSend);
        message = message.replace('{argument}', auxSendNumber)
        logger.verbose('Initial Aux Message : ' + message)
        if (message != 'none') {
            this.oscConnection.send({
                address: message
            });
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex+1,
            state.channels[0].channel[channelIndex].outputLevel,
            "f"
        );
    }

    updatePflState(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        if (state.faders[0].fader[channelIndex].pflOn === true) {
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
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
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
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
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
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let low = this.mixerProtocol.channelTypes[channelType].toMixer.LOW[0]
        level = level * (low.max-low.min) + low.min
        this.sendOutMessage(
            low.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateLoMid(channelIndex: number, level: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let loMid = this.mixerProtocol.channelTypes[channelType].toMixer.LO_MID[0]
        level = level * (loMid.max-loMid.min) + loMid.min
        this.sendOutMessage(
            loMid.mixerMessage,
            channelTypeIndex+1,
            level,
            "f"
        );
    }
    updateMid(channelIndex: number, level: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
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
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
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
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channel = state.channels[0].channel[channelIndex].channelTypeIndex+1
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
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex+1,
            String(outputLevel),
            "f"
        );
    }

    updateChannelName(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let channelName = state.faders[0].fader[channelIndex].label;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_NAME[0].mixerMessage,
            channelTypeIndex+1,
            channelName,
            "s"
        );
    }

    injectCommand(command: string[]) {
        return true
    }

}

