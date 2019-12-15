const DeviceTree = require('emberplus')

//Utils:
import { IMixerProtocol } from '../constants/MixerProtocolInterface';
import { IStore } from '../reducers/indexReducer';
import { 
    SET_FADER_LEVEL, 
    SET_CHANNEL_LABEL 
} from '../reducers/faderActions'


export class EmberMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    emberConnection: any;
    deviceRoot: any;
    emberNodeObject: Array<any>;


    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
        });

        this.emberNodeObject = new Array(200);
        this.mixerProtocol = mixerProtocol;

        this.emberConnection = new DeviceTree(
                this.store.settings[0].deviceIp,
                this.store.settings[0].devicePort
            );
        let deviceRoot: any;
        this.emberConnection.connect()
        .then(() => {
            console.log("Getting Directory")
            return this.emberConnection.getDirectory();
        })
        .then((r: any) => {
            console.log("Directory :", r);
            this.deviceRoot = r;
            this.emberConnection.expand(r.elements[0])
            .then(() => {
                this.setupMixerConnection();
            })
        })
        .catch((e: any) => {
            console.log(e.stack);
        });

    }

    setupMixerConnection() {
        console.log("Ember Connected");

        let ch: number = 1;
        this.store.settings[0].numberOfChannelsInType.forEach((numberOfChannels, typeIndex) => {
            for (let channelTypeIndex=0; channelTypeIndex < numberOfChannels ; channelTypeIndex++) {
                this.subscribeFaderLevel(ch, typeIndex, channelTypeIndex);
                ch++;
            }
        })

        ch = 1;
        this.store.settings[0].numberOfChannelsInType.forEach((numberOfChannels, typeIndex) => {
            for (let channelTypeIndex=0; channelTypeIndex < numberOfChannels ; channelTypeIndex++) {
                this.subscribeChannelName(ch, typeIndex, channelTypeIndex);
                ch++;
            }
        })

/*
                .CHANNEL_VU)){
                    global.storeRedux.dispatch({
                        type:SET_VU_LEVEL,
                        channel: ch - 1,
                        level: message.args[0]
                    });
        */
        this.emberConnection
        .on('error', (error: any) => {
            console.log("Error : ", error);
            console.log("Lost EMBER connection");
        });

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
        this.emberConnection.getNodeByPath(this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.replace("{channel}", String(channelTypeIndex+1)))
        .then((node: any) => {
            this.emberNodeObject[ch-1] = node;
            this.emberConnection.subscribe(node, (() => {
                if (!this.store.channels[0].channel[ch-1].fadeActive
                    && !this.store.channels[0].channel[ch - 1].fadeActive
                    &&  node.contents.value > this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_OUT_GAIN[0].min) {
                    global.storeRedux.dispatch({
                        type: SET_FADER_LEVEL,
                        channel: ch-1,
                        level: node.contents.value
                    });
                    if (global.huiRemoteConnection) {
                        global.huiRemoteConnection.updateRemoteFaderState(ch-1, node.contents.value);
                    }
                }

            })
            )
        })
    }

    subscribeChannelName(ch: number, typeIndex: number, channelTypeIndex: number) {
        this.emberConnection.getNodeByPath(this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_NAME[0].mixerMessage.replace("{channel}", String(channelTypeIndex+1)))
        .then((node: any) => {
            this.emberConnection.subscribe(node, (() => {
                global.storeRedux.dispatch({
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

//            this.emberConnection.QualifiedParameter.setValue("1.1.1.1.1.1", 21)
//            this.emberConnection.getNodeByPath(message)
//            .then((response: any) => {
//                console.log("Node object :", response)
                this.emberConnection.setValue(
                    mixerMessage,
                    typeof value === 'number' ? value : parseFloat(value)
                )
//            })
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
        let channelType = this.store.channels[0].channel[channelIndex].channelType;
        let channelTypeIndex = this.store.channels[0].channel[channelIndex].channelTypeIndex;
        this.sendOutMessage(
            this.emberNodeObject[channelIndex],
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
            this.emberNodeObject[channelIndex],
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
            "string"
        );
    }
}

