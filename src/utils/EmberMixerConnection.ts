import { DeviceTree, Ember } from 'emberplus';

//Utils:
import { IEmberMixerProtocol, MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IStore } from '../reducers/indexReducer';

export class EmberMixerConnection {
    store: IStore;
    mixerProtocol: IEmberMixerProtocol;
    cmdChannelIndex: number;
    emberConnection: any;
    deviceRoot: any;


    constructor(mixerProtocol: IEmberMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = mixerProtocol;

        this.cmdChannelIndex = this.mixerProtocol.fromMixer.CHANNEL_OUT_GAIN.split('/').findIndex(ch => ch==='{channel}');

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
        let node: any;
        console.log("Ember Connected");

        for (let ch=1; ch <= this.store.settings[0].numberOfChannels ; ch++) {
            this.emberConnection.getNodeByPath(this.mixerProtocol.fromMixer.CHANNEL_FADER_LEVEL.replace("{channel}", String(ch)))
            .then((node: any) => {
                this.emberConnection.subscribe(node, (() => {
                        window.storeRedux.dispatch({
                            type:'SET_FADER_LEVEL',
                            channel: ch - 1,
                            level: node.contents.value
                        });

                        if (window.huiRemoteConnection) {
                            window.huiRemoteConnection.updateRemoteFaderState(ch-1, node.contents.value);
                        }
                        console.log("subscription :", node.contents.value)
                })
                )
            })
        }

/*

        .on('message', (message: any) => {
            if (this.checkEmberCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_VU)){
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
            } else if ( this.checkEmberCommand(message.address, this.mixerProtocol.fromMixer
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
            } else if (this.checkEmberCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_NAME)) {
                                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: ch - 1,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            } else if ( this.checkEmberCommand(message.address, this.mixerProtocol.fromMixer
                .GRP_OUT_GAIN)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                if (!this.store.channels[0].grpFader[ch - 1].fadeActive
                    &&  message.args[0] > this.mixerProtocol.fader.min)
                {
                    window.storeRedux.dispatch({
                        type:'SET_GRP_FADER_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                    if (!this.store.channels[0].grpFader[ch - 1].pgmOn) {
                        window.storeRedux.dispatch({
                            type:'TOGGLE_GRP_PGM',
                            channel: ch - 1
                        });
                    }
                }
            } else if (this.checkEmberCommand(message.address, this.mixerProtocol.fromMixer
                .GRP_VU)){
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_GRP_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
            } else if (this.checkEmberCommand(message.address, this.mixerProtocol.fromMixer
                .GRP_NAME)) {
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_GRP_LABEL',
                        channel: ch - 1,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            }
        })
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
            );
        if (message != 'none') {
            this.emberConnection.getNodeByPath(message)
            .then((response: any) => {
                this.emberConnection.setValue(
                    response,
                    typeof value === 'number' ? value : parseFloat(value)
                )
            })
        }
    }


    sendOutGrpMessage(mixerMessage: string, channel: number, value: string | number, type: string) {
        let message = mixerMessage.replace(
                "{channel}",
                String(channel)
            );
        if (message != 'none') {
/*
            this.oscConnection.send({
                address: message,
                args: [
                    {
                        type: type,
                        value: value
                    }
                ]
            });
*/
        }
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


    updateGrpOutLevel(channelIndex: number) {
        this.sendOutGrpMessage(
            this.mixerProtocol.toMixer.GRP_OUT_GAIN,
            channelIndex+1,
            this.store.channels[0].grpFader[channelIndex].outputLevel,
            "f"
        );
    }

    updateGrpFadeIOLevel(channelIndex: number, outputLevel: number) {
        this.sendOutGrpMessage(
            this.mixerProtocol.toMixer.GRP_OUT_GAIN,
            channelIndex+1,
            String(outputLevel),
            "f"
        );
    }

}

