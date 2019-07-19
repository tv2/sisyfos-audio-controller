//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform

//Utils:
import { IAutomationProtocol, AutomationPresets } from '../constants/AutomationPresets';
import { IChannel } from '../reducers/channelsReducer';

const AUTOMATION_OSC_PORT = 5255;
export class AutomationConnection {
    store: any;
    oscConnection: any;
    automationProtocol: IAutomationProtocol;

    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.automationProtocol = AutomationPresets[this.store.settings[0].automationProtocol]  || AutomationPresets.sofie;

        this.oscConnection = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: AUTOMATION_OSC_PORT
        });
        this.setupAutomationConnection();
    }

    setupAutomationConnection() {
        this.oscConnection
        .on("ready", () => {
            this.automationProtocol.initializeCommands.map((item) => {
                // this.sendOutMessage(item.oscMessage, 1, item.value, item.type);
                console.log("Listening for Automation via OSC over UDP.");
            });
        })
        .on('message', (message: any, timetag: number | undefined, info: any) => {
            console.log("RECIEVED AUTOMATION MESSAGE :", message.address, message.args[0]);
            //Set state of Sisyfos:
            if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_PGM_ON_OFF)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_PGM',
                    channel: ch - 1,
                    pgmOn: message.args[0]===1 ? true : false
                });
                if (message.args.length > 1) {
                    window.mixerGenericConnection.updateOutLevel(ch-1, parseFloat(message.args[1]));
                } else {
                    window.mixerGenericConnection.updateOutLevel(ch-1);
                }
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_PST_ON_OFF)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_PST',
                    channel: ch - 1,
                    pstOn: message.args[0]===1 ? true : false
                });
                window.mixerGenericConnection.updateOutLevel(ch-1);
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_FADER_LEVEL)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
                window.mixerGenericConnection.updateOutLevel(ch-1);
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .SNAP_RECALL)) {
                let snapNumber = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SNAP_RECALL',
                    snapIndex: snapNumber -1
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .SET_LABEL)) {
                    let ch = message.address.split("/")[2];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: ch -1,
                        label: message.args[0]
                    });
                    window.mixerGenericConnection.updateChannelName(ch-1);
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .X_MIX)) {
                window.storeRedux.dispatch({
                    type:'X_MIX'
                });
                window.mixerGenericConnection.updateOutLevels();
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_VISIBLE)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SHOW_CHANNEL',
                    channel: ch - 1,
                    showChannel: message.args[0]===1 ? true : false
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .FADE_TO_BLACK)) {
                    window.storeRedux.dispatch({
                        type:'FADE_TO_BLACK'
                });
                window.mixerGenericConnection.updateOutLevels();
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .SNAP_RECALL)) {
                let snapNumber = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SNAP_RECALL',
                    snapIndex: snapNumber -1
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .X_MIX)) {
                window.storeRedux.dispatch({
                    type:'X_MIX'
                });
                window.mixerGenericConnection.updateOutLevels();
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_VISIBLE)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SHOW_CHANNEL',
                    channel: ch - 1,
                    showChannel: message.args[0]===1 ? true : false
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                    .FADE_TO_BLACK)) {
                    window.storeRedux.dispatch({
                        type:'FADE_TO_BLACK'
                    });
                    window.mixerGenericConnection.updateOutLevels();
            // Get state from Producers Audio Mixer:
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .STATE_FULL)) {
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_FULL,
                    0,
                    JSON.stringify({
                        channel: this.store.channels[0].channel.map(({ faderLevel, pgmOn, pstOn }: IChannel) => ({
                            faderLevel, pgmOn, pstOn
                        }))
                    }),
                    "s",
                    info
                )
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .STATE_CHANNEL_PGM)) {
                let ch = message.address.split("/")[3];
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_CHANNEL_PGM,
                    ch,
                    this.store.channels[0].channel[ch-1].pgmOn,
                    "i",
                    info
                );
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .STATE_CHANNEL_PST)) {
                let ch = message.address.split("/")[3];
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_CHANNEL_PST,
                    ch,
                    this.store.channels[0].channel[ch-1].pstOn,
                    "i",
                    info
                );
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .STATE_CHANNEL_FADER_LEVEL)) {
                let ch = message.address.split("/")[3];
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_CHANNEL_FADER_LEVEL,
                    ch,
                    this.store.channels[0].channel[ch-1].faderLevel,
                    "f",
                    info
                );
            }
        })
        .on('error', (error: any) => {
            console.log("Error : ", error);
            console.log("Lost OSC Automation connection");
        });

        this.oscConnection.open();
        console.log('OSC Automation listening on port ', AUTOMATION_OSC_PORT);

    }

    checkOscCommand(message: string, command: string) {
        if (message === command) return true;

        let cmdArray = command.split("{value1}");

        if (
            message.substr(0, cmdArray[0].length) === cmdArray[0] &&
            (message.substr(-cmdArray[1].length) === cmdArray[1] || cmdArray[1].length === 0 ) &&
            message.length >= command.replace("{value1}", "").length
        ) {
            return true;
        } else {
            return false;
        }
    }

    sendOutMessage(oscMessage: string, channel: number, value: string, type: string, to: { ip: string, port: number }) {
        let channelString = this.automationProtocol.leadingZeros ? ("0"+channel).slice(-2) : channel.toString();
        let message = oscMessage.replace(
                "{value1}",
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
            }, to.ip, to.port);
        }
    }
}

