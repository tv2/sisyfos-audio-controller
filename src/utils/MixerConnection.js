//Utils:
import { MixerProtocolPresets } from './MixerProtocolPresets';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import {EmberMixerConnection } from '../utils/EmberMixerConnection';

export class MixerConnection {
    constructor(initialStore) {
        this.updateOscLevels = this.updateOscLevels.bind(this);
        this.updateOscLevel = this.updateOscLevel.bind(this);

        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        this.mixerProtocolPreset = MixerProtocolPresets[this.store.settings[0].mixerProtocol];
        if (this.mixerProtocolPreset.protocol === 'OSC') {
            this.mixerConnection = new OscMixerConnection();
        } else if (this.mixerProtocolPreset.protocol === 'EMBER') {
            this.mixerConnection = new EmberMixerConnection();
        }
    }

    updateOscLevels() {
        this.mixerConnection.updateOscLevels();
    }

    updateOscLevel(channelIndex) {
        this.mixerConnection.updateOscLevel(channelIndex);
    }
}
