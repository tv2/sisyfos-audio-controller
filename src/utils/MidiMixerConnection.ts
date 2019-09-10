//Node Modules:
import * as os from 'os'; // Used to display (log) network addresses on local machine
import WebMidi, { INoteParam, IMidiChannel } from 'webmidi';

//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocol } from '../constants/MixerProtocolInterface';

export class MidiMixerConnection {
    store: any;
    mixerProtocol: IMixerProtocol;
    midiInput: any;
    midiOutput:any;

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this);
        this.pingMixerCommand = this.pingMixerCommand.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = mixerProtocol || MixerProtocolPresets.genericMidi;

        WebMidi.enable((err) => {

            if (err) {
                console.log("WebMidi could not be enabled.", err);
            }
            console.log("Connecting Mixer Midi input on port :", this.store.settings[0].mixerMidiInputPort);
            console.log("Connecting Mixer Midi output on port :", this.store.settings[0].mixerMidiOutputPort);
            this.midiInput = WebMidi.getInputByName(this.store.settings[0].mixerMidiInputPort);
            this.midiOutput = WebMidi.getOutputByName(this.store.settings[0].mixerMidiOutputPort);

            this.setupMixerConnection();
        });
    }

    setupMixerConnection() {
        this.midiInput.addListener('controlchange', 1,
            (message: any) => {
                console.log("Received 'controlchange' message (" + message.data + ").");
                if (message.data[1] >= parseInt(this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage)
                    && message.data[1] <= parseInt(this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage) + 24) {
                    let ch = 1 + message.data[1] - parseInt(this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage)
                    let faderChannel = 1 + this.store.channels[0].channel[ch - 1].assignedFader
                    window.storeRedux.dispatch({
                        type:'SET_FADER_LEVEL',
                        channel: faderChannel - 1,
                        level: message.data[2]
                    });
                    if (!this.store.faders[0].fader[faderChannel - 1].pgmOn) {
                        window.storeRedux.dispatch({
                            type:'TOGGLE_PGM',
                            channel: this.store.channels[0].channel[ch - 1].assignedFader
                        });
                    }
                    window.huiRemoteConnection.updateRemoteFaderState(faderChannel - 1, this.store.faders[0].fader[faderChannel - 1].faderLevel)
                    if (this.store.faders[0].fader[faderChannel - 1].pgmOn && this.mixerProtocol.mode === 'master')
                    {
                        this.store.channels[0].channel.map((channel: any, index: number) => {
                            if (channel.assignedFader === faderChannel - 1) {
                                this.updateOutLevel(index);
                            }
                        })
                    }
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
                this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_VU)
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
                this.checkOscCommand(message.address, this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_NAME)
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
                command.mixerMessage,
                0,
                command.value
            );
        });
    }

    sendOutMessage(ctrlMessage: string, channel: number, value: string) {
        if (ctrlMessage != "none" && 0 <= parseFloat(value) && parseFloat(value) <= 127) {
            let ctrlMessageInt = (parseInt(ctrlMessage) + channel - 1)
            this.midiOutput.sendControlChange(ctrlMessageInt, value, 1);
        }
    }

    updateOutLevel(channelIndex: number) {
        let faderIndex = this.store.channels[0].channel[channelIndex].assignedFader;
        if (this.mixerProtocol.mode === "master" && this.store.faders[0].fader[faderIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
                channel: channelIndex,
                level: this.store.faders[0].fader[faderIndex].faderLevel
            });
        }
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelIndex+1,
            this.store.channels[0].channel[channelIndex].outputLevel
        );
        /* Client mode is disabled
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_FADER_LEVEL[0].mixerMessage,
            channelIndex+1,
            this.store.faders[0].fader[channelIndex].faderLevel
        );
        */
    }

    updatePflState(channelIndex: number) {

        if (this.store.channels[0].channel[channelIndex].pflOn = true) {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[0].toMixer.PFL_ON[0].mixerMessage,
                channelIndex+1,
                this.mixerProtocol.channelTypes[0].toMixer.PFL_ON[0].value
            );
        } else {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[0].toMixer.PFL_OFF[0].mixerMessage,
                channelIndex+1,
                this.mixerProtocol.channelTypes[0].toMixer.PFL_OFF[0].value
            );
        }
    }


    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_OUT_GAIN[0].mixerMessage,
            channelIndex+1,
            String(outputLevel)
        );
    }


    updateChannelName(channelIndex: number) {
        let channelName = this.store.channels[0].channel[channelIndex].label;
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_NAME[0].mixerMessage,
            channelIndex+1,
            channelName
        );
    }

}

