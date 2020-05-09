//@ts-ignore
import { BER } from 'node-emberplus'
import { store, state } from '../../reducers/store'
const net = require('net')
const BERasn = require('asn1').Ber

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import { logger } from '../logger'
import { SET_MIXER_ONLINE } from '../../reducers/settingsActions'
import { socketServer } from '../../expressHandler'
import {
    SOCKET_SET_MIXER_ONLINE,
    SOCKET_SET_VU,
} from '../../constants/SOCKET_IO_DISPATCHERS'
import {
    SET_VU_LEVEL,
    SET_FADER_LEVEL,
    TOGGLE_PGM,
    SET_CHANNEL_LABEL,
    SET_MUTE,
} from '../../reducers/faderActions'
import { SET_OUTPUT_LEVEL, SET_AUX_LEVEL } from '../../reducers/channelActions'
import { remoteConnections } from '../../mainClasses'

export class StuderVistaMixerConnection {
    mixerProtocol: IMixerProtocol
    deviceRoot: any
    emberNodeObject: Array<any>
    mixerConnection: any

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.emberNodeObject = new Array(200)
        this.mixerProtocol = mixerProtocol

        this.mixerOnline(false)

        logger.info('Setting up Ember connection')

        this.mixerConnection = net.createConnection(
            {
                port: parseInt(state.settings[0].devicePort + ''),
                host: state.settings[0].deviceIp,
                timeout: 1000,
            },
            () => {}
        )

        this.mixerConnection
            .on('end', () => {
                // When connection disconnected.
                logger.info('Ember Client socket disconnect. ')
                this.mixerOnline(false)
            })
            .on('error', (err: any) => {
                logger.error(JSON.stringify(err))
                this.mixerOnline(false)
            })
            .on('connect', () => {
                this.setupMixerConnection()
            })
    }

    setupMixerConnection() {
        logger.info('Ember connection established')
        this.mixerConnection.on('data', (data: any) => {
            let message: string = ''
            data.forEach((byte: any) => {
                message = message + byte.toString(16) + ' '
            })
            logger.verbose('Received Ember message: ' + message, {})

            if (
                this.checkEmberCommand(
                    message,
                    this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_OUT_GAIN[0].mixerMessage
                )
            ) {
                let { channel, value, argument } = this.convertEmberCommand(
                    message,
                    this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_OUT_GAIN[0].mixerMessage
                )
                if (channel >= 0) {
                    let assignedFaderIndex =
                        state.channels[0].channel[channel - 1].assignedFader

                    if (!state.channels[0].channel[channel - 1].fadeActive) {
                        if (
                            value ||
                            1 > state.settings[0].autoResetLevel / 100
                        ) {
                            store.dispatch({
                                type: SET_FADER_LEVEL,
                                channel: assignedFaderIndex,
                                level: value,
                            })
                            state.channels[0].channel.forEach((item, index) => {
                                if (item.assignedFader === assignedFaderIndex) {
                                    store.dispatch({
                                        type: SET_OUTPUT_LEVEL,
                                        channel: index,
                                        level: value,
                                    })
                                }
                            })
                            if (
                                !state.faders[0].fader[assignedFaderIndex].pgmOn
                            ) {
                                if (value || 1 > this.mixerProtocol.fader.min) {
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
                                level: value,
                            })
                            state.channels[0].channel.forEach((item, index) => {
                                if (item.assignedFader === assignedFaderIndex) {
                                    store.dispatch({
                                        type: SET_OUTPUT_LEVEL,
                                        channel: index,
                                        level: value,
                                    })
                                }
                            })
                        }
                        global.mainThreadHandler.updatePartialStore(
                            assignedFaderIndex
                        )

                        if (remoteConnections) {
                            remoteConnections.updateRemoteFaderState(
                                assignedFaderIndex,
                                channel
                            )
                        }
                    }
                }
            } else if (
                this.checkEmberCommand(
                    message,
                    this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_MUTE_ON[0].mixerMessage
                )
            ) {
                let { channel, value, argument } = this.convertEmberCommand(
                    message,
                    this.mixerProtocol.channelTypes[0].fromMixer
                        .CHANNEL_MUTE_ON[0].mixerMessage
                )
                let mute = 0 // message === 0 ? 1 : 0
                store.dispatch({
                    type: SET_MUTE,
                    channel:
                        state.channels[0].channel[channel - 1].assignedFader,
                    muteOn: mute,
                })
                global.mainThreadHandler.updatePartialStore(
                    state.channels[0].channel[channel - 1].assignedFader
                )
            } else {
                logger.verbose('Unknown Vista message message: ' + message, {})
            }
        })

        this.mixerOnline(true)

        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            let emberTimer = setInterval(() => {
                this.pingMixerCommand()
            }, this.mixerProtocol.pingTime)
        }
    }

    checkEmberCommand(message: string, protocolMessage: string): boolean {
        if (protocolMessage === 'none') {
            return false
        }

        let messageArray = message.split('31 ')
        if (messageArray.length > 1) {
            let protocolArray = protocolMessage.split(' ')
            let index = 0
            let test = protocolArray.every((value: string) => {
                if (value === '{channel}' || value === '{aux}') {
                    index += 1
                } else {
                    if (value === messageArray[index + 1].split(' ')[1]) {
                        test = true
                        index += 1
                    } else {
                        return false
                    }
                }
                return true
            })
            return test
        } else {
            return false
        }
    }

    convertEmberCommand(
        message: string,
        protocolMessage: string
    ): { channel: number; value: number; argument: string } {
        let messageArray = message.split('31 ')
        let protocolArray = protocolMessage.split(' ')

        let channel: number = 0
        let value: number = 0
        let argument: string = ''

        // Extract Channel type: (mono, st, 5.1)

        // Extract Channel number:
        protocolArray.forEach((value: string, index: number) => {
            if (value === '{channel}') {
                channel =
                    parseInt(messageArray[index + 1].split(' ')[1], 16) - 160
            }
        })
        // Extract value:
        let hexString = messageArray[messageArray.length - 1] //.replace('63','30')
        let hexVal = hexString.split(' ').slice(3)
        hexVal = hexVal.slice(0, parseInt(hexVal[1], 16) + 2)
        let BERreader = new BER.Reader(
            Buffer.from(
                hexVal.map((byte) => {
                    return parseInt(byte, 16)
                })
            )
        )
        value = BERreader.readReal()
        value = 0.9 + value / Math.log(10) / 40 // 40 * Math.log((1.14 * value) / 0.88)
        console.log('Channel :', channel, 'Value :', value)

        return {
            channel: channel,
            value: value,
            argument: '',
        }
    }

    mixerOnline(state: boolean) {
        store.dispatch({
            type: SET_MIXER_ONLINE,
            mixerOnline: state,
        })
        socketServer.emit(SOCKET_SET_MIXER_ONLINE, {
            mixerOnline: state,
        })
    }

    pingMixerCommand() {
        this.mixerProtocol.pingCommand.map((command) => {
            let hexArray = command.mixerMessage.split(' ')
            let buf = new Buffer(
                hexArray.map((val: string) => {
                    return parseInt(val, 16)
                })
            )
            this.mixerConnection.write(buf)
            logger.verbose('WRITING PING TO MIXER')
        })
    }

    sendOutMessage(
        mixerMessage: string,
        channel: number,
        value: string | number
    ) {
        let channelVal: number
        let channelTypeIndex =
            state.channels[0].channel[channel - 1].channelTypeIndex

        channelVal = 160 + channelTypeIndex + 1

        let channelByte = new Uint8Array([channelVal & 0x000000ff])

        let BERwriter = new BER.Writer()
        if (typeof value === 'number') {
            BERwriter.startSequence()
            BERwriter.writeReal(Math.floor(value))
            BERwriter.endSequence()
        } else {
            BERwriter.startSequence()
            BERwriter.writeString(value)
            BERwriter.endSequence()
        }

        let bufferString: string = ''
        BERwriter.buffer.forEach((element: any) => {
            bufferString += ('0' + element.toString(16)).slice(-2) + ' '
        })
        mixerMessage = mixerMessage.replace(
            '{channel}',
            ('0' + channelByte[0].toString(16)).slice(-2)
        )
        mixerMessage = mixerMessage.replace(
            '{argument}',
            (bufferString + '00 00 00 00 00').slice(3, 35)
        )

        let hexArray = mixerMessage.split(' ')
        let buf = new Buffer(
            hexArray.map((val: string) => {
                return parseInt(val, 16)
            })
        )
        this.mixerConnection.write(buf)
        logger.verbose('Send HEX: ' + mixerMessage)
    }

    sendOutLevelMessage(channel: number, value: number) {
        let levelMessage: string
        let channelVal: number
        let channelType = state.channels[0].channel[channel - 1].channelType
        let channelTypeIndex =
            state.channels[0].channel[channel - 1].channelTypeIndex

        levelMessage = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_OUT_GAIN[0].mixerMessage
        channelVal = 160 + channelTypeIndex + 1

        let channelByte = new Uint8Array([channelVal & 0x000000ff])

        logger.verbose('Fader value : ' + Math.floor(value))
        let BERwriter = new BER.Writer()

        BERwriter.startSequence()
        BERwriter.writeReal(Math.floor(value))
        BERwriter.endSequence()

        let bufferString: string = ''
        BERwriter.buffer.forEach((element: any) => {
            bufferString += ('0' + element.toString(16)).slice(-2) + ' '
        })
        levelMessage = levelMessage.replace(
            '{channel}',
            ('0' + channelByte[0].toString(16)).slice(-2)
        )
        levelMessage = levelMessage.replace(
            '{level}',
            (bufferString + '00 00 00 00 00').slice(3, 35)
        )

        let hexArray = levelMessage.split(' ')
        let buf = new Buffer(
            hexArray.map((val: string) => {
                return parseInt(val, 16)
            })
        )
        this.mixerConnection.write(buf)
        logger.verbose('Send HEX: ' + levelMessage)
    }

    sendOutRequest(mixerMessage: string, channel: number) {
        return
    }

    updateOutLevel(channelIndex: number) {
        let outputlevel = state.channels[0].channel[channelIndex].outputLevel
        let level = 40 * Math.log((1.14 * outputlevel) / 0.88)
        if (level < -90) {
            level = -90
        }
        // console.log('Log level :', level)

        this.sendOutLevelMessage(channelIndex + 1, level)
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let level = 40 * Math.log((1.14 * outputLevel) / 0.88)
        if (level < -90) {
            level = -90
        }
        // console.log('Log level :', level)

        this.sendOutLevelMessage(channelIndex + 1, level)
    }

    updatePflState(channelIndex: number) {
        return
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        let channelType = state.channels[0].channel[channelIndex].channelType
        let channelTypeIndex =
            state.channels[0].channel[channelIndex].channelTypeIndex
        if (muteOn === true) {
            let mute = this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_MUTE_ON[0]
            this.sendOutMessage(
                mute.mixerMessage,
                channelTypeIndex + 1,
                mute.value
            )
        } else {
            let mute = this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_MUTE_OFF[0]
            this.sendOutMessage(
                mute.mixerMessage,
                channelTypeIndex + 1,
                mute.value
            )
        }
    }

    updateNextAux(channelIndex: number, level: number) {
        this.updateAuxLevel(
            channelIndex,
            state.settings[0].nextSendAux - 1,
            level
        )
    }

    updateThreshold(channelIndex: number, level: number) {
        return true
    }
    updateRatio(channelIndex: number, level: number) {
        return true
    }
    updateDelayTime(channelIndex: number, level: number) {
        return true
    }
    updateLow(channelIndex: number, level: number) {
        return true
    }
    updateLoMid(channelIndex: number, level: number) {
        return true
    }
    updateMid(channelIndex: number, level: number) {
        return true
    }
    updateHigh(channelIndex: number, level: number) {
        return true
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType
        let channel =
            state.channels[0].channel[channelIndex].channelTypeIndex + 1
        let auxSendCmd = this.mixerProtocol.channelTypes[channelType].toMixer
            .AUX_LEVEL[0]
        let auxSendNumber = 160 + auxSendIndex + 1

        let auxByte = new Uint8Array([auxSendNumber & 0x000000ff])
        let message = auxSendCmd.mixerMessage.replace(
            '{aux}',
            ('0' + auxByte[0].toString(16)).slice(-2)
        )

        level = 40 * Math.log((1.14 * level) / 0.88)
        if (level < -80) {
            level = -90
        }
        //level = level * (auxSendCmd.max - auxSendCmd.min) + auxSendCmd.min

        this.sendOutMessage(message, channel, level)
    }

    updateChannelName(channelIndex: number) {
        return
    }

    injectCommand(command: string[]) {
        return true
    }
}
