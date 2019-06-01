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



export class MidiRemoteConnection {
    store: any;
    mixerConnection: any;
    remoteProtocol: IRemoteProtocol;
    mixerProtocol: any;
    midiInput: any;
    midiOutput:any;

    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.convertFromRemoteLevel = this.convertFromRemoteLevel.bind(this);
        this.convertToRemoteLevel = this.convertToRemoteLevel.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.remoteProtocol = RemoteFaderPresets[this.store.settings[0].remoteProtocol]  || RemoteFaderPresets.hui;
        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol]  || MixerProtocolPresets.genericMidi;


        WebMidi.enable((err) => {

            if (err) {
                console.log("WebMidi could not be enabled.", err);
            }

            // Viewing available inputs and outputs
            console.log("Midi inputs : ", WebMidi.inputs);
            console.log("Midi outputs : ", WebMidi.outputs);

            // Display the current time
            console.log("Midi time : ", WebMidi.time);

            this.midiInput = WebMidi.getInputByName("IAC-driver ProducersMixer");
            this.midiOutput = WebMidi.getOutputByName("IAC-driver ProducersMixer");

            this.setupMixerConnection();
        });
    }

    setupMixerConnection() {
        this.midiInput.addListener(MidiReceiveTypes[this.remoteProtocol.fromRemote.CHANNEL_FADER_LEVEL.type], undefined,
            (message: any) => {
                console.log("Received 'controlchange' message (" + message.data + ").");
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: message.channel - 1,
                    level: message.data[2]
                });
                this.updateOutLevel(message.channel-1);
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

        let indexLevel = (level/(oldMax-oldMin))/ (newMax-newMin)
        let newLevel = newMin + indexLevel;
        return newLevel //convert from mixer min-max to remote min-max
    }

    convertFromRemoteLevel(level: number) {

        let oldMin = this.remoteProtocol.fader.min;
        let oldMax = this.remoteProtocol.fader.max;
        let newMin = this.mixerProtocol.fader.min;
        let newMax = this.mixerProtocol.fader.max;

        let indexLevel = (level/(oldMax-oldMin))/ (newMax-newMin)
        let newLevel = newMin + indexLevel;

        return newLevel //convert from mixer min-max to remote min-max
    }


    updateOutLevel(channelIndex: number) {
        if (this.remoteProtocol.mode === "master" && this.store.channels[0].channel[channelIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
                channel: channelIndex,
                level: this.store.channels[0].channel[channelIndex].faderLevel
            });
        }

        this.sendOutMessage(
            this.remoteProtocol.toRemote.STATE_CHANNEL_FADER_LEVEL,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].faderLevel
        );
    }

    updatePflState(channelIndex: number) {

        if (this.store.channels[0].channel[channelIndex].pflOn = true) {
            this.sendOutMessage(
                this.remoteProtocol.toRemote.STATE_CHANNEL_PFL,
                channelIndex+1,
                "1"
            );
        } else {
            this.sendOutMessage(
                this.remoteProtocol.toRemote.STATE_CHANNEL_PFL,
                channelIndex+1,
                "0"
            );
        }
    }


    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        this.sendOutMessage(
            this.remoteProtocol.toRemote.STATE_CHANNEL_FADER_LEVEL,
            channelIndex+1,
            String(outputLevel)
        );
    }

}

