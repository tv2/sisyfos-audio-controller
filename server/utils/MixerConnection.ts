//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocol, IMixerProtocolGeneric, ICasparCGMixerGeometry } from '../constants/MixerProtocolInterface';
import { OscMixerConnection } from '../utils/OscMixerConnection';
import { MidiMixerConnection } from '../utils/MidiMixerConnection';
import { QlClMixerConnection } from './QlClMixerConnection';
import { SSLMixerConnection } from './SSLMixerConnection';
import { EmberMixerConnection } from './EmberMixerConnection';
import { CasparCGConnection } from './CasparCGConnection';
import { IChannel } from '../reducers/channelsReducer';
import { SET_OUTPUT_LEVEL, FADE_ACTIVE } from '../reducers/channelActions'
import { SET_FADER_LEVEL } from  '../reducers/faderActions'


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
        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
        });

        // Get mixer protocol
        this.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol] || MixerProtocolPresets.sslSystemT;
        if (this.mixerProtocol.protocol === 'OSC') {
            this.mixerConnection = new OscMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'QLCL') {
            this.mixerConnection = new QlClMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'CasparCG') {
            this.mixerConnection = new CasparCGConnection(this.mixerProtocol as ICasparCGMixerGeometry);
        } else if (this.mixerProtocol.protocol === 'EMBER') {
            this.mixerConnection = new EmberMixerConnection(this.mixerProtocol as IMixerProtocol);
        } else if (this.mixerProtocol.protocol === 'SSL') {
            this.mixerConnection = new SSLMixerConnection(this.mixerProtocol as IMixerProtocol);
        }

        //Setup timers for fade in & out
        this.timer = new Array(this.store.channels[0].channel.length);
        this.fadeActiveTimer = new Array(this.store.channels[0].channel.length);
    }


    checkForAutoResetThreshold(channel: number) {
        if (this.store.faders[0].fader[channel].faderLevel <= this.mixerProtocol.fader.min + (this.mixerProtocol.fader.max * this.store.settings[0].autoResetLevel / 100)) {
            global.storeRedux.dispatch({
                type: SET_FADER_LEVEL,
                channel: channel,
                level: this.mixerProtocol.fader.zero
            })
        }
    }


    updateFadeToBlack() {
        this.store.faders[0].fader.map((channel: any, index: number) => {
            this.updateOutLevel(index);
        });
    }

    updateOutLevels() {
        this.store.faders[0].fader.map((channel: any, index: number) => {
            this.updateOutLevel(index);
            this.updateNextAux(index);
        });
    }

    updateOutLevel(faderIndex: number, fadeTime: number = -1) {
        if (fadeTime === -1) {
            if (this.store.faders[0].fader[faderIndex].voOn) {
                fadeTime = this.store.settings[0].voFadeTime
            } else {
                fadeTime = this.store.settings[0].fadeTime
            }
        }

        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.fadeInOut(channelIndex, fadeTime);
            }
        })
        if (global.huiRemoteConnection) {
            global.huiRemoteConnection.updateRemoteFaderState(faderIndex, this.store.faders[0].fader[faderIndex].faderLevel)
        }
    }

    updatePflState(channelIndex: number) {
        this.mixerConnection.updatePflState(channelIndex);
    }

    updateMuteState(faderIndex: number) {
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateMuteState(channelIndex, this.store.faders[0].fader[faderIndex].muteOn)
            }
        })
    }

    updateNextAux(faderIndex: number) {
        let level = 0
        if (this.store.faders[0].fader[faderIndex].pstOn) {
            level = this.store.faders[0].fader[faderIndex].faderLevel
        } else if (this.store.faders[0].fader[faderIndex].pstVoOn) {
            level = this.store.faders[0].fader[faderIndex].faderLevel * (100-parseFloat(this.store.settings[0].voLevel))/100 
        }
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateNextAux(channelIndex, level)
            }
        })
    }

    updateThreshold(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].threshold
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateThreshold(channelIndex, level)
            }
        })
    }
    updateRatio(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].ratio
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateRatio(channelIndex, level)
            }
        })
    }
    updateLow(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].low
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateLow(channelIndex, level)
            }
        })
    }
    updateMid(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].mid
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateMid(channelIndex, level)
            }
        })
    }
    updateHigh(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].high
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            if (faderIndex === channel.assignedFader) {
                this.mixerConnection.updateHigh(channelIndex, level)
            }
        })
    }

    updateAuxLevel(channelIndex: number, auxSendIndex: number) {
        let channel = this.store.channels[0].channel[channelIndex]
        if (channel.auxLevel[auxSendIndex] > -1) {
            this.mixerConnection.updateAuxLevel(channelIndex, auxSendIndex, channel.auxLevel[auxSendIndex])
        }
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
            global.storeRedux.dispatch({
                type:FADE_ACTIVE,
                channel: channelIndex,
                active: false
            })
        },
            this.store.settings[0].protocolLatency
        )
    }

    fadeInOut (channelIndex: number, fadeTime: number){
        let faderIndex = this.store.channels[0].channel[channelIndex].assignedFader
        if (!this.store.faders[0].fader[faderIndex].pgmOn 
            && !this.store.faders[0].fader[faderIndex].voOn
            && this.store.channels[0].channel[channelIndex].outputLevel === 0
        ) {
            return               
        }
        //Clear Old timer or set Fade to active:
        if (this.store.channels[0].channel[channelIndex].fadeActive) {
            clearInterval(this.fadeActiveTimer[channelIndex]);
            clearInterval(this.timer[channelIndex]);
        } 
        global.storeRedux.dispatch({
            type:FADE_ACTIVE,
            channel: channelIndex,
            active: true
        });
        
        if (this.store.faders[0].fader[faderIndex].pgmOn || this.store.faders[0].fader[faderIndex].voOn) {
            this.fadeUp(channelIndex, fadeTime, faderIndex);
        } else {
            this.fadeDown(channelIndex, fadeTime);
        }
    }

    fadeUp(channelIndex: number, fadeTime: number, faderIndex: number) {
        let outputLevel = parseFloat(this.store.channels[0].channel[channelIndex].outputLevel);
        let targetVal = parseFloat(this.store.faders[0].fader[faderIndex].faderLevel);

        if (this.store.faders[0].fader[faderIndex].voOn) {
            targetVal = targetVal * (100-parseFloat(this.store.settings[0].voLevel))/100 
        }
        const step: number = (targetVal-outputLevel)/(fadeTime/FADE_INOUT_SPEED);
        const dispatchResolution: number = FADE_DISPATCH_RESOLUTION*step;
        let dispatchTrigger: number = 0;

        if (targetVal<outputLevel) {
            this.timer[channelIndex] = setInterval(() => {
                outputLevel += step;
                dispatchTrigger += step;
                
                if (dispatchTrigger > dispatchResolution) {
                    this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                    global.storeRedux.dispatch({
                        type:SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel
                    });
                    dispatchTrigger = 0;
                }

                if ( outputLevel <= targetVal){
                    outputLevel = targetVal;
                    this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                    clearInterval(this.timer[channelIndex]);

                    global.storeRedux.dispatch({
                        type:SET_OUTPUT_LEVEL,
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
                    global.storeRedux.dispatch({
                        type:SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel
                    });
                    dispatchTrigger = 0;
                }


                if ( outputLevel >= targetVal ) {
                    outputLevel = targetVal;
                    this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                    clearInterval(this.timer[channelIndex]);
                    global.storeRedux.dispatch({
                        type:SET_OUTPUT_LEVEL,
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
                global.storeRedux.dispatch({
                    type:SET_OUTPUT_LEVEL,
                    channel: channelIndex,
                    level: outputLevel
                });
                dispatchTrigger = 0;
            }

            if ( outputLevel <= min ){
                outputLevel=min;
                this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel);
                clearInterval(this.timer[channelIndex]);
                global.storeRedux.dispatch({
                    type:SET_OUTPUT_LEVEL,
                    channel: channelIndex,
                    level: outputLevel
                });
                this.delayedFadeActiveDisable(channelIndex);
                return true;
            }

        }, FADE_INOUT_SPEED);
    }
}
