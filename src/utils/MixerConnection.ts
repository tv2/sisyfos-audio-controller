//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocol, IMixerProtocolGeneric, ICasparCGMixerGeometry } from '../constants/MixerProtocolInterface';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import { MidiMixerConnection } from '../utils/MidiMixerConnection';
import { SCPMixerConnection } from '../utils/SCPMixerConnection';
import { EmberMixerConnection } from './EmberMixerConnection';
import { CasparCGConnection } from './CasparCGConnection';
import { IChannel } from '../reducers/channelsReducer';

// FADE_INOUT_SPEED defines the resolution of the fade in ms
// The lower the more CPU
const FADE_INOUT_SPEED = 3;
const FADE_DISPATCH_RESOLUTION = 5;

export class MixerGenericConnection {
    store: any;
    mixerProtocol: IMixerProtocolGeneric;
    mixerConnection: any;
    timer: any;
    fadeActiveTimer: any;

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
        } else if (this.mixerProtocol.protocol === 'SCP') {
            this.mixerConnection = new SCPMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'CasparCG') {
            this.mixerConnection = new CasparCGConnection(this.mixerProtocol as ICasparCGMixerGeometry);
        } else if (this.mixerProtocol.protocol === 'EMBER') {
            this.mixerConnection = new EmberMixerConnection(this.mixerProtocol as IMixerProtocol);
        }

        //Setup timers for fade in & out
        this.timer = new Array(this.store.channels[0].channel.length);
        this.fadeActiveTimer = new Array(this.store.channels[0].channel.length);
    }

    updateOutLevels() {
        this.store.faders[0].fader.map((channel: any, index: number) => {
            this.updateOutLevel(index);
        });
    }

    updateOutLevel(faderIndex: number, fadeTime: number = this.store.settings[0].fadeTime) {
        this.store.channels[0].channel.map((channel: IChannel, index: number) => {
            if (faderIndex === channel.assignedFader) {
                this.fadeInOut(index, fadeTime);
                this.mixerConnection.updateOutLevel(index);
            }
        })
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(faderIndex, this.store.faders[0].fader[faderIndex].faderLevel)
        }
    }


    updatePflState(channelIndex: number) {
        this.mixerConnection.updatePflState(channelIndex);
    }

    updateChannelName(channelIndex: number) {
        this.mixerConnection.updateChannelName(channelIndex);
    }

    updateChannelSettings(channelIndex: number, setting: string, value: string) {
        if (this.mixerProtocol.protocol === 'CasparCG') {
            this.mixerConnection.updateChannelSetting(channelIndex, setting, value)
        }
    }

    delayedFadeActiveDisable (channelIndex: number) {
        this.fadeActiveTimer[channelIndex] = setTimeout( ()=>{
            window.storeRedux.dispatch({
                type:'FADE_ACTIVE',
                channel: channelIndex,
                active: false
            })
        },
            this.store.settings[0].protocolLatency
        )
    }

    fadeInOut (channelIndex: number, fadeTime: number){
        //Clear Old timer or set Fade to active:
        if (this.store.channels[0].channel[channelIndex].fadeActive) {
            clearInterval(this.fadeActiveTimer[channelIndex]);
            clearInterval(this.timer[channelIndex]);
        } else {
            window.storeRedux.dispatch({
                type:'FADE_ACTIVE',
                channel: channelIndex,
                active: true
            });
        }

        if (this.store.faders[0].fader[this.store.channels[0].channel[channelIndex].assignedFader].pgmOn) {
            this.fadeUp(channelIndex, fadeTime);
        } else {
            this.fadeDown(channelIndex, fadeTime);
        }
    }

    fadeUp(channelIndex: number, fadeTime: number) {
        let outputLevel = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);
        let targetVal = this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_OUT_GAIN[0].zero;
        if (this.mixerProtocol.mode === "master") {
            targetVal = parseFloat(this.store.faders[0].fader[this.store.channels[0].channel[channelIndex].assignedFader].faderLevel);
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
                    this.delayedFadeActiveDisable(channelIndex);
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
                    this.delayedFadeActiveDisable(channelIndex);
                    return true;
                }

            }, FADE_INOUT_SPEED);
        }
    }

    fadeDown(channelIndex: number, fadeTime: number) {
        let outputLevel = this.store.channels[0].channel[channelIndex].outputLevel;
        const min = this.mixerProtocol.channelTypes[0].toMixer.CHANNEL_OUT_GAIN[0].min;
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
                this.delayedFadeActiveDisable(channelIndex);
                return true;
            }

        }, FADE_INOUT_SPEED);
    }
}
