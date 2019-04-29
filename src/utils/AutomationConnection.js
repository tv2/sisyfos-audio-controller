//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import osc from 'osc'; //Using OSC fork from PieceMeta/osc.js as it has excluded hardware serialport support and thereby is crossplatform

//Utils:
import { AutomationPresets } from '../constants/AutomationPresets';

const AUTOMATION_OSC_PORT = 5255;
export class AutomationConnection {
    constructor(initialStore, mixerConnection) {
        this.mixerConnection = mixerConnection;
        this.sendOutMessage = this.sendOutMessage.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.automationProtocol = AutomationPresets[this.store.settings[0].automationProtocol]  || AutomationPresets.sofie;

        this.oscConnection = new osc.UDPPort({
            localAddress: "127.0.0.1",
            localPort: AUTOMATION_OSC_PORT
        });
        this.setupAutomationConnection();
    }

    setupAutomationConnection() {
        this.oscConnection
        .on("ready", () => {
            this.automationProtocol.initializeCommands.map((item) => {
                this.sendOutMessage(item.oscMessage, 1, item.value, item.type);
                console.log("Listening for Automation via OSC over UDP.");
            });
        })
        .on('message', (message) => {
            console.log("RECIEVED AUTOMATION MESSAGE :", message.address, message.args[0]);
            if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_PGM_ON_OFF)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_PGM',
                    channel: ch - 1,
                    pgmOn: message.args[0]
                });
                this.mixerConnection.updateOutLevel(ch-1);
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_PST_ON_OFF)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_PST',
                    channel: ch - 1,
                    pstOn: message.args[0]
                });
                this.mixerConnection.updateOutLevel(ch-1);
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_FADER_LEVEL)){
                let ch = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: ch - 1,
                    level: message.args[0]
                });
                this.mixerConnection.updateOutLevel(ch-1);
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .SNAP_MIX)) {
                let snapNumber = message.address.split("/")[2];
                window.storeRedux.dispatch({
                    type:'SNAP_MIX',
                    snapIndex: snapNumber -1
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .X_MIX)) {
                window.storeRedux.dispatch({
                    type:'X_MIX'
                });
                this.mixerConnection.updateOutLevels();
            }
        })
        .on('error', (error) => {
            console.log("Error : ", error);
            console.log("Lost OSC Automation connection");
        });

        this.oscConnection.open();
        console.log('OSC Automation listening on port ', AUTOMATION_OSC_PORT);

    }

    checkOscCommand(message, command) {
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

    sendOutMessage(oscMessage, channel, value, type) {
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
            });
        }
    }
}

