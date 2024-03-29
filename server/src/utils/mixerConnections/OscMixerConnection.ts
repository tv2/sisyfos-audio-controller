//Node Modules:
import osc from 'osc'
import fs from 'fs'
import path from 'path'

import { store, state } from '../../reducers/store'
import { mixerGenericConnection, remoteConnections } from '../../mainClasses'

//Utils:
import {
    fxParamsList,
    IMixerProtocol,
} from '../../../../shared/src/constants/MixerProtocolInterface'
import { behringerXrMeter } from './productSpecific/behringerXr'
import { midasMeter } from './productSpecific/midas'
import {
    ChannelActionTypes,
    ChannelActions,
} from '../../../../shared/src/actions/channelActions'
import {
    storeFaderLevel,
    storeFaderFx,
    storeTogglePgm,
    storeSetMute,
} from '../../../../shared/src/actions/faderActions'
import { storeSetMixerOnline } from '../../../../shared/src/actions/settingsActions'
import { logger } from '../logger'
import { sendVuLevel } from '../vuServer'
import { VuType } from '../../../../shared/src/utils/vu-server-types'
import {
    IChannelReference,
    IFader,
} from '../../../../shared/src/reducers/fadersReducer'
import { IChannel } from '../../../../shared/src/reducers/channelsReducer'
import { Dispatch } from '@reduxjs/toolkit'

interface IOscCommand {
    address: string
    args?: any[]
}

export class OscMixerConnection {
    dispatch: Dispatch<ChannelActions> = store.dispatch
    mixerProtocol: IMixerProtocol
    mixerIndex: number
    cmdChannelIndex: number
    oscConnection: any
    mixerOnlineTimer: NodeJS.Timeout
    timeoutTimer: NodeJS.Timeout
    commandBuffer: IOscCommand[] = []

    constructor(mixerProtocol: IMixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        store.dispatch(storeSetMixerOnline(this.mixerIndex, false))

        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex
        //If default store has been recreated multiple mixers are not created
        if (!state.channels[0].chMixerConnection[this.mixerIndex]) {
            state.channels[0].chMixerConnection[this.mixerIndex] = {
                channel: [],
            }
        }

        this.cmdChannelIndex =
            this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage
                .split('/')
                .findIndex((ch) => ch === '{channel}')

        try {
            this.oscConnection = new osc.UDPPort({
                localAddress: state.settings[0].mixers[this.mixerIndex].localIp,
                localPort: parseInt(
                    state.settings[0].mixers[this.mixerIndex].localOscPort + ''
                ),
                remoteAddress:
                    state.settings[0].mixers[this.mixerIndex].deviceIp,
                remotePort: parseInt(
                    state.settings[0].mixers[this.mixerIndex].devicePort + ''
                ),
            })
        } catch (error) {
            logger.error(
                `Error creating OSC connection to ${
                    state.settings[0].mixers[this.mixerIndex].deviceIp
                }:${state.settings[0].mixers[this.mixerIndex].devicePort}`
            )
            logger.error(error)
            return
        }

        this.setupMixerConnection()
    }

    mixerOnline(onLineState: boolean) {
        store.dispatch(storeSetMixerOnline(this.mixerIndex, onLineState))
        global.mainThreadHandler.updateMixerOnline(this.mixerIndex, onLineState)
    }

    private getAssignedFaderIndex(channelIndex: number): number {
        return state.faders[0].fader.findIndex((fader: IFader) =>
            fader.assignedChannels?.some((assigned: IChannelReference) => {
                return (
                    assigned.mixerIndex === this.mixerIndex &&
                    assigned.channelIndex === channelIndex
                )
            })
        )
    }

    setupMixerConnection() {
        this.oscConnection
            .on('ready', () => {
                logger.info('Receiving state of desk')
                this.initialCommands()

                this.mixerOnline(true)
                global.mainThreadHandler.updateFullClientStore()
            })
            .on('message', (message: any) => {
                clearTimeout(this.mixerOnlineTimer)
                if (!state.settings[0].mixers[this.mixerIndex].mixerOnline) {
                    logger.info(
                        `Audio Mixer number: ${this.mixerIndex + 1} is Online`
                    )
                    this.mixerOnline(true)
                }
                logger.trace(`Received OSC message: ${message.address}`)

                if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_VU?.[0].mixerMessage
                    )
                ) {
                    if (
                        state.settings[0].mixers[
                            this.mixerIndex
                        ].mixerProtocol.includes('behringer')
                    ) {
                        behringerXrMeter(this.mixerIndex, message.args)
                    } else if (
                        state.settings[0].mixers[
                            this.mixerIndex
                        ].mixerProtocol.includes('midas')
                    ) {
                        this.resetMixerTimeout()
                        midasMeter(this.mixerIndex, message.args)
                    } else {
                        const assignedFaderIndex = this.getAssignedFaderIndex(
                            message.address.split('/')[this.cmdChannelIndex]
                        )
                        let ch =
                            message.address.split('/')[this.cmdChannelIndex]
                        sendVuLevel(
                            assignedFaderIndex,
                            VuType.Channel,
                            0,
                            message.args[0]
                        )
                    }
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_VU_REDUCTION?.[0].mixerMessage
                    )
                ) {
                    const assignedFaderIndex = this.getAssignedFaderIndex(
                        message.address.split('/')[this.cmdChannelIndex]
                    )

                    sendVuLevel(
                        assignedFaderIndex,
                        VuType.Reduction,
                        0,
                        message.args[0]
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_OUT_GAIN?.[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    const assignedFaderIndex = this.getAssignedFaderIndex(
                        ch - 1
                    )

                    if (
                        assignedFaderIndex >= 0 &&
                        !state.channels[0].chMixerConnection[this.mixerIndex]
                            .channel[ch - 1].fadeActive
                    ) {
                        if (
                            message.args[0] > this.mixerProtocol.fader.min ||
                            message.args[0] >
                                state.settings[0].autoResetLevel / 100
                        ) {
                            store.dispatch(
                                storeFaderLevel(
                                    assignedFaderIndex,
                                    message.args[0]
                                )
                            )
                            state.faders[0].fader[
                                assignedFaderIndex
                            ].assignedChannels?.forEach(
                                (assignedChannel: IChannelReference) => {
                                    if (
                                        assignedChannel.mixerIndex ===
                                        this.mixerIndex
                                    ) {
                                        this.dispatch({
                                            type: ChannelActionTypes.SET_OUTPUT_LEVEL,
                                            mixerIndex: this.mixerIndex,
                                            channel:
                                                assignedChannel.channelIndex,
                                            level: message.args[0],
                                        })
                                    }
                                }
                            )
                            if (
                                !state.faders[0].fader[assignedFaderIndex].pgmOn
                            ) {
                                if (
                                    message.args[0] >
                                        this.mixerProtocol.fader.min ||
                                    0
                                ) {
                                    store.dispatch(
                                        storeTogglePgm(assignedFaderIndex)
                                    )
                                }
                            }
                        } else if (
                            state.faders[0].fader[assignedFaderIndex].pgmOn ||
                            state.faders[0].fader[assignedFaderIndex].voOn
                        ) {
                            store.dispatch(
                                storeFaderLevel(
                                    assignedFaderIndex,
                                    message.args[0]
                                )
                            )
                            state.faders[0].fader[
                                assignedFaderIndex
                            ].assignedChannels?.forEach(
                                (assignedChannel: IChannelReference) => {
                                    if (
                                        assignedChannel.mixerIndex ===
                                        this.mixerIndex
                                    ) {
                                        this.dispatch({
                                            type: ChannelActionTypes.SET_OUTPUT_LEVEL,
                                            mixerIndex: this.mixerIndex,
                                            channel:
                                                assignedChannel.channelIndex,
                                            level: message.args[0],
                                        })
                                    }
                                }
                            )
                        }
                        global.mainThreadHandler.updatePartialStore(
                            assignedFaderIndex
                        )
                        mixerGenericConnection.updateOutLevel(
                            assignedFaderIndex,
                            0,
                            this.mixerIndex
                        )
                        if (remoteConnections) {
                            remoteConnections.updateRemoteFaderState(
                                assignedFaderIndex,
                                message.args[0]
                            )
                        }
                    }
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes?.[0].fromMixer
                            .AUX_LEVEL?.[0].mixerMessage
                    )
                ) {
                    let commandArray: string[] =
                        this.mixerProtocol.channelTypes[0].fromMixer.AUX_LEVEL[0].mixerMessage.split(
                            '/'
                        )
                    let messageArray: string[] = message.address.split('/')
                    let ch = 0
                    let auxIndex = 0

                    commandArray.forEach(
                        (commandPart: string, index: number) => {
                            if (commandPart === '{channel}') {
                                ch = parseFloat(messageArray[index])
                            } else if (commandPart === '{argument}') {
                                auxIndex = parseFloat(messageArray[index]) - 1
                            }
                        }
                    )
                    if (
                        state.channels[0].chMixerConnection[this.mixerIndex]
                            .channel[ch - 1].auxLevel[auxIndex] > -1
                    ) {
                        logger.trace(
                            `Aux Message Channel: ${ch}\n  Aux Index: ${auxIndex}\n  Level: ${message.args[0]}`
                        )
                        this.dispatch({
                            type: ChannelActionTypes.SET_AUX_LEVEL,
                            mixerIndex: this.mixerIndex,
                            channel: ch - 1,
                            auxIndex: auxIndex,
                            level: message.args[0],
                        })
                        global.mainThreadHandler.updateFullClientStore()
                        if (remoteConnections) {
                            remoteConnections.updateRemoteAuxPanels()
                        }
                    }
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_NAME?.[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    this.dispatch({
                        type: ChannelActionTypes.SET_CHANNEL_LABEL,
                        mixerIndex: this.mixerIndex,
                        channel: ch - 1,
                        label: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        this.getAssignedFaderIndex(ch - 1)
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_MUTE_ON?.[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    const assignedFaderIndex = this.getAssignedFaderIndex(
                        ch - 1
                    )
                    store.dispatch(
                        storeSetMute(assignedFaderIndex, message.args[0] === 0)
                    )
                    mixerGenericConnection.updateMuteState(
                        assignedFaderIndex,
                        this.mixerIndex
                    )
                    global.mainThreadHandler.updatePartialStore(
                        assignedFaderIndex
                    )
                } else {
                    this.checkFxCommands(message)
                    logger.trace(`Unknown OSC message: ${message.address}`)
                }
            })
            .on('error', (error: any) => {
                global.mainThreadHandler.updateFullClientStore()
                logger.error(`Error: ${error}`)
            })
            .on('disconnect', () => {
                this.mixerOnline(false)
                logger.info('Lost OSC connection')
            })

        this.oscConnection.open()
        logger.info(
            `OSC listening on port ${
                state.settings[0].mixers[this.mixerIndex].localOscPort
            }`
        )

        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            let oscTimer = setInterval(() => {
                this.pingMixerCommand()
                logger.debug(`Send buffer Size: ${this.commandBuffer.length}`)
            }, this.mixerProtocol.pingTime)
        }

        //Setup Buffer Timer:
        setInterval(() => {
            if (this.commandBuffer.length > 0) {
                this.oscConnection.send(this.commandBuffer.shift())
            }
        }, 2)
    }

    initialCommands() {
        // To prevent network overload, timers will delay the requests.
        this.mixerProtocol.initializeCommands?.forEach(
            (item, itemIndex: number) => {
                setTimeout(() => {
                    if (item.mixerMessage.includes('{channel}')) {
                        if (item.type !== undefined && item.type === 'aux') {
                            state.channels[0].chMixerConnection[
                                this.mixerIndex
                            ].channel.forEach(
                                (channel: IChannel, index: number) => {
                                    const assignedFaderIndex =
                                        this.getAssignedFaderIndex(index)
                                    if (assignedFaderIndex >= 0) {
                                        channel.auxLevel.forEach(
                                            (
                                                auxLevel: any,
                                                auxIndex: number
                                            ) => {
                                                setTimeout(() => {
                                                    this.sendOutRequestAux(
                                                        item.mixerMessage,
                                                        auxIndex + 1,
                                                        state.faders[0].fader[
                                                            assignedFaderIndex
                                                        ].monitor
                                                    )
                                                }, state.faders[0].fader[assignedFaderIndex].monitor * 10 + auxIndex * 100)
                                            }
                                        )
                                    }
                                }
                            )
                        } else {
                            state.channels[0].chMixerConnection[
                                this.mixerIndex
                            ].channel.forEach((channel: any, index: any) => {
                                this.sendOutRequest(
                                    item.mixerMessage,
                                    index + 1
                                )
                            })
                        }
                    } else {
                        let value = item.value || 0
                        let type = item.type || 'i'
                        this.sendOutMessage(item.mixerMessage, 1, value, type)
                    }
                }, itemIndex * 100)
            }
        )
    }

    pingMixerCommand() {
        //Ping OSC mixer if mixerProtocol needs it.
        this.mixerProtocol.pingCommand.forEach((command) => {
            let value = command.value || 0
            let type = command.type || 'i'
            this.sendOutMessage(command.mixerMessage, 0, value, type)
        })
        global.mainThreadHandler.updateFullClientStore()
        this.mixerOnlineTimer = setTimeout(() => {
            logger.warn(`Audio Mixer number: ${this.mixerIndex + 1} is Offline`)
            store.dispatch(storeSetMixerOnline(this.mixerIndex, false))
        }, this.mixerProtocol.pingTime)
    }

    resetMixerTimeout() {
        // Check mixer Timeout response if protocol needs it:
        if (this.mixerProtocol.mixerTimeout > 0) {
            clearTimeout(this.timeoutTimer)
            this.timeoutTimer = setTimeout(() => {
                logger.warn(
                    `Audio Mixer number: ${this.mixerIndex + 1} timeout`
                )
            }, this.mixerProtocol.mixerTimeout)
        }
    }

    checkFxCommands(message: any) {
        Object.keys(fxParamsList).forEach((keyName: string) => {
            if (!isNaN(parseFloat(keyName))) {
                return
            }

            let fxKey = keyName as keyof typeof fxParamsList
            let fxMessage =
                this.mixerProtocol.channelTypes[0].fromMixer[
                    fxParamsList[fxKey]
                ][0]
            let range: number = fxMessage.max - fxMessage.min || 1
            if (this.checkOscCommand(message.address, fxMessage.mixerMessage)) {
                const ch = message.address.split('/')[this.cmdChannelIndex]
                const assignedFaderIndex = this.getAssignedFaderIndex(ch - 1)
                if (assignedFaderIndex >= 0) {
                    store.dispatch(
                        storeFaderFx(
                            fxParamsList[fxKey],
                            assignedFaderIndex,
                            message.args[0] / range
                        )
                    )
                    global.mainThreadHandler.updatePartialStore(
                        assignedFaderIndex
                    )
                }
            }

            logger.trace(fxKey)
        })
    }

    checkOscCommand(message: string, command: string | undefined): boolean {
        if (!command) return false
        if (message === command) return true
        let messageArray: string[] = message.split('/')
        let commandArray: string[] = command.split('/')
        let status: boolean = true
        if (messageArray.length !== commandArray.length) {
            return false
        }
        commandArray.forEach((commandPart: string, index: number) => {
            if (commandPart === '{channel}') {
                if (typeof parseFloat(messageArray[index]) !== 'number') {
                    status = false
                }
            } else if (commandPart === '{argument}') {
                if (typeof parseFloat(messageArray[index]) !== 'number') {
                    status = false
                }
            } else if (commandPart !== messageArray[index]) {
                status = false
            }
        })
        return status
    }

    sendOutMessage(
        oscMessage: string,
        channel: number,
        value: string | number,
        type: string
    ) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        let message = oscMessage.replace('{channel}', channelString)
        if (message != 'none') {
            logger.trace(`Sending OSC command: ${message}`)
            this.sendBuffered({
                address: message,
                args: [
                    {
                        type: type,
                        value: value,
                    },
                ],
            })
        }
    }

    sendOutRequest(oscMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        let message = oscMessage.replace('{channel}', channelString)
        if (message != 'none') {
            this.sendBuffered({
                address: message,
            })
        }
    }

    sendOutRequestAux(oscMessage: string, channel: number, auxSend: number) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        let message = oscMessage.replace('{channel}', channelString)
        let auxSendNumber = this.mixerProtocol.leadingZeros
            ? ('0' + String(auxSend)).slice(-2)
            : String(auxSend)
        message = message.replace('{argument}', auxSendNumber)
        logger.trace(`Initial Aux Message: ${message}`)
        if (message != 'none') {
            this.sendBuffered({
                address: message,
            })
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex + 1,
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel,
            'f'
        )
    }

    updatePflState(channelIndex: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        if (state.faders[0].fader[channelIndex].pflOn === true) {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
                    .mixerMessage,
                channelTypeIndex + 1,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
                    .value,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
                    .type
            )
        } else {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
                    .mixerMessage,
                channelTypeIndex + 1,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
                    .value,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
                    .type
            )
        }
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        if (muteOn === true) {
            let mute =
                this.mixerProtocol.channelTypes[channelType].toMixer
                    .CHANNEL_MUTE_ON[0]
            this.sendOutMessage(
                mute.mixerMessage,
                channelTypeIndex + 1,
                mute.value,
                mute.type
            )
        } else {
            let mute =
                this.mixerProtocol.channelTypes[channelType].toMixer
                    .CHANNEL_MUTE_OFF[0]
            this.sendOutMessage(
                mute.mixerMessage,
                channelTypeIndex + 1,
                mute.value,
                mute.type
            )
        }
    }

    updateNextAux(channelIndex: number, level: number) {
        this.updateAuxLevel(
            channelIndex,
            state.settings[0].mixers[this.mixerIndex].nextSendAux - 1,
            level
        )
    }

    updateInputGain(channelIndex: number, level: number) {
        return true
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        return true
    }

    updateFx(fxParam: fxParamsList, channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let fx =
            this.mixerProtocol.channelTypes[channelType].toMixer[fxParam][0]
        this.sendOutMessage(fx.mixerMessage, channelTypeIndex + 1, level, 'f')
    }

    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex + 1
        let auxSendCmd =
            this.mixerProtocol.channelTypes[channelType].toMixer.AUX_LEVEL[0]
        let auxSendNumber = this.mixerProtocol.leadingZeros
            ? ('0' + String(auxSendIndex + 1)).slice(-2)
            : String(auxSendIndex + 1)
        let message = auxSendCmd.mixerMessage.replace(
            '{argument}',
            auxSendNumber
        )

        this.sendOutMessage(message, channel, level, 'f')
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex + 1,
            String(outputLevel),
            'f'
        )
    }

    updateChannelName(channelIndex: number) {
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let channelName = state.faders[0].fader[channelIndex].label
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_NAME[0]
                .mixerMessage,
            channelTypeIndex + 1,
            channelName,
            's'
        )
    }

    loadMixerPreset(presetName: string) {
        logger.info(`Loading preset: ${presetName}`)
        if (this.mixerProtocol.presetFileExtension === 'X32') {
            let data = JSON.parse(
                fs.readFileSync(
                    path.resolve(process.cwd(), 'storage', presetName),
                    'utf8'
                )
            )

            this.sendBuffered({
                address: this.mixerProtocol.loadPresetCommand[0].mixerMessage,
                args: [
                    {
                        type: 's',
                        value: 'scene',
                    },
                    {
                        type: 'i',
                        value: parseInt(data.sceneIndex),
                    },
                ],
            })
            setTimeout(() => {
                this.initialCommands()
            }, 1000)
        }
    }

    sendBuffered(command: IOscCommand) {
        this.commandBuffer.push(JSON.parse(JSON.stringify(command)))
    }

    injectCommand(command: string[]) {
        return true
    }
}
