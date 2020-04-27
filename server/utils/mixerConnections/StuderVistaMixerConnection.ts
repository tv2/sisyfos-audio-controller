//@ts-ignore
import { BER } from 'node-emberplus'
import { state } from '../../reducers/store'
const net = require('net')

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import { logger } from '../logger'

export class StuderVistaMixerConnection {
    mixerProtocol: IMixerProtocol
    deviceRoot: any
    emberNodeObject: Array<any>
    socket: any

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.emberNodeObject = new Array(200)
        this.mixerProtocol = mixerProtocol

        logger.info('Setting up Ember connection')

        this.socket = net.createConnection(
            {
                port: 8087,
                host: '10.225.15.196',
                timeout: 20000000,
            },
            () => {}
        )
        this.socket
            .on('data', (data: any) => {
                // A 2 way respons is to be implemented
                logger.verbose('Ember Server data recieved')
            })
            .on('end', () => {
                // When connection disconnected.
                logger.info('Ember Client socket disconnect. ')
            })
            .on('error', (err: any) => {
                logger.error(JSON.stringify(err))
            })
            .on('connect', () => {
                this.setupMixerConnection()
            })
    }

    setupMixerConnection() {
        logger.info('Ember connection established')

        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            let emberTimer = setInterval(() => {
                this.pingMixerCommand()
            }, this.mixerProtocol.pingTime)
        }
    }

    subscribeFaderLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        return
    }

    subscribeChannelName(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        return
    }

    pingMixerCommand() {
        this.mixerProtocol.pingCommand.map((command) => {
            let hexArray = command.mixerMessage.split(' ')
            let buf = new Buffer(
                hexArray.map((val: string) => {
                    return parseInt(val, 16)
                })
            )
            this.socket.write(buf)
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
        this.socket.write(buf)
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
        this.socket.write(buf)
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
