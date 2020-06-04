import { store, state } from '../reducers/store'
import { remoteConnections } from '../mainClasses'

//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets'
import {
    IMixerProtocol,
    IMixerProtocolGeneric,
    ICasparCGMixerGeometry,
} from '../constants/MixerProtocolInterface'
import { OscMixerConnection } from './mixerConnections/OscMixerConnection'
import { MidiMixerConnection } from './mixerConnections/MidiMixerConnection'
import { QlClMixerConnection } from './mixerConnections/YamahaQlClConnection'
import { SSLMixerConnection } from './mixerConnections/SSLMixerConnection'
import { EmberMixerConnection } from './mixerConnections/EmberMixerConnection'
import { StuderMixerConnection } from './mixerConnections/StuderMixerConnection'
import { StuderVistaMixerConnection } from './mixerConnections/StuderVistaMixerConnection'
import { CasparCGConnection } from './mixerConnections/CasparCGConnection'
import { IChannel } from '../reducers/channelsReducer'
import { SET_OUTPUT_LEVEL, FADE_ACTIVE } from '../reducers/channelActions'
import { SET_FADER_LEVEL } from '../reducers/faderActions'
import { logger } from './logger'

// FADE_INOUT_SPEED defines the resolution of the fade in ms
// The lower the more CPU
const FADE_INOUT_SPEED = 3

export class MixerGenericConnection {
    store: any
    mixerProtocol: IMixerProtocolGeneric
    mixerConnection: any
    timer: any
    fadeActiveTimer: any

    constructor() {
        this.updateOutLevels = this.updateOutLevels.bind(this)
        this.updateOutLevel = this.updateOutLevel.bind(this)
        this.fadeInOut = this.fadeInOut.bind(this)
        this.fadeUp = this.fadeUp.bind(this)
        this.fadeDown = this.fadeDown.bind(this)
        this.clearTimer = this.clearTimer.bind(this)

        // Get mixer protocol
        this.mixerProtocol =
            MixerProtocolPresets[state.settings[0].mixerProtocol] ||
            MixerProtocolPresets.sslSystemT
        if (this.mixerProtocol.protocol === 'OSC') {
            this.mixerConnection = new OscMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        } else if (this.mixerProtocol.protocol === 'QLCL') {
            this.mixerConnection = new QlClMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        } else if (this.mixerProtocol.protocol === 'MIDI') {
            this.mixerConnection = new MidiMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        } else if (this.mixerProtocol.protocol === 'CasparCG') {
            this.mixerConnection = new CasparCGConnection(
                this.mixerProtocol as ICasparCGMixerGeometry
            )
        } else if (this.mixerProtocol.protocol === 'EMBER') {
            this.mixerConnection = new EmberMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        } else if (this.mixerProtocol.protocol === 'STUDER') {
            this.mixerConnection = new StuderMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        } else if (this.mixerProtocol.protocol === 'VISTA') {
            this.mixerConnection = new StuderVistaMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        } else if (this.mixerProtocol.protocol === 'SSL') {
            this.mixerConnection = new SSLMixerConnection(
                this.mixerProtocol as IMixerProtocol
            )
        }

        //Setup timers for fade in & out
        this.timer = new Array(state.channels[0].channel.length)
        this.fadeActiveTimer = new Array(state.channels[0].channel.length)
    }

    loadMixerPreset(presetName: string) {
        logger.info('Loading Preset :' + presetName)
    }

    checkForAutoResetThreshold(channel: number) {
        if (
            state.faders[0].fader[channel].faderLevel <=
            state.settings[0].autoResetLevel / 100
        ) {
            store.dispatch({
                type: SET_FADER_LEVEL,
                channel: channel,
                level: this.mixerProtocol.fader.zero,
            })
        }
    }

    updateFadeToBlack() {
        state.faders[0].fader.map((channel: any, index: number) => {
            this.updateOutLevel(index)
        })
    }

    updateOutLevels() {
        state.faders[0].fader.map((channel: any, index: number) => {
            this.updateOutLevel(index)
            this.updateNextAux(index)
        })
    }

    updateOutLevel(faderIndex: number, fadeTime: number = -1) {
        if (fadeTime === -1) {
            if (state.faders[0].fader[faderIndex].voOn) {
                fadeTime = state.settings[0].voFadeTime
            } else {
                fadeTime = state.settings[0].fadeTime
            }
        }

        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.fadeInOut(channelIndex, fadeTime)
                }
            }
        )
        if (remoteConnections) {
            remoteConnections.updateRemoteFaderState(
                faderIndex,
                state.faders[0].fader[faderIndex].faderLevel
            )
        }
    }

    updatePflState(channelIndex: number) {
        this.mixerConnection.updatePflState(channelIndex)
    }

    updateMuteState(faderIndex: number) {
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateMuteState(
                        channelIndex,
                        state.faders[0].fader[faderIndex].muteOn
                    )
                }
            }
        )
    }

    updateNextAux(faderIndex: number) {
        let level = 0
        if (state.faders[0].fader[faderIndex].pstOn) {
            level = state.faders[0].fader[faderIndex].faderLevel
        } else if (state.faders[0].fader[faderIndex].pstVoOn) {
            level =
                (state.faders[0].fader[faderIndex].faderLevel *
                    (100 - state.settings[0].voLevel)) /
                100
        }
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateNextAux(channelIndex, level)
                }
            }
        )
    }

    updateThreshold(faderIndex: number) {
        let level = state.faders[0].fader[faderIndex].threshold
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateThreshold(channelIndex, level)
                }
            }
        )
    }
    updateRatio(faderIndex: number) {
        let level = state.faders[0].fader[faderIndex].ratio
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateRatio(channelIndex, level)
                }
            }
        )
    }
    updateDelayTime(faderIndex: number) {
        let delayTime = state.faders[0].fader[faderIndex].delayTime
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateDelayTime(
                        channelIndex,
                        delayTime
                    )
                }
            }
        )
    }
    updateLow(faderIndex: number) {
        let level = state.faders[0].fader[faderIndex].low
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateLow(channelIndex, level)
                }
            }
        )
    }
    updateLoMid(faderIndex: number) {
        let level = state.faders[0].fader[faderIndex].loMid
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateLoMid(channelIndex, level)
                }
            }
        )
    }
    updateMid(faderIndex: number) {
        let level = state.faders[0].fader[faderIndex].mid
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateMid(channelIndex, level)
                }
            }
        )
    }
    updateHigh(faderIndex: number) {
        let level = state.faders[0].fader[faderIndex].high
        state.channels[0].channel.map(
            (channel: IChannel, channelIndex: number) => {
                if (faderIndex === channel.assignedFader) {
                    this.mixerConnection.updateHigh(channelIndex, level)
                }
            }
        )
    }

    updateAuxLevel(channelIndex: number, auxSendIndex: number) {
        let channel = state.channels[0].channel[channelIndex]
        if (channel.auxLevel[auxSendIndex] > -1) {
            this.mixerConnection.updateAuxLevel(
                channelIndex,
                auxSendIndex,
                channel.auxLevel[auxSendIndex]
            )
        }
    }

    updateChannelName(channelIndex: number) {
        this.mixerConnection.updateChannelName(channelIndex)
    }

    injectCommand(command: string[]) {
        this.mixerConnection.injectCommand(command)
    }

    updateChannelSettings(
        channelIndex: number,
        setting: string,
        value: string
    ) {
        if (this.mixerProtocol.protocol === 'CasparCG') {
            this.mixerConnection.updateChannelSetting(
                channelIndex,
                setting,
                value
            )
        }
    }

    clearTimer(channelIndex: number) {
        clearInterval(this.timer[channelIndex])
    }

    delayedFadeActiveDisable(channelIndex: number) {
        this.fadeActiveTimer[channelIndex] = setTimeout(() => {
            store.dispatch({
                type: FADE_ACTIVE,
                channel: channelIndex,
                active: false,
            })
        }, state.settings[0].protocolLatency)
    }

    fadeInOut(channelIndex: number, fadeTime: number) {
        let faderIndex = state.channels[0].channel[channelIndex].assignedFader
        if (
            !state.faders[0].fader[faderIndex].pgmOn &&
            !state.faders[0].fader[faderIndex].voOn &&
            state.channels[0].channel[channelIndex].outputLevel === 0
        ) {
            return
        }
        //Clear Old timer or set Fade to active:
        if (state.channels[0].channel[channelIndex].fadeActive) {
            clearInterval(this.fadeActiveTimer[channelIndex])
            this.clearTimer(channelIndex)
        }
        store.dispatch({
            type: FADE_ACTIVE,
            channel: channelIndex,
            active: true,
        })

        if (
            state.faders[0].fader[faderIndex].pgmOn ||
            state.faders[0].fader[faderIndex].voOn
        ) {
            this.fadeUp(channelIndex, fadeTime, faderIndex)
        } else {
            this.fadeDown(channelIndex, fadeTime)
        }
    }

    fadeUp(channelIndex: number, fadeTime: number, faderIndex: number) {
        let outputLevel = state.channels[0].channel[channelIndex].outputLevel
        let targetVal = state.faders[0].fader[faderIndex].faderLevel

        if (state.faders[0].fader[faderIndex].voOn) {
            targetVal = (targetVal * (100 - state.settings[0].voLevel)) / 100
        }
        const step: number =
            (targetVal - outputLevel) / (fadeTime / FADE_INOUT_SPEED)
        const dispatchResolution: number =
            this.mixerProtocol.FADE_DISPATCH_RESOLUTION * step
        let dispatchTrigger: number = 0
        this.clearTimer(channelIndex)

        if (targetVal < outputLevel) {
            this.timer[channelIndex] = setInterval(() => {
                outputLevel += step
                dispatchTrigger += step

                if (dispatchTrigger > dispatchResolution) {
                    this.mixerConnection.updateFadeIOLevel(
                        channelIndex,
                        outputLevel
                    )
                    store.dispatch({
                        type: SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel,
                    })
                    dispatchTrigger = 0
                }

                if (outputLevel <= targetVal) {
                    outputLevel = targetVal
                    this.mixerConnection.updateFadeIOLevel(
                        channelIndex,
                        outputLevel
                    )
                    this.clearTimer(channelIndex)

                    store.dispatch({
                        type: SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel,
                    })
                    this.delayedFadeActiveDisable(channelIndex)
                    return true
                }
            }, FADE_INOUT_SPEED)
        } else {
            this.timer[channelIndex] = setInterval(() => {
                outputLevel += step
                dispatchTrigger += step
                this.mixerConnection.updateFadeIOLevel(
                    channelIndex,
                    outputLevel
                )

                if (dispatchTrigger > dispatchResolution) {
                    store.dispatch({
                        type: SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel,
                    })
                    dispatchTrigger = 0
                }

                if (outputLevel >= targetVal) {
                    outputLevel = targetVal
                    this.mixerConnection.updateFadeIOLevel(
                        channelIndex,
                        outputLevel
                    )
                    this.clearTimer(channelIndex)
                    store.dispatch({
                        type: SET_OUTPUT_LEVEL,
                        channel: channelIndex,
                        level: outputLevel,
                    })
                    this.delayedFadeActiveDisable(channelIndex)
                    return true
                }
            }, FADE_INOUT_SPEED)
        }
    }

    fadeDown(channelIndex: number, fadeTime: number) {
        let outputLevel = state.channels[0].channel[channelIndex].outputLevel
        const step = outputLevel / (fadeTime / FADE_INOUT_SPEED)
        const dispatchResolution: number =
            this.mixerProtocol.FADE_DISPATCH_RESOLUTION * step
        let dispatchTrigger: number = 0

        this.clearTimer(channelIndex)

        this.timer[channelIndex] = setInterval(() => {
            outputLevel -= step
            dispatchTrigger += step
            this.mixerConnection.updateFadeIOLevel(channelIndex, outputLevel)

            if (dispatchTrigger > dispatchResolution) {
                store.dispatch({
                    type: SET_OUTPUT_LEVEL,
                    channel: channelIndex,
                    level: outputLevel,
                })
                dispatchTrigger = 0
            }

            if (outputLevel <= 0) {
                outputLevel = 0
                this.mixerConnection.updateFadeIOLevel(
                    channelIndex,
                    outputLevel
                )
                this.clearTimer(channelIndex)
                store.dispatch({
                    type: SET_OUTPUT_LEVEL,
                    channel: channelIndex,
                    level: outputLevel,
                })
                this.delayedFadeActiveDisable(channelIndex)
                return true
            }
        }, FADE_INOUT_SPEED)
    }
}
