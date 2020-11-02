import { store, state } from '../reducers/store'
import { remoteConnections } from '../mainClasses'

//Utils:
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets'
import {
    IMixerProtocol,
    IMixerProtocolGeneric,
    ICasparCGMixerGeometry,
    fxParamsList,
} from '../constants/MixerProtocolInterface'
import { OscMixerConnection } from './mixerConnections/OscMixerConnection'
import { MidiMixerConnection } from './mixerConnections/MidiMixerConnection'
import { QlClMixerConnection } from './mixerConnections/YamahaQlClConnection'
import { SSLMixerConnection } from './mixerConnections/SSLMixerConnection'
import { EmberMixerConnection } from './mixerConnections/EmberMixerConnection'
import { LawoRubyMixerConnection } from './mixerConnections/LawoRubyConnection'
import { StuderMixerConnection } from './mixerConnections/StuderMixerConnection'
import { StuderVistaMixerConnection } from './mixerConnections/StuderVistaMixerConnection'
import { CasparCGConnection } from './mixerConnections/CasparCGConnection'
import { IChannel, IchConnection } from '../reducers/channelsReducer'
import {
    storeFadeActive,
    storeSetOutputLevel,
} from '../reducers/channelActions'
import { storeFaderLevel } from '../reducers/faderActions'

// FADE_INOUT_SPEED defines the resolution of the fade in ms
// The lower the more CPU
const FADE_INOUT_SPEED = 3

export class MixerGenericConnection {
    store: any
    mixerProtocol: IMixerProtocolGeneric[]
    mixerConnection: any[]
    mixerTimers: {
        chTimer: NodeJS.Timeout[]
        fadeActiveTimer: NodeJS.Timeout[]
    }[]

    constructor() {
        this.mixerProtocol = []
        this.mixerConnection = []
        // Get mixer protocol
        state.settings[0].mixers.forEach((none: any, index: number) => {
            this.mixerProtocol.push(
                MixerProtocolPresets[
                    state.settings[0].mixers[index].mixerProtocol
                ] || MixerProtocolPresets.sslSystemT
            )
            this.mixerConnection.push({})
            if (this.mixerProtocol[index].protocol === 'OSC') {
                this.mixerConnection[index] = new OscMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'QLCL') {
                this.mixerConnection[index] = new QlClMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'MIDI') {
                this.mixerConnection[index] = new MidiMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'CasparCG') {
                this.mixerConnection[index] = new CasparCGConnection(
                    this.mixerProtocol[index] as ICasparCGMixerGeometry,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'EMBER') {
                this.mixerConnection[index] = new EmberMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'LAWORUBY') {
                this.mixerConnection[index] = new LawoRubyMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'STUDER') {
                this.mixerConnection[index] = new StuderMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'VISTA') {
                this.mixerConnection[index] = new StuderVistaMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'SSL') {
                this.mixerConnection[index] = new SSLMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            }
        })

        //Setup timers for fade in & out
        this.initializeTimers()
    }

    initializeTimers = () => {
        //Setup timers for fade in & out
        this.mixerTimers = []
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                this.mixerTimers.push({ chTimer: [], fadeActiveTimer: [] })
                state.channels[0].chConnection[mixerIndex].channel.forEach(
                    (channel) => {
                        this.mixerTimers[mixerIndex].chTimer.push(undefined)
                        this.mixerTimers[mixerIndex].fadeActiveTimer.push(
                            undefined
                        )
                    }
                )
            }
        )
    }

    clearTimer = (mixerIndex: number, channelIndex: number) => {
        if (this.mixerTimers[mixerIndex]?.chTimer[channelIndex]) {
            clearInterval(this.mixerTimers[mixerIndex].chTimer[channelIndex])
        }
    }

    delayedFadeActiveDisable = (mixerIndex: number, channelIndex: number) => {
        this.mixerTimers[mixerIndex].fadeActiveTimer[channelIndex] = setTimeout(
            () => {
                store.dispatch(storeFadeActive(mixerIndex, channelIndex, false))
            },
            state.settings[0].mixers[0].protocolLatency
        )
    }

    getPresetFileExtention = (): string => {
        //TODO: atm mixer presets only supports first mixer connected to Sisyfos
        return this.mixerProtocol[0].presetFileExtension || ''
    }

    loadMixerPreset = (presetName: string) => {
        //TODO: atm mixer presets only supports first mixer connected to Sisyfos
        this.mixerConnection[0].loadMixerPreset(presetName)
    }

    checkForAutoResetThreshold = (channel: number) => {
        if (
            state.faders[0].fader[channel].faderLevel <=
            state.settings[0].autoResetLevel / 100
        ) {
            store.dispatch(
                storeFaderLevel(channel, this.mixerProtocol[0].fader.zero)
            )
        }
    }

    updateFadeToBlack = () => {
        state.faders[0].fader.forEach((channel: any, index: number) => {
            this.updateOutLevel(index)
        })
    }

    updateOutLevels = () => {
        state.faders[0].fader.forEach((channel: any, index: number) => {
            this.updateOutLevel(index)
            this.updateNextAux(index)
        })
    }

    updateOutLevel = (faderIndex: number, fadeTime: number = -1) => {
        if (fadeTime === -1) {
            if (state.faders[0].fader[faderIndex].voOn) {
                fadeTime = state.settings[0].voFadeTime
            } else {
                fadeTime = state.settings[0].fadeTime
            }
        }

        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.fadeInOut(mixerIndex, channelIndex, fadeTime)
                        }
                    }
                )
            }
        )

        if (remoteConnections) {
            remoteConnections.updateRemoteFaderState(
                faderIndex,
                state.faders[0].fader[faderIndex].faderLevel
            )
        }
    }

    updateInputGain = (faderIndex: number) => {
        let level = state.faders[0].fader[faderIndex].inputGain
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.mixerConnection[mixerIndex].updateInputGain(
                                channelIndex,
                                level
                            )
                        }
                    }
                )
            }
        )
    }

    updateInputSelector = (faderIndex: number) => {
        let inputSelected = state.faders[0].fader[faderIndex].inputSelector
        console.log(faderIndex, inputSelected)
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.mixerConnection[
                                mixerIndex
                            ].updateInputSelector(channelIndex, inputSelected)
                        }
                    }
                )
            }
        )
    }

    updatePflState = (channelIndex: number) => {
        this.mixerConnection[0].updatePflState(channelIndex)
    }

    updateMuteState = (faderIndex: number) => {
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.mixerConnection[mixerIndex].updateMuteState(
                                channelIndex,
                                state.faders[0].fader[faderIndex].muteOn
                            )
                        }
                    }
                )
            }
        )
    }

    updateAMixState = (faderIndex: number) => {
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.mixerConnection[mixerIndex].updateAMixState(
                                channelIndex,
                                state.faders[0].fader[faderIndex].amixOn
                            )
                        }
                    }
                )
            }
        )
    }

    updateNextAux = (faderIndex: number) => {
        let level = 0
        if (state.faders[0].fader[faderIndex].pstOn) {
            level = state.faders[0].fader[faderIndex].faderLevel
        } else if (state.faders[0].fader[faderIndex].pstVoOn) {
            level =
                (state.faders[0].fader[faderIndex].faderLevel *
                    (100 - state.settings[0].voLevel)) /
                100
        }
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.mixerConnection[mixerIndex].updateNextAux(
                                channelIndex,
                                level
                            )
                        }
                    }
                )
            }
        )
    }

    updateFx = (fxParam: fxParamsList, faderIndex: number) => {
        let level: number = state.faders[0].fader[faderIndex][fxParam][0]
        state.channels[0].chConnection.forEach(
            (chConnection: IchConnection, mixerIndex: number) => {
                chConnection.channel.forEach(
                    (channel: IChannel, channelIndex: number) => {
                        if (faderIndex === channel.assignedFader) {
                            this.mixerConnection[mixerIndex].updateFx(
                                fxParam,
                                channelIndex,
                                level
                            )
                        }
                    }
                )
            }
        )
    }
    updateAuxLevel = (channelIndex: number, auxSendIndex: number) => {
        let channel = state.channels[0].chConnection[0].channel[channelIndex]
        if (channel.auxLevel[auxSendIndex] > -1) {
            this.mixerConnection[0].updateAuxLevel(
                channelIndex,
                auxSendIndex,
                channel.auxLevel[auxSendIndex]
            )
        }
    }

    updateChannelName = (channelIndex: number) => {
        this.mixerConnection[0].updateChannelName(channelIndex)
    }

    injectCommand = (command: string[]) => {
        this.mixerConnection[0].injectCommand(command)
    }

    updateChannelSettings = (
        channelIndex: number,
        setting: string,
        value: string
    ) => {
        if (this.mixerProtocol[0].protocol === 'CasparCG') {
            this.mixerConnection[0].updateChannelSetting(
                channelIndex,
                setting,
                value
            )
        }
    }

    fadeInOut = (
        mixerIndex: number,
        channelIndex: number,
        fadeTime: number
    ) => {
        let faderIndex =
            state.channels[0].chConnection[mixerIndex].channel[channelIndex]
                .assignedFader
        if (
            !state.faders[0].fader[faderIndex].pgmOn &&
            !state.faders[0].fader[faderIndex].voOn &&
            state.channels[0].chConnection[mixerIndex].channel[channelIndex]
                .outputLevel === 0
        ) {
            return
        }
        if (
            this.mixerTimers.length === 1 &&
            this.mixerTimers[0].chTimer.length === 1
        ) {
            this.initializeTimers()
        }
        //Clear Old timer or set Fade to active:
        if (
            state.channels[0].chConnection[mixerIndex].channel[channelIndex]
                .fadeActive
        ) {
            clearInterval(
                this.mixerTimers[mixerIndex].fadeActiveTimer[channelIndex]
            )
            this.clearTimer(mixerIndex, channelIndex)
        }
        store.dispatch(storeFadeActive(mixerIndex, channelIndex, true))
        if (
            state.faders[0].fader[faderIndex].pgmOn ||
            state.faders[0].fader[faderIndex].voOn
        ) {
            this.fadeUp(mixerIndex, channelIndex, fadeTime, faderIndex)
        } else {
            this.fadeDown(mixerIndex, channelIndex, fadeTime)
        }
    }

    fadeUp = (
        mixerIndex: number,
        channelIndex: number,
        fadeTime: number,
        faderIndex: number
    ) => {
        let outputLevel =
            state.channels[0].chConnection[mixerIndex].channel[channelIndex]
                .outputLevel
        let targetVal = state.faders[0].fader[faderIndex].faderLevel

        if (state.faders[0].fader[faderIndex].voOn) {
            targetVal = (targetVal * (100 - state.settings[0].voLevel)) / 100
        }
        const step: number =
            (targetVal - outputLevel) / (fadeTime / FADE_INOUT_SPEED)
        const dispatchResolution: number =
            this.mixerProtocol[mixerIndex].FADE_DISPATCH_RESOLUTION * step
        let dispatchTrigger: number = 0
        this.clearTimer(mixerIndex, channelIndex)

        if (fadeTime === 0) {
            // dispatch immediately
            this.mixerConnection[mixerIndex].updateFadeIOLevel(
                channelIndex,
                targetVal
            )
            store.dispatch(
                storeSetOutputLevel(mixerIndex, channelIndex, targetVal)
            )
            this.delayedFadeActiveDisable(mixerIndex, channelIndex)
            dispatchTrigger = 0
        }
        if (targetVal < outputLevel) {
            this.mixerTimers[mixerIndex].chTimer[channelIndex] = setInterval(
                () => {
                    outputLevel += step
                    dispatchTrigger += step

                    if (dispatchTrigger > dispatchResolution) {
                        this.mixerConnection[mixerIndex].updateFadeIOLevel(
                            channelIndex,
                            outputLevel
                        )
                        store.dispatch(
                            storeSetOutputLevel(
                                mixerIndex,
                                channelIndex,
                                outputLevel
                            )
                        )
                        dispatchTrigger = 0
                    }

                    if (outputLevel <= targetVal) {
                        outputLevel = targetVal
                        this.mixerConnection[mixerIndex].updateFadeIOLevel(
                            channelIndex,
                            outputLevel
                        )
                        this.clearTimer(mixerIndex, channelIndex)

                        store.dispatch(
                            storeSetOutputLevel(
                                mixerIndex,
                                channelIndex,
                                outputLevel
                            )
                        )
                        this.delayedFadeActiveDisable(mixerIndex, channelIndex)
                        return true
                    }
                },
                FADE_INOUT_SPEED
            )
        } else {
            this.mixerTimers[mixerIndex].chTimer[channelIndex] = setInterval(
                () => {
                    outputLevel += step
                    dispatchTrigger += step
                    this.mixerConnection[mixerIndex].updateFadeIOLevel(
                        channelIndex,
                        outputLevel
                    )

                    if (dispatchTrigger > dispatchResolution) {
                        store.dispatch(
                            storeSetOutputLevel(
                                mixerIndex,
                                channelIndex,
                                outputLevel
                            )
                        )
                        dispatchTrigger = 0
                    }

                    if (outputLevel >= targetVal) {
                        outputLevel = targetVal
                        this.mixerConnection[mixerIndex].updateFadeIOLevel(
                            channelIndex,
                            outputLevel
                        )
                        this.clearTimer(mixerIndex, channelIndex)
                        store.dispatch(
                            storeSetOutputLevel(
                                mixerIndex,
                                channelIndex,
                                outputLevel
                            )
                        )
                        this.delayedFadeActiveDisable(mixerIndex, channelIndex)
                        return true
                    }
                },
                FADE_INOUT_SPEED
            )
        }
    }

    fadeDown = (mixerIndex: number, channelIndex: number, fadeTime: number) => {
        let outputLevel =
            state.channels[0].chConnection[mixerIndex].channel[channelIndex]
                .outputLevel
        const step = outputLevel / (fadeTime / FADE_INOUT_SPEED)
        const dispatchResolution: number =
            this.mixerProtocol[mixerIndex].FADE_DISPATCH_RESOLUTION * step
        let dispatchTrigger: number = 0

        this.clearTimer(mixerIndex, channelIndex)

        this.mixerTimers[mixerIndex].chTimer[channelIndex] = setInterval(() => {
            outputLevel -= step
            dispatchTrigger += step
            this.mixerConnection[mixerIndex].updateFadeIOLevel(
                channelIndex,
                outputLevel
            )

            if (dispatchTrigger > dispatchResolution) {
                store.dispatch(
                    storeSetOutputLevel(mixerIndex, channelIndex, outputLevel)
                )
                dispatchTrigger = 0
            }

            if (outputLevel <= 0) {
                outputLevel = 0
                this.mixerConnection[mixerIndex].updateFadeIOLevel(
                    channelIndex,
                    outputLevel
                )
                this.clearTimer(mixerIndex, channelIndex)
                store.dispatch(
                    storeSetOutputLevel(mixerIndex, channelIndex, outputLevel)
                )
                this.delayedFadeActiveDisable(mixerIndex, channelIndex)
                return true
            }
        }, FADE_INOUT_SPEED)
    }
}
