//Node Modules:
import os from 'os'; // Used to display (log) network addresses on local machine
import WebMidi, { INoteParam, IMidiChannel } from 'webmidi';

//Utils:
import { MixerProtocolPresets } from './MixerProtocolPresets';

export class MidiMixerConnection {
    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol];


        WebMidi.enable((err) => {

            if (err) {
                console.log("WebMidi could not be enabled.", err);
            }

            // Viewing available inputs and outputs
            console.log("Midi inputs : ", WebMidi.inputs);
            console.log("Midi outputs : ", WebMidi.outputs);

            // Display the current time
            console.log("Midi time : ", WebMidi.time);

            this.midiInput = WebMidi.getInputByName("IAC-driver IAC-bus 1");
            this.midiOutput = WebMidi.getOutputByName("IAC-driver IAC-bus 1");

            this.setupMixerConnection();
        });
    }

    setupMixerConnection() {
        this.midiInput.addListener('controlchange', "all",
            (e) => {
                console.log("Received 'controlchange' message (" + e.data + ").");
                if (e.data[0] === 39) {
                    window.storeRedux.dispatch({
                        type:'SET_FADER_LEVEL',
                        channel: e.channel - 1,
                        level: e.data[1]
                    });
                    if (this.store.channels[0].channel[e.channel - 1].pgmOn) {
                        this.updateOutLevel(e.channel-1);
                    }
                }
            }
        );
        this.midiInput.addListener('noteon', "all",
            (e) => {
                console.log("Received 'controlchange' message (" + e.note.name + e.note.octave + ").");
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
                command.value,
                command.type
            );
        });
    }

    sendOutMessage(CtrlMessage, channel, value, type) {

        this.midiOutput.playNote("C3");

    }

    updateOutLevel(channelIndex) {
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

}

