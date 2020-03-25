//@ts-ignore
import { EmberClient } from 'node-emberplus'
import { store, state } from '../../reducers/store'
import { huiRemoteConnection } from '../../mainClasses'

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface';
import { 
    SET_FADER_LEVEL, 
    SET_CHANNEL_LABEL 
} from '../../reducers/faderActions'
import { logger } from '../logger';


export class StuderOnAirMixerConnection {
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
//        logger.verbose('Sending out Level: ' + String(value) + ' To Path : ' + JSON.stringify(this.emberConnection.root))
        let levelMessage: string
        if (channel<10) {
            levelMessage = '7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {channel} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 {level} 00 00 00 00'
        } else {
            levelMessage = '7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {channel} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 {level} 00 00 00 00'
        }

        let valueNumber = value
        let valueByte = new Uint8Array([
            (valueNumber & 0x0000ff00) >> 8,
            (valueNumber & 0x000000ff),
        ])
        let channelVal = 160 + channel
        let channelByte = new Uint8Array([
            (channelVal & 0x000000ff),
        ])
        
        levelMessage = levelMessage.replace('{channel}', ('0' + channelByte[0].toString(16)).slice(-2))
        levelMessage = levelMessage.replace('{level}', ('0' + valueByte[0].toString(16)).slice(-2) + ' ' + ('0' + valueByte[1].toString(16)).slice(-2))

        let hexArray = levelMessage.split(' ')
        let buf = new Buffer(hexArray.map((val:string) => { return parseInt(val, 16) }))
        this.emberConnection._client.socket.write(buf)
        console.log("Send HEX: " + levelMessage) 

/*
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {CH} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 {LV} 00 00 00 00
Fader 1 - Maxvol:
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {a1} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 03 ca 00 00 00 00
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {a1} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 03 e8 00 00 00 00

Fader 1 - Min vol:
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {a1} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 00 be 00 00 00 00

Fader 2 - Min vol:
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {a2} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 03 48 00 00 00 00
Fader 2 - Max vol:
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {a2} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 03 e8 00 00 00 00

Fader 7:
7f 8f ff fe d9 5c 80 30 80 a4 18 31 16 a2 14 31 12 {a9} 10 31 0e a6 0c 31 0a e1 08 31 06 63 04 02 02 02 12 00 00 00 00

Fader 12:
7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {ac} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 "00 c8" 00 00 00 00

Fader 23:
7f 8f ff fe d9 5c 80 30 80 bf 83 90 80 00 1e 31 1c a4 1a 31 18 a2 16 31 14 {b7} 12 31 10 a6 0e 31 0c e1 0a 31 08 63 06 02 04 00 00 "02 94" 00 00 00 00





*/
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
        let level = (state.channels[0].channel[channelIndex].outputLevel - protocol.min) * (protocol.max - protocol.min)
        this.sendOutLevelMessage(
            channelTypeIndex+1,
            level,
        );
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = state.channels[0].channel[channelIndex].channelTypeIndex;
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_OUT_GAIN[0]
        let level = (outputLevel - protocol.min) * (protocol.max - protocol.min)

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

