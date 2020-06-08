//@ts-ignore
import { EmberClient } from 'node-emberplus'
import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import { SET_FADER_LEVEL, SET_CHANNEL_LABEL } from '../../reducers/faderActions'
import { logger } from '../logger'

export class EmberMixerConnection {
    mixerProtocol: IMixerProtocol
    emberConnection: EmberClient
    deviceRoot: any
    emberNodeObject: Array<any>

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.emberNodeObject = new Array(200)
        this.mixerProtocol = mixerProtocol

        logger.info('Setting up Ember connection')
        this.emberConnection = new EmberClient(
            state.settings[0].deviceIp,
            state.settings[0].devicePort
        )

        this.emberConnection.on('error', (error: any) => {
            if (
                (error.message + '').match(/econnrefused/i) ||
                (error.message + '').match(/disconnected/i)
            ) {
                logger.error('Ember connection not establised')
            } else {
                logger.error('Ember connection unknown error' + error.message)
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
                console.log('Getting Directory')
                return this.emberConnection.getDirectory()
            })
            .then((r: any) => {
                console.log('Directory :', r)
                this.deviceRoot = r
                this.emberConnection.expand(r.elements[0]).then(() => {
                    this.setupMixerConnection()
                })
            })
            .catch((e: any) => {
                console.log(e.stack)
            })
    }

    setupMixerConnection() {
        logger.info(
            'Ember connection established - setting up subscription of channels'
        )

        let ch: number = 1
        state.settings[0].numberOfChannelsInType.forEach(
            (numberOfChannels, typeIndex) => {
                for (
                    let channelTypeIndex = 0;
                    channelTypeIndex < numberOfChannels;
                    channelTypeIndex++
                ) {
                    this.subscribeFaderLevel(ch, typeIndex, channelTypeIndex)
                    ch++
                }
            }
        )
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
                logger.info('Subscription of channel : ' + command)
                this.emberNodeObject[ch - 1] = node
                this.emberConnection.subscribe(node, () => {
                    logger.verbose('Receiving Level from Ch ' + String(ch))
                    if (
                        !state.channels[0].channel[ch - 1].fadeActive &&
                        !state.channels[0].channel[ch - 1].fadeActive &&
                        node.contents.value >
                            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                                .CHANNEL_OUT_GAIN[0].min
                    ) {
                        store.dispatch({
                            type: SET_FADER_LEVEL,
                            channel: ch - 1,
                            level: node.contents.value,
                        })
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
                    store.dispatch({
                        type: SET_CHANNEL_LABEL,
                        channel: ch - 1,
                        level: node.contents.value,
                    })
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

        this.emberConnection
            .getElementByPath(message)
            .then((element: any) => {
                logger.verbose('Sending out message : ' + message)
                this.emberConnection.setValue(
                    this.emberNodeObject[channel - 1],
                    typeof value === 'number' ? value : parseFloat(value)
                )
            })
            .catch((error: any) => {
                console.log('Ember Error ', error)
            })
    }

    sendOutLevelMessage(channel: number, value: number) {
        logger.verbose(
            'Sending out Level: ' +
                String(value) +
                ' To Path : ' +
                JSON.stringify(this.emberNodeObject[channel])
        )
        this.emberConnection
            .setValueNoAck(this.emberNodeObject[channel - 1], value)
            .catch((error: any) => {
                console.log('Ember Error ', error)
            })
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
        let channelType = state.channels[0].channel[channelIndex].channelType
        let channelTypeIndex =
            state.channels[0].channel[channelIndex].channelTypeIndex
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_OUT_GAIN[0]
        let level =
            (state.channels[0].channel[channelIndex].outputLevel -
                protocol.min) *
            (protocol.max - protocol.min)
        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType
        let channelTypeIndex =
            state.channels[0].channel[channelIndex].channelTypeIndex
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_OUT_GAIN[0]
        let level = (outputLevel - protocol.min) * (protocol.max - protocol.min)

        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    updatePflState(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType
        let channelTypeIndex =
            state.channels[0].channel[channelIndex].channelTypeIndex

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
        return true
    }

    updateChannelName(channelIndex: number) {
        let channelType = state.channels[0].channel[channelIndex].channelType
        let channelTypeIndex =
            state.channels[0].channel[channelIndex].channelTypeIndex
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
