import { DeviceTree, Ember } from 'emberplus';

//Utils:
import { IMixerProtocol, MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IStore } from '../reducers/indexReducer';

export class EmberMixerConnection {
    store: IStore;
    mixerProtocol: IMixerProtocol;
    cmdChannelIndex: number;
    emberConnection: any;
    deviceRoot: any;


    constructor(mixerProtocol: IMixerProtocol) {
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
        console.log("Ember Connected");
        console.log(this.deviceRoot.elements[0].children[0].children[0].children[0].contents.value);
        this.emberConnection.getNodeByPath("Sapphire/Sources/Source1/Gain")
        .then((response: any) => {
            console.log(response.contents.value);
        })
        this.emberConnection.invokeFunction(new Ember.QualifiedFunction("Sapphire/Sources/Source1/Gain"), ["Gain", new Ember.ParameterContents("value", 'real'), new Ember.ParameterContents(100, 'real')])
        .then((response: any) => {
            console.log(response.contents.value);
        })

        this.emberConnection
        .on("ready", () => {
            console.log("Receiving state of desk");
            this.mixerProtocol.initializeCommands.map((item) => {
                if (item.oscMessage.includes("{channel}")) {
                    this.store.channels[0].channel.map((channel: any, index: any) => {
                        this.sendOutRequest(item.oscMessage,(index +1));
                    });
                } else {
                    this.sendOutMessage(item.oscMessage, 1, item.value, item.type);
                }
            });
        })
        .on('message', (message: any) => {
            if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_VU)){
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
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
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_OUT_GAIN)){
                let ch = message.address.split("/")[this.cmdChannelIndex];
                if (this.mixerProtocol.mode === 'master'
                    && !this.store.channels[0].channel[ch - 1].fadeActive
                    &&  message.args[0] > this.mixerProtocol.fader.min)
                {
                    window.storeRedux.dispatch({
                        type:'SET_FADER_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                    if (!this.store.channels[0].channel[ch - 1].pgmOn) {
                        window.storeRedux.dispatch({
                            type:'TOGGLE_PGM',
                            channel: ch - 1
                        });
                    }

                    if (window.huiRemoteConnection) {
                        window.huiRemoteConnection.updateRemoteFaderState(ch-1, message.args[0]);
                    }

                }
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .CHANNEL_NAME)) {
                                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: ch - 1,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            } else if ( this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
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
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
                .GRP_VU)){
                    let ch = message.address.split("/")[this.cmdChannelIndex];
                    window.storeRedux.dispatch({
                        type:'SET_GRP_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
            } else if (this.checkOscCommand(message.address, this.mixerProtocol.fromMixer
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
        .on('error', (error: any) => {
            console.log("Error : ", error);
            console.log("Lost EMBER connection");
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
                command.oscMessage,
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
/*            this.oscConnection.send({
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


    sendOutGrpMessage(oscMessage: string, channel: number, value: string | number, type: string) {
        let message = oscMessage.replace(
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

    sendOutRequest(oscMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        let message = oscMessage.replace(
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
                this.mixerProtocol.toMixer.PFL_ON.oscMessage,
                channelIndex+1,
                this.mixerProtocol.toMixer.PFL_ON.value,
                this.mixerProtocol.toMixer.PFL_ON.type
            );
        } else {
            this.sendOutMessage(
                this.mixerProtocol.toMixer.PFL_OFF.oscMessage,
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

