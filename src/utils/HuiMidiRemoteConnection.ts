//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import WebMidi, { INoteParam, IMidiChannel } from 'webmidi';

//Utils:
import { IRemoteProtocol,
    RemoteFaderPresets,
    IMidiSendMessage,
    MidiSendTypes,
    IMidiReceiveMessage,
    MidiReceiveTypes } from '../constants/RemoteFaderPresets';
import { IMixerProtocol, MixerProtocolPresets } from '../constants/MixerProtocolPresets';



export class HuiMidiRemoteConnection {
    store: any;
    mixerConnection: any;
    remoteProtocol: IRemoteProtocol;
    midiReceiveTypes = MidiReceiveTypes;
    mixerProtocol: any;
    midiInput: any;
    midiOutput:any;
    activeHuiChannel: number = 0;

    constructor(mixerConnection: any) {
        this.mixerConnection = mixerConnection;
        this.convertFromRemoteLevel = this.convertFromRemoteLevel.bind(this);
        this.convertToRemoteLevel = this.convertToRemoteLevel.bind(this);
        this.updateRemoteFaderState = this.updateRemoteFaderState.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.remoteProtocol = RemoteFaderPresets.hui;
        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol]  || MixerProtocolPresets.genericMidi;


        WebMidi.enable((err) => {

            if (err) {
                console.log("Remote MidiController connection could not be enabled.", err);
            }

            this.midiInput = WebMidi.getInputByName(this.store.settings[0].remoteFaderMidiInputPort);
            this.midiOutput = WebMidi.getOutputByName(this.store.settings[0].remoteFaderMidiOutputPort);

            if (this.midiInput && this.midiOutput ) {
                console.log("Remote Midi Controller connected on port")
                console.log("Midi input :", this.store.settings[0].remoteFaderMidiInputPort)
                console.log("Midi output :", this.store.settings[0].remoteFaderMidiOutputPort)

                this.setupRemoteFaderConnection();
            } else {
                console.log("Remote Midi Controller not found or not configured.")
            }
        });
    }

    setupRemoteFaderConnection() {
        this.midiInput.addListener(this.midiReceiveTypes[this.remoteProtocol.fromRemote.CHANNEL_FADER_LEVEL.type], undefined,
            (message: any) => {
                if (message.data[1] = 15) {
                    if (message.data[2]<9) {
                        console.log("Active channel :", message.data);
                        this.activeHuiChannel = message.data[2];
                    } else if (message.data[2] && message.data[2] === 65) {

                        console.log("Select channel :", this.activeHuiChannel);
                        window.storeRedux.dispatch({
                            type:'TOGGLE_PGM',
                            channel: this.activeHuiChannel
                        });
                        this.mixerConnection.updateOutLevel(this.activeHuiChannel);
                        this.updateRemotePgmPstPfl(this.activeHuiChannel);
                    }
                }
                if (message.data[1] < 9) {
                    //Fader changed:
                    console.log("Received Fader message (" + message.data + ").");
                    window.storeRedux.dispatch({
                        type:'SET_FADER_LEVEL',
                        channel: message.data[1],
                        level: this.convertFromRemoteLevel(message.data[2])
                    });
                    this.mixerConnection.updateOutLevel(message.data[1]);
                    this.updateRemoteFaderState(message.data[1], this.convertFromRemoteLevel(message.data[2]))
                } else if (46 < message.data[1] && message.data[1] < 55) {
                    // Selectbutton pressed :
                    console.log("Received Select message (" + message.data + ").");
                    window.storeRedux.dispatch({
                        type:'TOGGLE_PGM',
                        channel: message.data[1]-41
                    });
                    this.mixerConnection.updateOutLevel(message.data[1]-41);
                    this.updateRemoteFaderState(message.data[1]-41, this.convertFromRemoteLevel(message.data[2]))
                }
            }
        );
        //for testing:
        this.midiInput.addListener('noteon', "all",
            (error: any) => {
                console.log("Received 'noteon' message (" + error.note.name + error.note.octave + ").");
            }
        );

    }

    sendOutMessage(CtrlMessage: IMidiSendMessage, channel: number, value: string) {
        let convertValue = this.convertToRemoteLevel(parseFloat(value));
        if (CtrlMessage.type === MidiSendTypes.sendControlChange) {
            this.midiOutput.sendControlChange(CtrlMessage.message, convertValue, channel);
        } else if (CtrlMessage.type === MidiSendTypes.playNote) {
            this.midiOutput.playNote(CtrlMessage.message, convertValue, channel);
        } else if (CtrlMessage.type === MidiSendTypes.stopNote) {
            this.midiOutput.stopNote(CtrlMessage.message, convertValue, channel);
        } else if (CtrlMessage.type === MidiSendTypes.sendPitchBend) {
            this.midiOutput.sendPitchBend(convertValue, channel);
        }
    }
    convertToRemoteLevel(level: number) {

        let oldMin = this.mixerProtocol.fader.min;
        let oldMax = this.mixerProtocol.fader.max;
        let newMin = this.remoteProtocol.fader.min;
        let newMax = this.remoteProtocol.fader.max;

        let indexLevel = (level/(oldMax-oldMin)) * (newMax-newMin)
        let newLevel = newMin + indexLevel;
        return newLevel //convert from mixer min-max to remote min-max
    }

    convertFromRemoteLevel(level: number) {

        let oldMin = this.remoteProtocol.fader.min;
        let oldMax = this.remoteProtocol.fader.max;
        let newMin = this.mixerProtocol.fader.min;
        let newMax = this.mixerProtocol.fader.max;

        let indexLevel = (level/(oldMax-oldMin)) * (newMax-newMin)
        let newLevel = newMin + indexLevel;

        return newLevel //convert from mixer min-max to remote min-max
    }

    updateRemoteFaderState(channelIndex: number, outputLevel: number) {
        console.log("Send fader update :", "Channel index : ", channelIndex, "OutputLevel : ", this.convertToRemoteLevel(outputLevel))
        this.midiOutput.sendControlChange(
            (channelIndex),
            this.convertToRemoteLevel(outputLevel),
            1
        );
        this.midiOutput.sendControlChange(
            (32+channelIndex),
            0,
            1
        );
        this.updateRemotePgmPstPfl(channelIndex)

    }

    updateRemotePgmPstPfl(channelIndex: number) {
        this.midiOutput.sendControlChange(
            (65+channelIndex),
            1,
            1
        );

    }
}

