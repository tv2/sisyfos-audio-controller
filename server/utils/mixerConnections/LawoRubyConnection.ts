//@ts-ignore
import { EmberClient, Model, Types } from 'emberplus-connection'
import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import {
    SET_FADER_LEVEL,
    SET_CHANNEL_LABEL,
    SET_CHANNEL_DISABLED,
} from '../../reducers/faderActions'
import { logger } from '../logger'
import { SET_MIXER_ONLINE } from '../../reducers/settingsActions'

export class LawoRubyMixerConnection {
    mixerProtocol: IMixerProtocol
    emberConnection: EmberClient
    deviceRoot: any
    faders: { [index: number]: string } = {}

    constructor(mixerProtocol: IMixerProtocol) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.mixerProtocol = mixerProtocol

        logger.info('Setting up Ember connection')
        this.emberConnection = new EmberClient(
            state.settings[0].deviceIp,
            state.settings[0].devicePort
        )

        store.dispatch({
            type: SET_MIXER_ONLINE,
            mixerOnline: false,
        })

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
            store.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: false,
            })
        })
        this.emberConnection.on('connected', () => {
            logger.error('Connected to Ember device')
            store.dispatch({
                type: SET_MIXER_ONLINE,
                mixerOnline: true,
            })
        })

        logger.info('Connecting to Ember')
        this.emberConnection
            .connect()
            .then(async () => {
                console.log('Getting Directory')
                const req = await this.emberConnection.getDirectory(
                    this.emberConnection.tree
                )
                const r = await req.response

                console.log('Directory :', r)
                this.setupMixerConnection()
            })
            .then((r: any) => {})
            .catch((e: any) => {
                console.log(e.stack)
            })
    }

    async setupMixerConnection() {
        logger.info(
            'Ember connection established - setting up subscription of channels'
        )

        // get the node that contains the sources
        const sourceNode = await this.emberConnection.getElementByPath(
            'Ruby.Sources'
        )
        // get the sources
        const req = await this.emberConnection.getDirectory(sourceNode)
        const sources = await req.response

        // map sourceNames to their fader number
        if ('children' in sources) {
            for (const [_i, child] of Object.entries(sources.children)) {
                if (
                    child.contents.type === Model.ElementType.Node &&
                    child.contents.identifier
                ) {
                    const name = child.contents.identifier
                    const fader = await this.emberConnection.getElementByPath(
                        `Ruby.Sources.${name}.Fader.Number`
                    )
                    this.faders[
                        (fader.contents as Model.Parameter).value as number
                    ] = name

                    store.dispatch({
                        type: SET_CHANNEL_LABEL,
                        label: name,
                    })
                }
            }
        }

        // Set channel labels
        state.settings[0].numberOfChannelsInType.forEach(
            async (numberOfChannels, typeIndex) => {
                for (
                    let channelTypeIndex = 0;
                    channelTypeIndex < numberOfChannels;
                    channelTypeIndex++
                ) {
                    if (this.faders[channelTypeIndex + 1]) {
                        // enable
                        store.dispatch({
                            type: SET_CHANNEL_LABEL,
                            channel: channelTypeIndex,
                            label: this.faders[channelTypeIndex + 1],
                        })
                        store.dispatch({
                            type: SET_CHANNEL_DISABLED,
                            channel: channelTypeIndex,
                            disabled: false,
                        })
                    } else {
                        // disable
                        store.dispatch({
                            type: SET_CHANNEL_DISABLED,
                            channel: channelTypeIndex,
                            disabled: true,
                        })
                        store.dispatch({
                            type: SET_CHANNEL_LABEL,
                            channel: channelTypeIndex,
                            label: '',
                        })
                    }
                }
            }
        )

        let ch: number = 1
        state.settings[0].numberOfChannelsInType.forEach(
            async (numberOfChannels, typeIndex) => {
                for (
                    let channelTypeIndex = 0;
                    channelTypeIndex < numberOfChannels;
                    channelTypeIndex++
                ) {
                    try {
                        await this.subscribeFaderLevel(
                            ch,
                            typeIndex,
                            channelTypeIndex
                        )
                        ch++
                    } catch (e) {
                        console.log(e)
                    }
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

    async subscribeFaderLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!ch) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )
        const node = await this.emberConnection.getElementByPath(command)
        if (node.contents.type !== Model.ElementType.Parameter) return

        logger.info('Subscription of channel : ' + command)
        this.emberConnection.subscribe(node, () => {
            logger.verbose('Receiving Level from Ch ' + String(ch))
            if (
                !state.channels[0].channel[ch - 1].fadeActive &&
                !state.channels[0].channel[ch - 1].fadeActive &&
                (node.contents as Model.Parameter).value >
                    this.mixerProtocol.channelTypes[typeIndex].fromMixer
                        .CHANNEL_OUT_GAIN[0].min
            ) {
                store.dispatch({
                    type: SET_FADER_LEVEL,
                    channel: ch - 1,
                    level: (node.contents as Model.Parameter).value,
                })
                global.mainThreadHandler.updatePartialStore(ch - 1)
                if (remoteConnections) {
                    remoteConnections.updateRemoteFaderState(
                        ch - 1,
                        (node.contents as Model.Parameter).value as number
                    )
                }
            }
        })
    }

    subscribeChannelName() {
        return true
    }

    pingMixerCommand() {
        return true
    }

    sendOutMessage(
        mixerMessage: string,
        channel: number,
        value: string | number,
        type?: string
    ) {
        // let channelString = this.mixerProtocol.leadingZeros
        //     ? ('0' + channel).slice(-2)
        //     : channel.toString()
        const channelString = this.faders[channel]

        let message = mixerMessage.replace('{channel}', channelString)
        // console.log(message, value)

        this.emberConnection
            .getElementByPath(message)
            .then((element: any) => {
                logger.verbose('Sending out message : ' + message)
                this.emberConnection.setValue(
                    element,
                    typeof value === 'number' ? value : parseFloat(value)
                )
            })
            .catch((error: any) => {
                console.log('Ember Error ', error)
            })
    }

    sendOutLevelMessage(channel: number, value: number) {
        const source = this.faders[channel]
        if (!channel) return

        const mixerMessage = this.mixerProtocol.channelTypes[0].toMixer
            .CHANNEL_OUT_GAIN[0].mixerMessage

        logger.verbose(
            'Sending out Level: ' + String(value) + ' To ' + source
            // JSON.stringify(this.emberNodeObject[channel])
        )
        console.log('level', channel - 1, source, value)
        // this.emberConnection
        //     .setValue(this.emberNodeObject[channel - 1], value, false)
        //     .catch((error: any) => {
        //         console.log('Ember Error ', error)
        //     })
        this.sendOutMessage(mixerMessage, channel, value)
    }

    sendOutRequest(mixerMessage: string, channel: number) {
        // let channelString = this.mixerProtocol.leadingZeros
        //     ? ('0' + channel).slice(-2)
        //     : channel.toString()
        const channelString = this.faders[channel]
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

        // let level = outputLevel < 0.5 ?
        //     outputLevel * 2 * (-9 - protocol.min) + protocol.min :
        //     (outputLevel - .5) * 2 * (protocol.max - -9) + -9

        // fitted curve to 0 = 0; 0.5 = -27; 0.75 = 0; 1 = 9
        const level =
            170.67 * Math.pow(outputLevel, 4) +
            -234.67 * Math.pow(outputLevel, 3) +
            -202.67 * Math.pow(outputLevel, 2) +
            466.67 * outputLevel +
            -191
        // fitted curve to 0 = 0; 0.5 = -9; 0.75 = 0; 1 = 9
        // const level =
        //     437.33 * Math.pow(outputLevel, 3) -
        //     984 * Math.pow(outputLevel, 2) +
        //     746.67 * outputLevel -
        //     191
        console.log(outputLevel, level)

        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    async updatePflState(channelIndex: number) {
        const channel = state.channels[0].channel[channelIndex]
        let channelType = channel.channelType
        let channelTypeIndex =
            state.channels[0].channel[channelIndex].channelTypeIndex

        // gotta get the label and function:
        const fader = this.faders[channelTypeIndex]
        const fn = (await this.emberConnection.getElementByPath(
            'Ruby.Functions.SetPFLState'
        )) as Model.NumberedTreeNode<Model.EmberFunction>

        if (fader || !fn)
            throw new Error(
                'Oops could not find node or function to update PFL state'
            )

        this.emberConnection.invoke(
            fn,
            {
                value: fader,
                type: Model.ParameterType.String,
            },
            {
                value: state.faders[0].fader[channelIndex].pflOn,
                type: Model.ParameterType.Boolean,
            }
        )

        // if (state.faders[0].fader[channelIndex].pflOn === true) {
        //     this.sendOutMessage(
        //         this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
        //             .mixerMessage,
        //         channelTypeIndex + 1,
        //         this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
        //             .value,
        //         this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
        //             .type
        //     )
        // } else {
        //     this.sendOutMessage(
        //         this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
        //             .mixerMessage,
        //         channelTypeIndex + 1,
        //         this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
        //             .value,
        //         this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
        //             .type
        //     )
        // }
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        return true
    }

    updateNextAux(channelIndex: number, level: number) {
        return true
    }

    updateInputGain(channelIndex: number, gain: number) {
        const channel = state.channels[0].channel[channelIndex]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_INPUT_GAIN[0]

        let level = gain * (protocol.max - protocol.min) + protocol.min

        this.sendOutMessage(
            protocol.mixerMessage,
            channelTypeIndex + 1,
            level,
            ''
        )
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        console.log('input select', channelIndex, inputSelected)
        const channel = state.channels[0].channel[channelIndex]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let msg = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_INPUT_SELECTOR[inputSelected - 1]

        this.sendOutMessage(
            msg.mixerMessage,
            channelTypeIndex + 1,
            msg.value,
            ''
        )
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
        return true
    }

    loadMixerPreset(presetName: string) {}

    injectCommand(command: string[]) {
        return true
    }
}
