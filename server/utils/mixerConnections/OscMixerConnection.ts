//Node Modules:
const osc = require('osc')
const fs = require('fs')
const path = require('path')

import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'
import { socketServer } from '../../expressHandler'

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import {
    behringerXrMeter,
    behringerReductionMeter,
} from './productSpecific/behringerXr'
import { midasMeter } from './productSpecific/midas'
import {
    storeSetAuxLevel,
    storeSetOutputLevel,
} from '../../reducers/channelActions'
import {
    SET_FADER_LEVEL,
    SET_CHANNEL_LABEL,
    TOGGLE_PGM,
    SET_FADER_THRESHOLD,
    SET_FADER_RATIO,
    SET_FADER_LO_MID,
    SET_FADER_MID,
    SET_FADER_HIGH,
    SET_FADER_LOW,
    SET_FADER_DELAY_TIME,
    SET_MUTE,
    storeVuLevel,
    storeVuReductionLevel,
} from '../../reducers/faderActions'
import { storeSetMixerOnline } from '../../reducers/settingsActions'
import {
    SOCKET_SET_VU,
    SOCKET_SET_VU_REDUCTION,
    SOCKET_SET_MIXER_ONLINE,
} from '../../constants/SOCKET_IO_DISPATCHERS'
import { logger } from '../logger'

export class OscMixerConnection {
    mixerProtocol: IMixerProtocol
    mixerIndex: number
    cmdChannelIndex: number
    oscConnection: any
    mixerOnlineTimer: any

    constructor(mixerProtocol: IMixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        store.dispatch(storeSetMixerOnline(false))

        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex

        this.cmdChannelIndex = this.mixerProtocol.channelTypes[0].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage
            .split('/')
            .findIndex((ch) => ch === '{channel}')

        this.oscConnection = new osc.UDPPort({
            localAddress: state.settings[0].mixers[this.mixerIndex].localIp,
            localPort: parseInt(
                state.settings[0].mixers[this.mixerIndex].localOscPort + ''
            ),
            remoteAddress: state.settings[0].mixers[this.mixerIndex].deviceIp,
            remotePort: parseInt(
                state.settings[0].mixers[this.mixerIndex].devicePort + ''
            ),
        })
        this.setupMixerConnection()
    }

    mixerOnline(onLineState: boolean) {
        store.dispatch(storeSetMixerOnline(onLineState))
        socketServer.emit(SOCKET_SET_MIXER_ONLINE, {
            mixerOnline: state,
        })
    }

    setupMixerConnection() {
        this.oscConnection
            .on('ready', () => {
                logger.info('Receiving state of desk', {})
                this.initialCommands()

                this.mixerOnline(true)
                global.mainThreadHandler.updateFullClientStore()
            })
            .on('message', (message: any) => {
                clearTimeout(this.mixerOnlineTimer)
                logger.verbose('Received OSC message: ' + message.address, {})

                if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_VU[0].mixerMessage
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
                        midasMeter(this.mixerIndex, message.args)
                    } else {
                        let ch = message.address.split('/')[
                            this.cmdChannelIndex
                        ]
                        store.dispatch(
                            storeVuLevel(
                                state.channels[0].chConnection[this.mixerIndex]
                                    .channel[ch - 1].assignedFader,
                                message.args[0]
                            )
                        )
                        socketServer.emit(SOCKET_SET_VU, {
                            faderIndex:
                                state.channels[0].chConnection[this.mixerIndex]
                                    .channel[ch - 1].assignedFader,
                            level: message.args[0],
                        })
                    }
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_VU_REDUCTION[0].mixerMessage
                    )
                ) {
                    if (
                        state.settings[0].mixers[
                            this.mixerIndex
                        ].mixerProtocol.includes('behringer')
                    ) {
                        behringerReductionMeter(this.mixerIndex, message.args)
                    } else if (
                        state.settings[0].mixers[
                            this.mixerIndex
                        ].mixerProtocol.includes('midas')
                    ) {
                        midasMeter(this.mixerIndex, message.args)
                    } else {
                        let ch = message.address.split('/')[
                            this.cmdChannelIndex
                        ]
                        store.dispatch(
                            storeVuReductionLevel(
                                state.channels[0].chConnection[this.mixerIndex]
                                    .channel[ch - 1].assignedFader,
                                message.args[0]
                            )
                        )
                        socketServer.emit(SOCKET_SET_VU_REDUCTION, {
                            faderIndex:
                                state.channels[0].chConnection[this.mixerIndex]
                                    .channel[ch - 1].assignedFader,
                            level: message.args[0],
                        })
                    }
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_OUT_GAIN[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    let assignedFaderIndex =
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader

                    if (
                        !state.channels[0].chConnection[this.mixerIndex]
                            .channel[ch - 1].fadeActive
                    ) {
                        if (
                            message.args[0] > this.mixerProtocol.fader.min ||
                            0 +
                                (this.mixerProtocol.fader.max ||
                                    1 * state.settings[0].autoResetLevel) /
                                    100
                        ) {
                            store.dispatch({
                                type: SET_FADER_LEVEL,
                                channel: assignedFaderIndex,
                                level: message.args[0],
                            })
                            state.channels[0].chConnection[
                                this.mixerIndex
                            ].channel.forEach((item, index) => {
                                if (item.assignedFader === assignedFaderIndex) {
                                    store.dispatch(
                                        storeSetOutputLevel(
                                            this.mixerIndex,
                                            index,
                                            message.args[0]
                                        )
                                    )
                                }
                            })
                            if (
                                !state.faders[0].fader[assignedFaderIndex].pgmOn
                            ) {
                                if (
                                    message.args[0] >
                                        this.mixerProtocol.fader.min ||
                                    0
                                ) {
                                    store.dispatch({
                                        type: TOGGLE_PGM,
                                        channel: assignedFaderIndex,
                                    })
                                }
                            }
                        } else if (
                            state.faders[0].fader[assignedFaderIndex].pgmOn ||
                            state.faders[0].fader[assignedFaderIndex].voOn
                        ) {
                            store.dispatch({
                                type: SET_FADER_LEVEL,
                                channel: assignedFaderIndex,
                                level: message.args[0],
                            })
                            state.channels[0].chConnection[
                                this.mixerIndex
                            ].channel.forEach((item, index) => {
                                if (item.assignedFader === assignedFaderIndex) {
                                    store.dispatch(
                                        storeSetOutputLevel(
                                            this.mixerIndex,
                                            index,
                                            message.args[0]
                                        )
                                    )
                                }
                            })
                        }
                        global.mainThreadHandler.updatePartialStore(
                            assignedFaderIndex
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
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .AUX_LEVEL[0].mixerMessage
                    )
                ) {
                    let commandArray: string[] = this.mixerProtocol.channelTypes[0].fromMixer.AUX_LEVEL[0].mixerMessage.split(
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
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].auxLevel[auxIndex] > -1
                    ) {
                        logger.verbose(
                            'Aux Message Channel : ' +
                                ch +
                                '  Aux Index :' +
                                auxIndex +
                                ' Level : ' +
                                message.args[0]
                        )
                        store.dispatch(
                            storeSetAuxLevel(
                                this.mixerIndex,
                                ch - 1,
                                auxIndex,
                                message.args[0]
                            )
                        )
                        global.mainThreadHandler.updateFullClientStore()
                        if (remoteConnections) {
                            remoteConnections.updateRemoteAuxPanels()
                        }
                    }
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_NAME[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    store.dispatch({
                        type: SET_CHANNEL_LABEL,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        label: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .CHANNEL_MUTE_ON[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    let mute = message.args[0] === 0 ? 1 : 0
                    store.dispatch({
                        type: SET_MUTE,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        muteOn: mute,
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .THRESHOLD[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    store.dispatch({
                        type: SET_FADER_THRESHOLD,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        level: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer.RATIO[0]
                            .mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    let ratio = this.mixerProtocol.channelTypes[0].fromMixer
                        .RATIO[0]
                    let level =
                        message.args[0] /
                        (ratio.max || 1 - ratio.min || 0 + ratio.min || 0)
                    store.dispatch({
                        type: SET_FADER_RATIO,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        level: level,
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer
                            .DELAY_TIME[0].mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    let delay = this.mixerProtocol.channelTypes[0].fromMixer
                        .DELAY_TIME[0]
                    let delayTime =
                        message.args[0] /
                        (delay.max || 1 - delay.min || 0 + delay.min || 0)
                    store.dispatch({
                        type: SET_FADER_DELAY_TIME,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        delayTime: delayTime,
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer.LOW[0]
                            .mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    store.dispatch({
                        type: SET_FADER_LOW,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        level: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer.LO_MID[0]
                            .mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    store.dispatch({
                        type: SET_FADER_LO_MID,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        level: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer.MID[0]
                            .mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    store.dispatch({
                        type: SET_FADER_MID,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        level: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else if (
                    this.checkOscCommand(
                        message.address,
                        this.mixerProtocol.channelTypes[0].fromMixer.HIGH[0]
                            .mixerMessage
                    )
                ) {
                    let ch = message.address.split('/')[this.cmdChannelIndex]
                    store.dispatch({
                        type: SET_FADER_HIGH,
                        channel:
                            state.channels[0].chConnection[this.mixerIndex]
                                .channel[ch - 1].assignedFader,
                        level: message.args[0],
                    })
                    global.mainThreadHandler.updatePartialStore(
                        state.channels[0].chConnection[this.mixerIndex].channel[
                            ch - 1
                        ].assignedFader
                    )
                } else {
                    logger.verbose(
                        'Unknown OSC message: ' + message.address,
                        {}
                    )
                }
            })
            .on('error', (error: any) => {
                global.mainThreadHandler.updateFullClientStore()
                logger.error('Error : ' + String(error), {})
            })
            .on('disconnect', () => {
                this.mixerOnline(false)
                logger.info('Lost OSC connection', {})
            })

        this.oscConnection.open()
        logger.info(
            `OSC listening on port ` +
                String(state.settings[0].mixers[this.mixerIndex].localOscPort),
            {}
        )

        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            let oscTimer = setInterval(() => {
                this.pingMixerCommand()
            }, this.mixerProtocol.pingTime)
        }
    }

    initialCommands() {
        // To prevent network overload, timers will delay the requests.
        this.mixerProtocol.initializeCommands.forEach(
            (item, itemIndex: number) => {
                setTimeout(() => {
                    if (item.mixerMessage.includes('{channel}')) {
                        if (item.type !== undefined && item.type === 'aux') {
                            state.channels[0].chConnection[
                                this.mixerIndex
                            ].channel.forEach((channel: any) => {
                                channel.auxLevel.forEach(
                                    (auxLevel: any, auxIndex: number) => {
                                        if (channel.assignedFader >= 0) {
                                            if (
                                                state.faders[0].fader[
                                                    channel.assignedFader
                                                ]
                                            ) {
                                                setTimeout(() => {
                                                    this.sendOutRequestAux(
                                                        item.mixerMessage,
                                                        auxIndex + 1,
                                                        state.faders[0].fader[
                                                            channel
                                                                .assignedFader
                                                        ].monitor
                                                    )
                                                }, state.faders[0].fader[channel.assignedFader].monitor * 10 + auxIndex * 100)
                                            }
                                        }
                                    }
                                )
                            })
                        } else {
                            state.channels[0].chConnection[
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
        this.mixerProtocol.pingCommand.map((command) => {
            let value = command.value || 0
            let type = command.type || 'i'
            this.sendOutMessage(command.mixerMessage, 0, value, type)
        })
        global.mainThreadHandler.updateFullClientStore()
        this.mixerOnlineTimer = setTimeout(() => {
            store.dispatch(storeSetMixerOnline(false))
        }, this.mixerProtocol.pingTime)
    }

    checkOscCommand(message: string, command: string): boolean {
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
            logger.verbose('Sending OSC command :' + message, {})
            this.oscConnection.send({
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
            this.oscConnection.send({
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
        logger.verbose('Initial Aux Message : ' + message)
        if (message != 'none') {
            this.oscConnection.send({
                address: message,
            })
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex + 1,
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel,
            'f'
        )
    }

    updatePflState(channelIndex: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
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
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        if (muteOn === true) {
            let mute = this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_MUTE_ON[0]
            this.sendOutMessage(
                mute.mixerMessage,
                channelTypeIndex + 1,
                mute.value,
                mute.type
            )
        } else {
            let mute = this.mixerProtocol.channelTypes[channelType].toMixer
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

    updateThreshold(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let thr = this.mixerProtocol.channelTypes[channelType].toMixer
            .THRESHOLD[0]
        this.sendOutMessage(thr.mixerMessage, channelTypeIndex + 1, level, 'f')
    }
    updateRatio(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let ratio = this.mixerProtocol.channelTypes[channelType].toMixer
            .RATIO[0]
        this.sendOutMessage(
            ratio.mixerMessage,
            channelTypeIndex + 1,
            level,
            'f'
        )
    }
    updateDelayTime(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let delayTime = this.mixerProtocol.channelTypes[channelType].toMixer
            .DELAY_TIME[0]
        this.sendOutMessage(
            delayTime.mixerMessage,
            channelTypeIndex + 1,
            level,
            'f'
        )
    }
    updateLow(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let low = this.mixerProtocol.channelTypes[channelType].toMixer.LOW[0]
        this.sendOutMessage(low.mixerMessage, channelTypeIndex + 1, level, 'f')
    }
    updateLoMid(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let loMid = this.mixerProtocol.channelTypes[channelType].toMixer
            .LO_MID[0]
        this.sendOutMessage(
            loMid.mixerMessage,
            channelTypeIndex + 1,
            level,
            'f'
        )
    }
    updateMid(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let mid = this.mixerProtocol.channelTypes[channelType].toMixer.MID[0]
        this.sendOutMessage(mid.mixerMessage, channelTypeIndex + 1, level, 'f')
    }
    updateHigh(channelIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let high = this.mixerProtocol.channelTypes[channelType].toMixer.HIGH[0]
        this.sendOutMessage(high.mixerMessage, channelTypeIndex + 1, level, 'f')
    }

    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        let channelType =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channel =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex + 1
        let auxSendCmd = this.mixerProtocol.channelTypes[channelType].toMixer
            .AUX_LEVEL[0]
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
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
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
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
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
        logger.info('Loading preset : ' + presetName)
        if (this.mixerProtocol.presetFileExtension === 'X32') {
            let data = JSON.parse(
                fs.readFileSync(path.resolve('storage', presetName))
            )

            this.oscConnection.send({
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
        }
    }

    injectCommand(command: string[]) {
        return true
    }
}
