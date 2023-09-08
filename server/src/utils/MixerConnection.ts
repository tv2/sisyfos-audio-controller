import { store, state } from '../reducers/store'
import { logger } from './logger'
import { remoteConnections } from '../mainClasses'

//Utils:
import { MixerProtocolPresets } from '../../../shared/src/constants/MixerProtocolPresets'
import {
    IMixerProtocol,
    IMixerProtocolGeneric,
    ICasparCGMixerGeometry,
    fxParamsList,
} from '../../../shared/src/constants/MixerProtocolInterface'
import { OscMixerConnection } from './mixerConnections/OscMixerConnection'
import { VMixMixerConnection } from './mixerConnections/VMixMixerConnection'
import { MidiMixerConnection } from './mixerConnections/MidiMixerConnection'
import { QlClMixerConnection } from './mixerConnections/YamahaQlClConnection'
import { SSLMixerConnection } from './mixerConnections/SSLMixerConnection'
import { EmberMixerConnection } from './mixerConnections/EmberMixerConnection'
import { LawoRubyMixerConnection } from './mixerConnections/LawoRubyConnection'
import { StuderMixerConnection } from './mixerConnections/StuderMixerConnection'
import { StuderVistaMixerConnection } from './mixerConnections/StuderVistaMixerConnection'
import { CasparCGConnection } from './mixerConnections/CasparCGConnection'
import {
    IchMixerConnection,
} from '../../../shared/src/reducers/channelsReducer'
import {
    storeFadeActive,
    storeSetOutputLevel,
} from '../../../shared/src/actions/channelActions'
import { storeFaderLevel } from '../../../shared/src/actions/faderActions'
import { AtemMixerConnection } from './mixerConnections/AtemConnection'
import { IChannelReference } from '../../../shared/src/reducers/fadersReducer'

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
            } else if (this.mixerProtocol[index].protocol === 'VMIX') {
                this.mixerConnection[index] = new VMixMixerConnection(
                    this.mixerProtocol[index] as IMixerProtocol,
                    index
                )
            } else if (this.mixerProtocol[index].protocol === 'ATEM') {
                this.mixerConnection[index] = new AtemMixerConnection(
                    this.mixerProtocol[index],
                    index
                )
            }
        })

        // Setup timers for fade in & out
        this.initializeTimers()
    }

    initializeTimers = () => {
        // Setup timers for fade in & out
        this.mixerTimers = []
        state.channels[0].chMixerConnection.forEach(
            (chMixerConnection: IchMixerConnection, mixerIndex: number) => {
                this.mixerTimers.push({ chTimer: [], fadeActiveTimer: [] })
                state.channels[0].chMixerConnection[mixerIndex].channel.forEach(
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
            this.updateOutLevel(index, -1)
        })
    }

    updateOutLevels = () => {
        state.faders[0].fader.forEach((channel: any, index: number) => {
            this.updateOutLevel(index, -1)
            this.updateNextAux(index)
        })
    }

    updateOutLevel = (
        faderIndex: number,
        fadeTime: number,
        mixerIndexToSkip: number = -1
    ) => {
        if (fadeTime === -1) {
            if (state.faders[0].fader[faderIndex].voOn) {
                fadeTime = state.settings[0].voFadeTime
            } else {
                fadeTime = state.settings[0].fadeTime

                // When in manual mode - test if SLOW FADE Button is ON:
                if (
                    !state.settings[0].automationMode &&
                    state.faders[0].fader[faderIndex].slowFadeOn
                ) {
                    fadeTime = state.settings[0].voFadeTime
                }
            }
        }


        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                if (assignedChannel.mixerIndex !== mixerIndexToSkip) {
                    this.fadeInOut(
                        assignedChannel.mixerIndex,
                        assignedChannel.channelIndex,
                        faderIndex,
                        fadeTime,
                    )
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

    updateInputGain = (faderIndex: number) => {
        let level = state.faders[0].fader[faderIndex].inputGain
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                this.mixerConnection[assignedChannel.mixerIndex].updateInputGain(
                    assignedChannel.channelIndex,
                    level,
                )
            }
        )
    }

    updateInputSelector = (faderIndex: number) => {
        let inputSelected = state.faders[0].fader[faderIndex].inputSelector
        logger.trace(`${faderIndex} ${inputSelected}`)
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                this.mixerConnection[assignedChannel.mixerIndex].updateInputSelector(
                    assignedChannel.channelIndex,
                    inputSelected,
                )
            }
        )
    }

    updatePflState = (channelIndex: number) => {
        this.mixerConnection[0].updatePflState(channelIndex)
    }

    updateMuteState = (faderIndex: number, mixerIndexToSkip: number = -1) => {
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                if (assignedChannel.mixerIndex !== mixerIndexToSkip) {
                    this.mixerConnection[assignedChannel.mixerIndex].updateMuteState(
                        assignedChannel.channelIndex,
                        state.faders[0].fader[faderIndex].muteOn,
                    )
                }
            }
        )
    }

    updateAMixState = (faderIndex: number) => {
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                this.mixerConnection[assignedChannel.mixerIndex].updateAMixState(
                    assignedChannel.channelIndex,
                    state.faders[0].fader[faderIndex].amixOn,
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
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                this.mixerConnection[assignedChannel.mixerIndex].updateNextAux(
                    assignedChannel.channelIndex,
                    level,
                )
            }
        )
    }

    updateFx = (fxParam: fxParamsList, faderIndex: number) => {
        let level: number = state.faders[0].fader[faderIndex][fxParam][0]
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (assignedChannel: IChannelReference) => {
                this.mixerConnection[assignedChannel.mixerIndex].updateFx(
                    fxParam,
                    assignedChannel.channelIndex,
                    level,
                )
            }
        )
    }

    updateAuxLevel = (channelIndex: number, auxSendIndex: number) => {
        let channel =
            state.channels[0].chMixerConnection[0].channel[channelIndex]
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
        faderIndex: number,
        fadeTime: number
    ) => {
        if (
            !state.faders[0].fader[faderIndex].pgmOn &&
            !state.faders[0].fader[faderIndex].voOn &&
            state.channels[0].chMixerConnection[mixerIndex].channel[
                channelIndex
            ].outputLevel === 0
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
            state.channels[0].chMixerConnection[mixerIndex].channel[
                channelIndex
            ].fadeActive
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
        const outputLevel =
            state.channels[0].chMixerConnection[mixerIndex].channel[
                channelIndex
            ].outputLevel
        let targetVal = state.faders[0].fader[faderIndex].faderLevel

        if (state.faders[0].fader[faderIndex].voOn) {
            targetVal = (targetVal * (100 - state.settings[0].voLevel)) / 100
        }

        this.fade(fadeTime, mixerIndex, channelIndex, outputLevel, targetVal)
    }

    fade(
        fadeTime: number,
        mixerIndex: number,
        channelIndex: number,
        startLevel: number,
        endLevel: number
    ) {
        const startTimeAsMs = Date.now()
        const updateInterval: number = Math.floor(
            1000 / this.mixerProtocol[mixerIndex].MAX_UPDATES_PER_SECOND
        )

        this.clearTimer(mixerIndex, channelIndex)

        this.mixerTimers[mixerIndex].chTimer[channelIndex] = setInterval(
            () =>
                this.updateOutputLevel(
                    startTimeAsMs,
                    fadeTime,
                    mixerIndex,
                    channelIndex,
                    startLevel,
                    endLevel
                ),
            updateInterval
        )
        this.updateOutputLevel(
            startTimeAsMs,
            fadeTime,
            mixerIndex,
            channelIndex,
            startLevel,
            endLevel
        )
    }

    private updateOutputLevel(
        startTimeAsMs: number,
        fadeTime: number,
        mixerIndex: number,
        channelIndex: number,
        startLevel: number,
        endLevel: number
    ) {
        const currentTimeMS = Date.now()
        const elapsedTimeMS = currentTimeMS - startTimeAsMs

        if (elapsedTimeMS >= fadeTime || endLevel === startLevel) {
            this.mixerConnection[mixerIndex].updateFadeIOLevel(
                channelIndex,
                endLevel
            )
            this.clearTimer(mixerIndex, channelIndex)
            store.dispatch(
                storeSetOutputLevel(mixerIndex, channelIndex, endLevel)
            )
            this.delayedFadeActiveDisable(mixerIndex, channelIndex)
            return true
        }

        const currentOutputLevel =
            startLevel +
            (endLevel - startLevel) *
            Math.max(0, Math.min(1, elapsedTimeMS / fadeTime))

        this.mixerConnection[mixerIndex].updateFadeIOLevel(
            channelIndex,
            currentOutputLevel
        )

        store.dispatch(
            storeSetOutputLevel(mixerIndex, channelIndex, currentOutputLevel)
        )
    }

    fadeDown = (mixerIndex: number, channelIndex: number, fadeTime: number) => {
        const outputLevel =
            state.channels[0].chMixerConnection[mixerIndex].channel[
                channelIndex
            ].outputLevel

        this.fade(fadeTime, mixerIndex, channelIndex, outputLevel, 0)
    }
}

export interface MixerConnection {
    updatePflState: (channelIndex: number) => void
    updateMuteState: (channelIndex: number, muteOn: boolean) => void
    updateAMixState: (channelIndex: number, amixOn: boolean) => void
    updateNextAux: (channelIndex: number, level: number) => void
    updateFx: (
        fxParam: fxParamsList,
        channelIndex: number,
        level: number
    ) => void
    updateAuxLevel: (
        channelIndex: number,
        auxSendIndex: number,
        auxLevel: number
    ) => void
    updateChannelName: (channelIndex: number) => void
    injectCommand: (command: string[]) => void
    updateChannelSetting: (
        channelIndex: number,
        setting: string,
        value: string
    ) => void
    updateFadeIOLevel: (channelIndex: number, level: number) => void
}
