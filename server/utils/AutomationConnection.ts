//Node Modules:
const osc = require('osc')

//Utils:
import { IAutomationProtocol, AutomationPresets } from '../constants/AutomationPresets';
import { IFader } from '../reducers/fadersReducer';
import { 
    SET_FADER_LEVEL, 
    SET_CHANNEL_LABEL,
    SET_PGM,
    SET_VO,
    SET_PST,
    SET_PST_VO,
    SET_MUTE,
    SHOW_CHANNEL,
    X_MIX,
    FADE_TO_BLACK,
    CLEAR_PST,
    SNAP_RECALL
} from '../reducers/faderActions'


const AUTOMATION_OSC_PORT = 5255;
export class AutomationConnection {
    store: any;
    oscConnection: any;
    automationProtocol: IAutomationProtocol;

    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this);

        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
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
                if (!this.store.faders[0].fader[ch - 1].ignoreAutomation) {
                    if (message.args[0] === 1) {
                        global.mixerGenericConnection.checkForAutoResetThreshold(ch - 1)
                        global.storeRedux.dispatch({
                            type: SET_PGM,
                            channel: ch - 1,
                            pgmOn: true
                        });
                    } else if (message.args[0] === 2) {
                        global.mixerGenericConnection.checkForAutoResetThreshold(ch - 1)
                        global.storeRedux.dispatch({
                            type: SET_VO,
                            channel: ch - 1,
                            voOn: true
                        });
                    } else {
                        global.storeRedux.dispatch({
                            type: SET_PGM,
                            channel: ch - 1,
                            pgmOn: false
                        });
                    }

                    if (message.args.length > 1) {
                        global.mixerGenericConnection.updateOutLevel(ch-1, parseFloat(message.args[1]));
                    } else {
                        global.mixerGenericConnection.updateOutLevel(ch-1);
                    }
                }

            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_PST_ON_OFF)){
                let ch = message.address.split("/")[2];
                if (!this.store.faders[0].fader[ch - 1].ignoreAutomation) {

                if (message.args[0] === 1) {
                    global.storeRedux.dispatch({
                        type: SET_PST,
                        channel: ch - 1,
                        pstOn: true
                    });
                } else if (message.args[0] === 2) {
                    global.storeRedux.dispatch({
                        type: SET_PST_VO,
                        channel: ch - 1,
                        pstVoOn: true
                    });
                } else {
                    global.storeRedux.dispatch({
                        type: SET_PST,
                        channel: ch - 1,
                        pstOn: false
                    });
                }
                global.mixerGenericConnection.updateNextAux(ch-1);
            }
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_MUTE)){
                let ch = message.address.split("/")[2];
                if (!this.store.faders[0].fader[ch - 1].ignoreAutomation) {

                if (message.args[0] === 1) {
                    global.storeRedux.dispatch({
                        type: SET_MUTE,
                        channel: ch - 1,
                        muteOn: true
                    });
                } else {
                    global.storeRedux.dispatch({
                        type: SET_MUTE,
                        channel: ch - 1,
                        pstOn: false
                    });
                }
                global.mixerGenericConnection.updateMuteState(ch-1);
            }
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_FADER_LEVEL)){
                let ch = message.address.split("/")[2];
                if (!this.store.faders[0].fader[ch - 1].ignoreAutomation) {

                global.storeRedux.dispatch({
                    type: SET_FADER_LEVEL,
                    channel: ch - 1,
                    level: message.args[0]
                });
                global.mixerGenericConnection.updateOutLevel(ch-1);
            }
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .SNAP_RECALL)) {
                let snapNumber = message.address.split("/")[2];
                global.storeRedux.dispatch({
                    type: SNAP_RECALL,
                    snapIndex: snapNumber -1
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .SET_LABEL)) {
                    let ch = message.address.split("/")[2];
                    global.storeRedux.dispatch({
                        type: SET_CHANNEL_LABEL,
                        channel: ch -1,
                        label: message.args[0]
                    });
                    global.mixerGenericConnection.updateChannelName(ch-1);
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .X_MIX)) {
                global.storeRedux.dispatch({
                    type: X_MIX
                });
                global.mixerGenericConnection.updateOutLevels();
            } else if ( this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CHANNEL_VISIBLE)){
                let ch = message.address.split("/")[2];
                global.storeRedux.dispatch({
                    type: SHOW_CHANNEL,
                    channel: ch - 1,
                    showChannel: message.args[0]===1 ? true : false
                });
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .FADE_TO_BLACK)) {
                    global.storeRedux.dispatch({
                        type: FADE_TO_BLACK
                });
                global.mixerGenericConnection.updateFadeToBlack();
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .CLEAR_PST)) {
                    global.storeRedux.dispatch({
                        type: CLEAR_PST
                });
                global.mixerGenericConnection.updateOutLevels();
            // Get state from Producers Audio Mixer:
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .STATE_FULL)) {
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_FULL,
                    0,
                    JSON.stringify({
                        channel: this.store.faders[0].fader.map(({ faderLevel, pgmOn, voOn, pstOn, showChannel }: IFader) => ({
                            faderLevel, pgmOn, voOn, pstOn, showChannel
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
                .STATE_CHANNEL_MUTE)) {
                let ch = message.address.split("/")[3];
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_CHANNEL_MUTE,
                    ch,
                    this.store.channels[0].channel[ch-1].muteOn,
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
            } else if (this.checkOscCommand(message.address, this.automationProtocol.fromAutomation
                .PING)) {
                let pingValue = this.store.settings[0].mixerOnline ? message.address.split("/")[2] : 'offline';
                
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.PONG,
                    0,
                    pingValue,
                    "s",
                    info
                )
            }

            // TODO: Implement better emit handling so only relevant messages updates clients:
            global.socketServer.emit('set-store', global.storeRedux.getState())
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

    sendOutMessage(oscMessage: string, channel: number, value: string, type: string, to: { address: string, port: number }) {
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
            }, to.address, to.port);
        }
    }
}

