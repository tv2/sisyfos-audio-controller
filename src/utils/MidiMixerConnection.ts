//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import WebMidi, { INoteParam, IMidiChannel } from 'webmidi';

//Utils:
import { IMixerProtocol, MixerProtocolPresets } from '../constants/MixerProtocolPresets';

export class MidiMixerConnection {
    store: any;
    mixerProtocol: IMixerProtocol;
    midiInput: any;
    midiOutput:any;

    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

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
        this.midiInput.addListener('controlchange', this.mixerProtocol.fromMixer.CHANNEL_FADER_LEVEL,
            (error: any) => {
                console.log("Received 'controlchange' message (" + error.data + ").");
                window.storeRedux.dispatch({
                    type:'SET_FADER_LEVEL',
                    channel: error.channel - 1,
                    level: error.data[2]
                });
                if (this.store.channels[0].channel[error.channel - 1].pgmOn && this.mixerProtocol.mode === 'master')
                {
                    this.updateOutLevel(error.channel-1);
                }
            }
        );
        this.midiInput.addListener('noteon', "all",
            (error: any) => {
                console.log("Received 'noteon' message (" + error.note.name + error.note.octave + ").");
            }
        );
/*
            if (
                this.checkOscCommand(message.address, this.mixerProtocol.fromMixer.CHANNEL_VU)
            ) {
                if (this.store.settings[0].mixerProtocol === 'behringer') {
                    behringerMeter(message.args);
                } else {
                    let ch = message.address.split("/")[2];
                    window.storeRedux.dispatch({
                        type:'SET_VU_LEVEL',
                        channel: ch - 1,
                        level: message.args[0]
                    });
                }
            }
            if (
                this.checkOscCommand(message.address, this.mixerProtocol.fromMixer.CHANNEL_NAME)
            ) {
                    let ch = message.address.split("/")[2];
                    window.storeRedux.dispatch({
                        type:'SET_CHANNEL_LABEL',
                        channel: ch - 1,
                        label: message.args[0]
                    });
                console.log("OSC message: ", message.address);
            }
*/
return true;
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
                command.value
            );
        });
    }

    sendOutMessage(CtrlMessage: string, channel: number, value: string) {
        this.midiOutput.sendControlChange(CtrlMessage, value, channel);
    }

    updateOutLevel(channelIndex: number) {
        if (this.mixerProtocol.mode === "master" && this.store.channels[0].channel[channelIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
                channel: channelIndex,
                level: this.store.channels[0].channel[channelIndex].faderLevel
            });
        }
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].outputLevel
        );
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_FADER_LEVEL,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].faderLevel
        );
    }

    updatePflState(channelIndex: number) {

        if (this.store.channels[0].channel[channelIndex].pflOn = true) {
            this.sendOutMessage(
                this.mixerProtocol.toMixer.PFL_ON.oscMessage,
                channelIndex+1,
                this.mixerProtocol.toMixer.PFL_ON.value
            );
        } else {
            this.sendOutMessage(
                this.mixerProtocol.toMixer.PFL_OFF.oscMessage,
                channelIndex+1,
                this.mixerProtocol.toMixer.PFL_OFF.value
            );
        }
    }


    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        this.sendOutMessage(
            this.mixerProtocol.toMixer.CHANNEL_OUT_GAIN,
            channelIndex+1,
            String(outputLevel)
        );
    }

}

