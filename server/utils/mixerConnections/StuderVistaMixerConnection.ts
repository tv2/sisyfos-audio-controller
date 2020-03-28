//@ts-ignore
import { EmberClient, BER } from 'node-emberplus'
import { store, state } from '../../reducers/store'
import { huiRemoteConnection } from '../../mainClasses'

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface';
import { 
    SET_FADER_LEVEL, 
    SET_CHANNEL_LABEL 
} from '../../reducers/faderActions'
import { logger } from '../logger';

//const BER = require('asn1').Ber
//const BER = require('../../../node_modules/node-emberplus/ber.js')

export class StuderVistaMixerConnection {
    mixerProtocol: IMixerProtocol
    emberConnection: EmberClient
    deviceRoot: any;
    emberNodeObject: Array<any>;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);
        
        this.emberNodeObject = new Array(200);
        this.mixerProtocol = mixerProtocol;
        
        logger.info("Setting up Ember connection")
        this.emberConnection = new EmberClient(
            state.settings[0].deviceIp,
            state.settings[0].devicePort
        );
        this.emberConnection.on('error', (error: any) => {
			if (
				(error.message + '').match(/econnrefused/i) ||
				(error.message + '').match(/disconnected/i)
			) {
				logger.error('Ember connection not establised')
			} else {
				logger.error('Ember connection unknown error' + error.message)
			}
        })
        this.emberConnection.on('disconnected', () => {
            logger.error('Lost Ember connection')
		})
        logger.info('Connecting to Ember')
        let deviceRoot: any;
        this.emberConnection.connect()
        .then(() => {
            this.setupMixerConnection();
        })
        .catch((e: any) => {
            console.log(e.stack);
        });
    }

    setupMixerConnection() {
        logger.info('Ember connection established - setting up subscription of channels')

        let ch: number = 1;
        state.settings[0].numberOfChannelsInType.forEach((numberOfChannels, typeIndex) => {
            for (let channelTypeIndex=0; channelTypeIndex < numberOfChannels ; channelTypeIndex++) {
                this.subscribeFaderLevel(ch, typeIndex, channelTypeIndex);
                ch++;
            }
        })
/*
                .CHANNEL_VU)){
                    store.dispatch({
                        type:SET_VU_LEVEL,
                        channel: ch - 1,
                        level: message.args[0]
                    });
        */


        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            let emberTimer = setInterval(
                () => {
                    this.pingMixerCommand();
                },
                this.mixerProtocol.pingTime
            );
        }
    }

    subscribeFaderLevel(ch: number, typeIndex: number, channelTypeIndex: number) {
        let command = this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.replace("{channel}", String(channelTypeIndex+1))
        this.emberConnection.getElementByPath(command)
        .then((node: any) => {
            logger.info('Subscription of channel : ' + command)
            this.emberNodeObject[ch-1] = node;
            this.emberConnection.subscribe(node, (() => {
                logger.verbose('Receiving Level from Ch ' + String(ch))
                if (!state.channels[0].channel[ch-1].fadeActive
                    && !state.channels[0].channel[ch - 1].fadeActive
                    &&  node.contents.value > this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_OUT_GAIN[0].min) {
                    store.dispatch({
                        type: SET_FADER_LEVEL,
                        channel: ch-1,
                        level: node.contents.value
                    });
                    global.mainThreadHandler.updatePartialStore(ch-1)
                    if (huiRemoteConnection) {
                        huiRemoteConnection.updateRemoteFaderState(ch-1, node.contents.value);
                    }
                }

            })
            )
        })
        .catch((error: any) => {
            logger.error(error)
        })

    }

    subscribeChannelName(ch: number, typeIndex: number, channelTypeIndex: number) {
        this.emberConnection.getNodeByPath(this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_NAME[0].mixerMessage.replace("{channel}", String(channelTypeIndex+1)))
        .then((node: any) => {
            this.emberConnection.subscribe(node, (() => {
                store.dispatch({
                    type: SET_CHANNEL_LABEL,
                    channel: ch-1,
                    level: node.contents.value
                });
            })
            )
        })
    }

    pingMixerCommand() {
        //Ping Ember mixer if mixerProtocol needs it.
        return;
        this.mixerProtocol.pingCommand.map((command) => {
            this.sendOutMessage(
                command.mixerMessage,
                0,
                command.value,
                command.type
            );
        });
    }

    sendOutMessage(mixerMessage: string, channel: number, value: string | number, type: string) {
        let channelString = this.mixerProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        
        let message = mixerMessage.replace(
            "{channel}",
            channelString
        )

/*
        this.emberConnection.getElementByPath(message)
        .then((element: any) => {
            logger.verbose('Sending out message : ' + message)
            this.emberConnection.setValue(
                this.emberNodeObject[channel-1],
                typeof value === 'number' ? value : parseFloat(value)
            )
        })
        .catch((error: any) => {
            console.log("Ember Error ", error)
        })
        */
    }

    sendOutLevelMessage(channel: number, value: number) {
        let levelMessage: string
        let channelVal: number
        let channelType = state.channels[0].channel[channel - 1].channelType;
        let channelTypeIndex = state.channels[0].channel[channel - 1].channelTypeIndex;

        levelMessage = this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage
        channelVal = 160 + channelTypeIndex + 1

        let channelByte = new Uint8Array([
            (channelVal & 0x000000ff),
        ])

        //console.log('Fader value :', Math.floor(value))
        let BERwriter = new BER.Writer()

        BERwriter.startSequence();
        BERwriter.writeReal(Math.floor(value));
        BERwriter.endSequence();

        //console.log('BER encoding : ', BERwriter.buffer)
        let bufferString: string = ''
        BERwriter.buffer.forEach((element: any) => {
            bufferString += ('0' + element.toString(16)).slice(-2) + ' '
        });
        levelMessage = levelMessage.replace('{channel}', ('0' + channelByte[0].toString(16)).slice(-2))
        levelMessage = levelMessage.replace('{level}', (bufferString + '00 00 00 00 00').slice(0, 32))

        let hexArray = levelMessage.split(' ')
        let buf = new Buffer(hexArray.map((val:string) => { return parseInt(val, 16) }))
        this.emberConnection._client.socket.write(buf)
        //console.log("Send HEX: " + levelMessage) 
    }

    sendOutRequest(mixerMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        let message = mixerMessage.replace(
                "{channel}",
                channelString
            );
        if (message != 'none') {
/*
            this.oscConnection.send({
                address: message
            });
*/
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0]
        let level = state.channels[0].channel[channelIndex].outputLevel * (protocol.max - protocol.min) - Math.abs(protocol.min)
        this.sendOutLevelMessage(
            channelTypeIndex+1,
            level,
        );
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0]
        let level = outputLevel * (protocol.max - protocol.min) - Math.abs(protocol.min)

        this.sendOutLevelMessage(
            channelTypeIndex+1,
            level
        )
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
        return true
    }
    updateRatio(channelIndex: number, level: number) {        
        return true

    }
    updateDelayTime(channelIndex: number, level: number) {
         return true
    }
    updateLow(channelIndex: number, level: number) {
         return true
    }
    updateLoMid(channelIndex: number, level: number) {
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
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_NAME[0].mixerMessage,
            channelTypeIndex+1,
            channelName,
            "string"
        );
    }

    injectCommand(command: string[]) {
        return true
    }

}

