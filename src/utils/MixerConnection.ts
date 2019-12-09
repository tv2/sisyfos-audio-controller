//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';
import { IMixerProtocolGeneric } from '../constants/MixerProtocolInterface';
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

        //Setup timers for fade in & out
        this.timer = new Array(this.store.channels[0].channel.length);
        this.fadeActiveTimer = new Array(this.store.channels[0].channel.length);
    }


    checkForAutoResetThreshold(channel: number) {
        if (this.store.faders[0].fader[channel].faderLevel <= this.mixerProtocol.fader.min + (this.mixerProtocol.fader.max * this.store.settings[0].autoResetLevel / 100)) {
            window.storeRedux.dispatch({
                type: SET_FADER_LEVEL,
                channel: channel,
                level: this.mixerProtocol.fader.zero
            })
        }
    }


    updateFadeToBlack() {
        this.store.faders[0].fader.map((channel: any, index: number) => {
            
        });
    }

    updateOutLevels() {
        this.store.faders[0].fader.map((channel: any, index: number) => {
           
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
        if (window.huiRemoteConnection) {
            window.huiRemoteConnection.updateRemoteFaderState(faderIndex, this.store.faders[0].fader[faderIndex].faderLevel)
        }
    }

    updatePflState(channelIndex: number) {
        
    }

    updateMuteState(faderIndex: number) {
        this.store.channels[0].channel.map((channel: IChannel, channelIndex: number) => {
            
        })
    }

    updateNextAux(faderIndex: number) {
        let level = 0
        
    }

    updateThreshold(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].threshold
        
    }
    updateRatio(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].ratio
        
    }
    updateLow(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].low
        
    }
    updateMid(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].mid
        
    }
    updateHigh(faderIndex: number) {
        let level = this.store.faders[0].fader[faderIndex].high
        
    }

    updateAuxLevel(channelIndex: number, auxSendIndex: number) {
        let channel = this.store.channels[0].channel[channelIndex]
        
    }

    updateChannelName(channelIndex: number) {
       
    }

    updateChannelSettings(channelIndex: number, setting: string, value: string) {
        if (this.mixerProtocol.protocol === 'CasparCG') {
          
        }
    }

    delayedFadeActiveDisable (channelIndex: number) {
        this.fadeActiveTimer[channelIndex] = setTimeout( ()=>{
            window.storeRedux.dispatch({
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
                    
                    window.storeRedux.dispatch({
                        type:SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel
                    });
                    dispatchTrigger = 0;
                }

                if ( outputLevel <= targetVal){
                    outputLevel = targetVal;
                    
                    clearInterval(this.timer[channelIndex]);

                    window.storeRedux.dispatch({
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
                

                if (dispatchTrigger > dispatchResolution) {
                    window.storeRedux.dispatch({
                        type:SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel
                    });
                    dispatchTrigger = 0;
                }


                if ( outputLevel >= targetVal ) {
                    outputLevel = targetVal;
                    
                    clearInterval(this.timer[channelIndex]);
                    window.storeRedux.dispatch({
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
            

            if (dispatchTrigger > dispatchResolution) {
                window.storeRedux.dispatch({
                    type:SET_OUTPUT_LEVEL,
                    channel: channelIndex,
                    level: outputLevel
                });
                dispatchTrigger = 0;
            }

            if ( outputLevel <= min ){
                outputLevel=min;
                
                clearInterval(this.timer[channelIndex]);
                window.storeRedux.dispatch({
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
