//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import { MidiMixerConnection } from '../utils/MidiMixerConnection';

export class MixerConnection {
    constructor(initialStore) {
        this.updateOutLevels = this.updateOutLevels.bind(this);
        this.updateOutLevel = this.updateOutLevel.bind(this);
        this.fadeInOut = this.fadeInOut.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol] || MixerProtocolPresets.genericMidi;
        if (this.mixerProtocol.protocol === 'OSC') {
            this.mixerConnection = new OscMixerConnection(this.fadeInOut);
        } else if (this.mixerProtocol.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection(this.fadeInOut);
        }
    }

    updateOutLevels() {
        this.store.channels[0].channel.map((channel, index) => {
            this.fadeInOut(index);
            this.mixerConnection.updateOutLevel(index);
        });
    }

    updateOutLevel(channelIndex) {
        this.fadeInOut(channelIndex);
        this.mixerConnection.updateOutLevel(channelIndex);
    }

    fadeInOut (channelIndex){
        if (this.store.channels[0].channel[channelIndex].pgmOn) {
            let val = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);

            let targetVal = this.mixerProtocol.fader.zero;
            if (this.mixerProtocol.mode === "master") {
                targetVal = parseFloat(this.store.channels[0].channel[channelIndex].faderLevel);
            }

            let timer = setInterval(() => {
                val = val + 3*this.mixerProtocol.fader.step;
                if ( val >= targetVal){
                    val = targetVal;
                    clearInterval(timer);
                    return true;
                }
                window.storeRedux.dispatch({
                    type:'SET_OUTPUT_LEVEL',
                    channel: channelIndex,
                    level: val
                });
                this.mixerConnection.updateOutLevel(channelIndex);
            }, 1);
        } else {
            let val = this.store.channels[0].channel[channelIndex].outputLevel;
            let timer = setInterval(() => {
                val = val - 3*this.mixerProtocol.fader.step;
                if ( val <= this.mixerProtocol.fader.min){
                    val = this.mixerProtocol.fader.min;
                    clearInterval(timer);
                    return true;
                }
                window.storeRedux.dispatch({
                    type:'SET_OUTPUT_LEVEL',
                    channel: channelIndex,
                    level: val
                });
                this.mixerConnection.updateOutLevel(channelIndex);
            }, 1);
        }
    }
}
