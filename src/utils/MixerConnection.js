//Utils:
import { MixerProtocolPresets } from './MixerProtocolPresets';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import {MidiMixerConnection } from '../utils/MidiMixerConnection';

export class MixerConnection {
    constructor(initialStore) {
        this.updateOutLevels = this.updateOutLevels.bind(this);
        this.updateOutLevel = this.updateOutLevel.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocolPreset = MixerProtocolPresets[this.store.settings[0].mixerProtocol];
        if (this.mixerProtocolPreset.protocol === 'OSC') {
            this.mixerConnection = new OscMixerConnection();
        } else if (this.mixerProtocolPreset.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection();
        }
    }

    updateOutLevels() {
        this.mixerConnection.updateOutLevels();
    }

    updateOutLevel(channelIndex) {
        this.mixerConnection.updateOutLevel(channelIndex);
    }
}
