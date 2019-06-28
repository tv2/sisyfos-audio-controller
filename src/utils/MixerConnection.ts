//Utils:
import { IMixerProtocol, MixerProtocolPresets, IMixerProtocolGeneric, ICasparCGMixerGeometry } from '../constants/MixerProtocolPresets';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import { MidiMixerConnection } from '../utils/MidiMixerConnection';
import { EmberMixerConnection } from './EmberMixerConnection';
import { CasparCGConnection } from './CasparCGConnection';

// FADE_INOUT_SPEED defines the resolution of the fade in ms
// The lower the more CPU
const FADE_INOUT_SPEED = 3;
const FADE_DISPATCH_RESOLUTION = 5;

export class MixerGenericConnection {
    store: any;
    mixerProtocol: IMixerProtocolGeneric;
    mixerConnection: any;
    timer: any;

    constructor() {
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
            this.mixerConnection = new OscMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'CasparCG') {
            this.mixerConnection = new CasparCGConnection(this.mixerProtocol as ICasparCGMixerGeometry);
        } else if (this.mixerProtocol.protocol === 'EMBER') {
            this.mixerConnection = new EmberMixerConnection(this.mixerProtocol as IMixerProtocol);
        }

        //Setup timers for fade in & out
        this.timer = new Array(this.store.channels[0].channel.length);
    }

    updateOutLevels() {
        this.store.channels[0].channel.map((channel: any, index: number) => {
            this.fadeInOut(index, this.store.settings[0].fadeTime);
            this.mixerConnection.updateOutLevel(index);
        });
    }

    updateOutLevel(channelIndex: number, fadeTime: number = this.store.settings[0].fadeTime) {
        this.fadeInOut(channelIndex, fadeTime);
        this.mixerConnection.updateOutLevel(channelIndex);
    }


    updatePflState(channelIndex: number) {
        this.mixerConnection.updatePflState(channelIndex);
    }

    fadeInOut (channelIndex: number, fadeTime: number){
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
            this.fadeUp(channelIndex, fadeTime);
        } else {
            this.fadeDown(channelIndex, fadeTime);
        }
    }

    fadeUp(channelIndex: number, fadeTime: number) {
        let outputLevel = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);
        let targetVal = this.mixerProtocol.fader.zero;
        if (this.mixerProtocol.mode === "master") {
            targetVal = parseFloat(this.store.channels[0].channel[channelIndex].faderLevel);
        }
        const step: number = (targetVal-outputLevel)/(fadeTime/FADE_INOUT_SPEED);
        const dispatchResolution: number = FADE_DISPATCH_RESOLUTION*step;
        let dispatchTrigger: number = 0;

        if (targetVal<outputLevel) {
            this.timer[channelIndex] = setInterval(() => {
                outputLevel += step;
                dispatchTrigger += step;
                this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);

                if (dispatchTrigger > dispatchResolution) {
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: outputLevel
                    });
                    dispatchTrigger = 0;
                }

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
                dispatchTrigger += step;
                this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);

                if (dispatchTrigger > dispatchResolution) {
                    window.storeRedux.dispatch({
                        type:'SET_OUTPUT_LEVEL',
                        channel: channelIndex,
                        level: outputLevel
                    });
                    dispatchTrigger = 0;
                }


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

    fadeDown(channelIndex: number, fadeTime: number) {
        let outputLevel = this.store.channels[0].channel[channelIndex].outputLevel;
        const min = this.mixerProtocol.fader.min;
        const step = (outputLevel-min)/(fadeTime/FADE_INOUT_SPEED);
        const dispatchResolution: number = FADE_DISPATCH_RESOLUTION*step;
        let dispatchTrigger: number = 0;

        this.timer[channelIndex] = setInterval(() => {
            outputLevel -= step;
            dispatchTrigger += step;
            this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);

            if (dispatchTrigger > dispatchResolution) {
                window.storeRedux.dispatch({
                    type:'SET_OUTPUT_LEVEL',
                    channel: channelIndex,
                    level: outputLevel
                });
                dispatchTrigger = 0;
            }


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
}
