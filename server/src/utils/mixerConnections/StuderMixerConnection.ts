//@ts-ignore
import { EmberClient } from 'node-emberplus'
import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'

//Utils:
import {
    fxParamsList,
    IMixerProtocol,
} from '../../../../shared/src/constants/MixerProtocolInterface'
import { storeFaderLevel } from '../../../../shared/src/actions/faderActions'
import { logger } from '../logger'
import { storeSetChLabel } from '../../../../shared/src/actions/channelActions'

export class StuderMixerConnection {
    mixerProtocol: IMixerProtocol
    mixerIndex: number
    emberConnection: any
    deviceRoot: any
    emberNodeObject: Array<any>

    constructor(mixerProtocol: IMixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.emberNodeObject = new Array(200)
        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex

        logger.info('Setting up Ember connection')
        this.emberConnection = new EmberClient({
            host: state.settings[0].mixers[this.mixerIndex].deviceIp,
            port: state.settings[0].mixers[this.mixerIndex].devicePort,
        })

        this.emberConnection.on('error', (error: any) => {
            if (
                (error.message + '').match(/econnrefused/i) ||
                (error.message + '').match(/disconnected/i)
            ) {
                logger.error('Ember connection not establised')
            } else {
                logger
                    .data(error)
                    .error(`Ember connection unknown error: ${error.message}`)
            }
        })
        this.emberConnection.on('disconnected', () => {
            logger.error('Lost Ember connection')
        })
        logger.info('Connecting to Ember')
        let deviceRoot: any
        this.emberConnection
            .connect()
            .then(() => {
                this.setupMixerConnection()
            })
            .catch((e: any) => {
                logger.error(e.stack)
            })
    }

    setupMixerConnection() {
        logger.info(
            'Ember connection established - setting up subscription of channels'
        )

        let ch: number = 1
        state.settings[0].mixers[
            this.mixerIndex
        ].numberOfChannelsInType.forEach((numberOfChannels, typeIndex) => {
            for (
                let channelTypeIndex = 0;
                channelTypeIndex < numberOfChannels;
                channelTypeIndex++
            ) {
                this.subscribeFaderLevel(ch, typeIndex, channelTypeIndex)
                ch++
            }
        })
        /*
                .CHANNEL_VU)){
                    store.dispatch({
                        type:SET_VU_LEVEL,
                        channel: ch - 1,
                        level: message.args[0]
                    });
        */

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
        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.replace(
            '{channel}',
            String(channelTypeIndex + 1)
        )
        this.emberConnection
            .getElementByPath(command)
            .then((node: any) => {
                logger.info(`Subscription of channel: ${command}`)
                this.emberNodeObject[ch - 1] = node
                this.emberConnection.subscribe(node, () => {
                    logger.trace(`Receiving Level from Ch ${ch}`)
                    if (
                        !state.channels[0].chMixerConnection[this.mixerIndex]
                            .channel[ch - 1].fadeActive &&
                        !state.channels[0].chMixerConnection[this.mixerIndex]
                            .channel[ch - 1].fadeActive &&
                        node.contents.value >
                            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                                .CHANNEL_OUT_GAIN[0].min
                    ) {
                        store.dispatch(
                            storeFaderLevel(ch - 1, node.contents.value)
                        )
                        global.mainThreadHandler.updatePartialStore(ch - 1)
                        if (remoteConnections) {
                            remoteConnections.updateRemoteFaderState(
                                ch - 1,
                                node.contents.value
                            )
                        }
                    }
                })
            })
            .catch((error: any) => {
                logger.error(error)
            })
    }

    subscribeChannelName(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        this.emberConnection
            .getNodeByPath(
                this.mixerProtocol.channelTypes[
                    typeIndex
                ].fromMixer.CHANNEL_NAME[0].mixerMessage.replace(
                    '{channel}',
                    String(channelTypeIndex + 1)
                )
            )
            .then((node: any) => {
                this.emberConnection.subscribe(node, () => {
                    store.dispatch(
                        storeSetChLabel(
                            this.mixerIndex,
                            ch - 1,
                            node.contents.value
                        )
                    )
                })
            })
    }

    pingMixerCommand() {
        //Ping Ember mixer if mixerProtocol needs it.
        return
        this.mixerProtocol.pingCommand.map((command) => {
            this.sendOutMessage(
                command.mixerMessage,
                0,
                command.value,
                command.type
            )
        })
    }

    sendOutMessage(
        mixerMessage: string,
        channel: number,
        value: string | number,
        type: string
    ) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()

        let message = mixerMessage.replace('{channel}', channelString)

        /*
        this.emberConnection.getElementByPath(message)
        .then((element: any) => {
            logger.trace(`Sending out message: ${message}`)
            this.emberConnection.setValue(
                this.emberNodeObject[channel-1],
                typeof value === 'number' ? value : parseFloat(value)
            )
        })
        .catch((error: any) => {
            logger.data(error).error("Ember Error")
        })
        */
    }

    sendOutLevelMessage(channel: number, value: number) {
        let levelMessage: string
        let channelVal: number
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channel - 1
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channel - 1
            ].channelTypeIndex

        if (channel < 25) {
            levelMessage =
                this.mixerProtocol.channelTypes[channelType].toMixer
                    .CHANNEL_OUT_GAIN[0].mixerMessage
            channelVal = 160 + channelTypeIndex + 1
        } else {
            levelMessage =
                this.mixerProtocol.channelTypes[channelType].toMixer
                    .CHANNEL_OUT_GAIN[1].mixerMessage
            channelVal = channelTypeIndex + 1
        }

        let valueNumber = value
        let valueByte = new Uint8Array([
            (valueNumber & 0x0000ff00) >> 8,
            valueNumber & 0x000000ff,
        ])
        let channelByte = new Uint8Array([channelVal & 0x000000ff])

        levelMessage = levelMessage.replace(
            '{channel}',
            ('0' + channelByte[0].toString(16)).slice(-2)
        )
        levelMessage = levelMessage.replace(
            '{level}',
            ('0' + valueByte[0].toString(16)).slice(-2) +
                ' ' +
                ('0' + valueByte[1].toString(16)).slice(-2)
        )

        let hexArray = levelMessage.split(' ')
        let buf = Buffer.from(
            hexArray.map((val: string) => {
                return parseInt(val, 16)
            })
        )
        this.emberConnection._client.socket.write(buf)
        logger.trace(`Send HEX: ${levelMessage}`)
    }

    sendOutRequest(mixerMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        let message = mixerMessage.replace('{channel}', channelString)
        if (message != 'none') {
            /*
            this.oscConnection.send({
                address: message
            });
*/
        }
    }

    updateOutLevel(channelIndex: number) {
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let outputlevel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel
        let level = 20 * Math.log((1.3 * outputlevel) / 0.775)
        if (level < -90) {
            level = -90
        }
        // logger.debug(`Log level: ${level}`)

        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let level = 20 * Math.log((1.3 * outputLevel) / 0.775)
        if (level < -90) {
            level = -90
        }
        // logger.debug(`Log level: ${level}`)

        this.sendOutLevelMessage(channelTypeIndex + 1, level)
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
        return true
    }

    updateNextAux(channelIndex: number, level: number) {
        return true
    }

    updateInputGain(channelIndex: number, level: number) {
        return true
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        return true
    }

    updateFx(fxParam: fxParamsList, channelIndex: number, level: number) {
        return true
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        return true
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
            'string'
        )
    }

    loadMixerPreset(presetName: string) {}

    injectCommand(command: string[]) {
        return true
    }
}
