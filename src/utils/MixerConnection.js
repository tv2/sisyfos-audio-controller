//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import { MidiMixerConnection } from '../utils/MidiMixerConnection';

// FADE_INOUT_SPEED defines the resolution of the fade in ms
// The lower the more CPU
let FADE_INOUT_SPEED = 3;

export class MixerConnection {
    constructor(initialStore) {
        this.updateOutLevels = this.updateOutLevels.bind(this);
        this.updateOutLevel = this.updateOutLevel.bind(this);
        this.fadeInOut = this.fadeInOut.bind(this);
        this.fadeUp = this.fadeUp.bind(this);
        this.fadeDown = this.fadeDown.bind(this);

        //Get redux store:
        this.store = window.storeRedux.getState();
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState();
        });

        // Get mixer protocol
        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol] || MixerProtocolPresets.genericMidi;
        if (this.mixerProtocol.protocol === 'OSC') {
            this.mixerConnection = new OscMixerConnection(this.fadeInOut);
        } else if (this.mixerProtocol.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection(this.fadeInOut);
        }

        //Setup timers for fade in & out
        this.timer = new Array(this.store.channels[0].channel.length);
        this.grpTimer = new Array(this.store.channels[0].grpFader.length);


    }

    updateOutLevels() {
        this.store.channels[0].channel.map((channel, index) => {
            this.fadeInOut(index);
            this.mixerConnection.updateOutLevel(index);
        });
        this.store.channels[0].grpFader.map((channel, index) => {
            this.fadeGrpInOut(index);
            this.mixerConnection.updateGrpOutLevel(index);
        });
    }

    updateOutLevel(channelIndex) {
        this.fadeInOut(channelIndex);
        this.mixerConnection.updateOutLevel(channelIndex);
    }

    updateGrpOutLevel(channelIndex) {
        this.fadeGrpInOut(channelIndex);
        this.mixerConnection.updateGrpOutLevel(channelIndex);
    }

    fadeInOut (channelIndex){
        //Clear Old timer or set Fade to active:
        if (this.store.channels[0].channel[channelIndex].fadeActive) {
            clearInterval(this.timer[channelIndex]);
        } else {
            window.storeRedux.dispatch({
                type:'FADE_ACTIVE',
                channel: channelIndex,
                active: true
            });
        }

        if (this.store.channels[0].channel[channelIndex].pgmOn) {
            this.fadeUp(channelIndex);
        } else {
            this.fadeDown(channelIndex);
        }
    }

    fadeUp(channelIndex) {
        let outputLevel = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);
        let targetVal = this.mixerProtocol.fader.zero;
        if (this.mixerProtocol.mode === "master") {
            targetVal = parseFloat(this.store.channels[0].channel[channelIndex].faderLevel);
        }
        const step = (targetVal-outputLevel)/(this.store.settings[0].fadeTime/FADE_INOUT_SPEED);


        if (targetVal<outputLevel) {
            this.timer[channelIndex] = setInterval(() => {
                outputLevel += step;
                this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);

                if ( outputLevel <= targetVal){
                    outputLevel = targetVal;
                    this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                    clearInterval(this.timer[channelIndex]);

                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: outputLevel
                    });
                    window.storeRedux.dispatch({
                        type:'FADE_ACTIVE',
                        channel: channelIndex,
                        active: false
                    });
                    return true;
                }
            }, FADE_INOUT_SPEED);
        } else {
            this.timer[channelIndex] = setInterval(() => {
                outputLevel += step;
                this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);

                if ( outputLevel >= targetVal ) {
                    outputLevel = targetVal;
                    this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                    clearInterval(this.timer[channelIndex]);
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: outputLevel
                    });
                    window.storeRedux.dispatch({
                        type:'FADE_ACTIVE',
                        channel: channelIndex,
                        active: false
                    });
                    return true;
                }

            }, FADE_INOUT_SPEED);
        }
    }

    fadeDown(channelIndex) {
        let outputLevel = this.store.channels[0].channel[channelIndex].outputLevel;
        const min = this.mixerProtocol.fader.min;
        const step = (outputLevel-min)/(this.store.settings[0].fadeTime/FADE_INOUT_SPEED);

        this.timer[channelIndex] = setInterval(() => {

            outputLevel -= step;
            this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);

            if ( outputLevel <= min ){
                outputLevel=min;
                this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                clearInterval(this.timer[channelIndex]);
                window.storeRedux.dispatch({
                    type:'SET_OUTPUT_LEVEL',
                    channel: channelIndex,
                    level: outputLevel
                });
                window.storeRedux.dispatch({
                    type:'FADE_ACTIVE',
                    channel: channelIndex,
                    active: false
                });
                return true;
            }

        }, FADE_INOUT_SPEED);
    }


    fadeGrpInOut (channelIndex){
        //Clear Old timer or set Fade to active:
        if (this.store.channels[0].grpFader[channelIndex].fadeActive) {
            clearInterval(this.grpTimer[channelIndex]);
        } else {
            window.storeRedux.dispatch({
                type:'FADE_GRP_ACTIVE',
                channel: channelIndex,
                active: true
            });
        }

        if (this.store.channels[0].grpFader[channelIndex].pgmOn) {
            this.fadeGrpUp(channelIndex);
        } else {
            this.fadeGrpDown(channelIndex);
        }
    }

    fadeGrpUp(channelIndex) {
        let outputLevel = parseFloat(this.store.channels[0].grpFader[channelIndex].outputLevel);
        let targetVal = this.mixerProtocol.fader.zero;
        if (this.mixerProtocol.mode === "master") {
            targetVal = parseFloat(this.store.channels[0].grpFader[channelIndex].faderLevel);
        }
        const step = (targetVal-outputLevel)/(this.store.settings[0].fadeTime/FADE_INOUT_SPEED);


        if (targetVal<outputLevel) {
            this.grpTimer[channelIndex] = setInterval(() => {
                outputLevel += step;
                this.mixerConnection.updateGrpFadeIOLevel(channelIndex, outputLevel);

                if ( outputLevel <= targetVal){
                    outputLevel = targetVal;
                    this.mixerConnection.updateGrpFadeIOLevel(channelIndex, outputLevel);
                    clearInterval(this.grpTimer[channelIndex]);

                    window.storeRedux.dispatch({
                        type:'SET_GRP_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: outputLevel
                    });
                    window.storeRedux.dispatch({
                        type:'FADE_GRP_ACTIVE',
                        channel: channelIndex,
                        active: false
                    });
                    return true;
                }
            }, FADE_INOUT_SPEED);
        } else {
            this.grpTimer[channelIndex] = setInterval(() => {
                outputLevel += step;
                this.mixerConnection.updateGrpFadeIOLevel(channelIndex, outputLevel);

                if ( outputLevel >= targetVal ) {
                    outputLevel = targetVal;
                    this.mixerConnection.updateGrpFadeIOLevel(channelIndex, outputLevel);
                    clearInterval(this.grpTimer[channelIndex]);
                    window.storeRedux.dispatch({
                        type:'SET_GRP_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: outputLevel
                    });
                    window.storeRedux.dispatch({
                        type:'FADE_GRP_ACTIVE',
                        channel: channelIndex,
                        active: false
                    });
                    return true;
                }

            }, FADE_INOUT_SPEED);
        }
    }

    fadeGrpDown(channelIndex) {
        let outputLevel = this.store.channels[0].grpFader[channelIndex].outputLevel;
        const min = this.mixerProtocol.fader.min;
        const step = (outputLevel-min)/(this.store.settings[0].fadeTime/FADE_INOUT_SPEED);

        this.grpTimer[channelIndex] = setInterval(() => {

            outputLevel -= step;
            this.mixerConnection.updateGrpFadeIOLevel(channelIndex, outputLevel);

            if ( outputLevel <= min ){
                outputLevel=min;
                this.mixerConnection.updateGrpFadeIOLevel(channelIndex, outputLevel);
                clearInterval(this.grpTimer[channelIndex]);
                window.storeRedux.dispatch({
                    type:'SET_GRP_OUTPUT_LEVEL',
                    channel: channelIndex,
                    level: outputLevel
                });
                window.storeRedux.dispatch({
                    type:'FADE_GRP_ACTIVE',
                    channel: channelIndex,
                    active: false
                });
                return true;
            }

        }, FADE_INOUT_SPEED);
    }
}
