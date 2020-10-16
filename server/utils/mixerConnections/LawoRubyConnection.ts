import { EmberClient, Model } from 'emberplus-connection'
import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'

//Utils:
import { IMixerProtocol } from '../../constants/MixerProtocolInterface'
import {
    SET_INPUT_SELECTOR,
    storeFaderLevel,
    storeInputGain,
    storeFaderLabel,
    storeChannelDisabled,
    storeSetAMix,
    storeCapability,
} from '../../reducers/faderActions'
import { logger } from '../logger'
import { storeSetMixerOnline } from '../../reducers/settingsActions'

// TODO - should these be util functions?
export function floatToDB(f: number): number {
    if (f >= 0.5) {
        return f * 40 - 30 // max dB value: +10.
    } else if (f >= 0.25) {
        return f * 80 - 50
    } else if (f >= 0.0625) {
        return f * 160 - 70
    } else if (f > 0.0) {
        return f * 480 - 90 // min dB value: -90 or -oo
    } else {
        return -191
    }
}

export function dbToFloat(d: number): number {
    let f: number
    if (d < -60) {
        f = (d + 90) / 480
    } else if (d < -30) {
        f = (d + 70) / 160
    } else if (d < -10) {
        f = (d + 50) / 80
    } else if (d <= 10) {
        f = (d + 30) / 40
    } else {
        f = 1
    }
    return Math.max(0, f)
}

export class LawoRubyMixerConnection {
    mixerProtocol: IMixerProtocol
    mixerIndex: number
    emberConnection: EmberClient
    faders: { [index: number]: string } = {}

    constructor(mixerProtocol: IMixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex

        logger.info('Setting up Ember connection')
        this.emberConnection = new EmberClient(
            state.settings[0].mixers[this.mixerIndex].deviceIp,
            state.settings[0].mixers[this.mixerIndex].devicePort
        )

        store.dispatch(storeSetMixerOnline(false))

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
            store.dispatch(storeSetMixerOnline(false))
        })
        this.emberConnection.on('connected', () => {
            logger.info('Connected to Ember device')
            store.dispatch(storeSetMixerOnline(true))
        })

        logger.info('Connecting to Ember')
        this.emberConnection
            .connect()
            .then(async () => {
                logger.debug('Getting Directory')
                const req = await this.emberConnection.getDirectory(
                    this.emberConnection.tree
                )
                const r = await req.response

                logger.debug('Directory :', r)
                this.setupMixerConnection()
            })
            .then((r: any) => {})
            .catch((e: any) => {
                logger.debug(e.stack)
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
                }
            }
        }

        // Set channel labels
        state.settings[0].mixers[
            this.mixerIndex
        ].numberOfChannelsInType.forEach(
            async (numberOfChannels, typeIndex) => {
                for (
                    let channelTypeIndex = 0;
                    channelTypeIndex < numberOfChannels;
                    channelTypeIndex++
                ) {
                    if (this.faders[channelTypeIndex + 1]) {
                        // enable
                        store.dispatch(
                            storeFaderLabel(
                                channelTypeIndex,
                                this.faders[channelTypeIndex + 1]
                            )
                        )
                        store.dispatch(
                            storeChannelDisabled(channelTypeIndex, false)
                        )
                    } else {
                        // disable
                        store.dispatch(
                            storeChannelDisabled(channelTypeIndex, true)
                        )
                        store.dispatch(storeFaderLabel(channelTypeIndex, ''))
                    }
                }
            }
        )

        let ch: number = 1
        for (const typeIndex in state.settings[0].mixers[this.mixerIndex]
            .numberOfChannelsInType) {
            const numberOfChannels =
                state.settings[0].mixers[this.mixerIndex]
                    .numberOfChannelsInType[typeIndex]
            for (
                let channelTypeIndex = 0;
                channelTypeIndex < numberOfChannels;
                channelTypeIndex++
            ) {
                logger.debug('running subscriptions for ' + this.faders[ch])
                try {
                    await this.subscribeFaderLevel(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    await this.subscribeGainLevel(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    await this.subscribeInputSelector(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    await this.subscribeAMixState(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                    ch++
                } catch (e) {
                    logger.error(
                        'error during subscriptions of parameters for ' +
                            this.faders[ch],
                        e
                    )
                }
            }
        }
    }

    async subscribeFaderLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_OUT_GAIN[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )

        try {
            const node = await this.emberConnection.getElementByPath(command)
            if (node.contents.type !== Model.ElementType.Parameter) return

            logger.debug('Subscription of channel level: ' + command)
            this.emberConnection.subscribe(node, () => {
                logger.verbose('Receiving Level from Ch ' + String(ch))
                if (
                    !state.channels[0].chConnection[this.mixerIndex].channel[
                        ch - 1
                    ].fadeActive &&
                    (node.contents as Model.Parameter).value >
                        this.mixerProtocol.channelTypes[typeIndex].fromMixer
                            .CHANNEL_OUT_GAIN[0].min
                ) {
                    store.dispatch(
                        storeFaderLevel(
                            ch - 1,
                            dbToFloat(
                                (node.contents as Model.Parameter)
                                    .value as number
                            )
                        )
                    )
                    global.mainThreadHandler.updatePartialStore(ch - 1)
                    if (remoteConnections) {
                        remoteConnections.updateRemoteFaderState(
                            ch - 1,
                            dbToFloat(
                                (node.contents as Model.Parameter)
                                    .value as number
                            )
                        )
                    }
                }
            })
        } catch (e) {
            logger.debug('error when subscribing to fader level', e)
        }
    }
    async subscribeGainLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        const proto = this.mixerProtocol.channelTypes[typeIndex].fromMixer
            .CHANNEL_INPUT_GAIN[0]
        let command = proto.mixerMessage.replace('{channel}', sourceName)

        try {
            const node = await this.emberConnection.getElementByPath(command)
            if (node.contents.type !== Model.ElementType.Parameter) return

            logger.debug('Subscription of channel gain: ' + command)
            this.emberConnection.subscribe(node, () => {
                logger.verbose('Receiving Gain from Ch ' + String(ch))
                const value = (node.contents as Model.Parameter).value as number
                const level = (value - proto.min) / (proto.max - proto.min)
                if ((node.contents as Model.Parameter).value > proto.min) {
                    store.dispatch(storeInputGain(ch - 1, level))
                    global.mainThreadHandler.updatePartialStore(ch - 1)
                }
            })
        } catch (e) {
            logger.debug('error when subscribing to gain level', e)
        }
    }
    async subscribeInputSelector(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_INPUT_SELECTOR[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )

        try {
            const node = await this.emberConnection.getElementByPath(command)
            console.log('set_cap', ch, 'hasInputSel', true)
            store.dispatch(storeCapability(ch - 1, 'hasInputSelector', true))
            if (node.contents.type !== Model.ElementType.Parameter) {
                return
            }

            logger.debug('Subscription of channel input selector: ' + command)
            this.emberConnection.subscribe(node, () => {
                logger.verbose('Receiving InpSelector from Ch ' + String(ch))
                this.mixerProtocol.channelTypes[
                    typeIndex
                ].fromMixer.CHANNEL_INPUT_SELECTOR.forEach((selector, i) => {
                    if (
                        selector.value ===
                        (node.contents as Model.Parameter).value
                    ) {
                        store.dispatch({
                            type: SET_INPUT_SELECTOR,
                            channel: ch - 1,
                            selected: i + 1,
                        })
                        global.mainThreadHandler.updatePartialStore(ch - 1)
                    }
                })
            })
        } catch (e) {
            if (e.message.match(/could not find node/i)) {
                console.log('set_cap', ch, 'hasInputSel', false)
                store.dispatch(
                    storeCapability(ch - 1, 'hasInputSelector', false)
                )
            }
            logger.debug('error when subscribing to input selector', e)
        }
    }
    async subscribeAMixState(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const sourceName = this.faders[ch]
        if (!sourceName) return

        let command = this.mixerProtocol.channelTypes[
            typeIndex
        ].fromMixer.CHANNEL_AMIX[0].mixerMessage.replace(
            '{channel}',
            sourceName
        )

        try {
            const node = await this.emberConnection.getElementByPath(command)
            console.log('set_cap', ch - 1, 'hasAMix', true)
            store.dispatch(storeCapability(ch - 1, 'hasAMix', true))
            if (node.contents.type !== Model.ElementType.Parameter) {
                return
            }

            logger.debug('Subscription of AMix state: ' + command)
            this.emberConnection.subscribe(node, () => {
                logger.verbose('Receiving AMix state from Ch ' + String(ch))
                store.dispatch(
                    storeSetAMix(
                        ch - 1,
                        (node.contents as Model.Parameter).value === 1
                    )
                )
                global.mainThreadHandler.updatePartialStore(ch - 1)
            })
        } catch (e) {
            if (e.message.match(/could not find node/i)) {
                console.log('set_cap', ch - 1, 'hasAMix', false)
                store.dispatch(storeCapability(ch - 1, 'hasAMix', false))
            }
            logger.debug('error when subscribing to input selector', e)
        }
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
        value: string | number | boolean,
        type?: string
    ) {
        const channelString = this.faders[channel]

        if (!channelString) return

        let message = mixerMessage.replace('{channel}', channelString)

        this.emberConnection
            .getElementByPath(message)
            .then((element: any) => {
                logger.verbose('Sending out message : ' + message)
                this.emberConnection.setValue(
                    element,
                    typeof value === 'string' ? parseFloat(value) : value
                )
            })
            .catch((error: any) => {
                logger.error('Ember Error ', error)
            })
    }

    sendOutLevelMessage(channel: number, value: number) {
        const source = this.faders[channel]
        if (!channel) return

        const mixerMessage = this.mixerProtocol.channelTypes[0].toMixer
            .CHANNEL_OUT_GAIN[0].mixerMessage

        logger.verbose('Sending out Level: ' + String(value) + ' To ' + source)

        this.sendOutMessage(mixerMessage, channel, value)
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
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_OUT_GAIN[0]
        let level =
            (state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel -
                protocol.min) *
            (protocol.max - protocol.min)
        this.sendOutLevelMessage(channelTypeIndex + 1, level)
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
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_OUT_GAIN[0]

        const level = floatToDB(outputLevel)

        this.sendOutLevelMessage(channelTypeIndex + 1, level)
    }

    async updatePflState(channelIndex: number) {
        const channel =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex

        // fetch source name and function node
        const fader = this.faders[channelTypeIndex + 1]
        const fn = (await this.emberConnection.getElementByPath(
            'Ruby.Functions.SetPFLState'
        )) as Model.NumberedTreeNode<Model.EmberFunction>

        if (!fader || !fn)
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
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        return true
    }

    updateAMixState(channelIndex: number, amixOn: boolean) {
        const channel =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
            .CHANNEL_AMIX[0]

        this.sendOutMessage(
            protocol.mixerMessage,
            channelTypeIndex + 1,
            amixOn,
            ''
        )
    }

    updateNextAux(channelIndex: number, level: number) {
        return true
    }

    updateInputGain(channelIndex: number, gain: number) {
        const channel =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ]
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
        logger.debug('input select', channelIndex, inputSelected)
        const channel =
            state.channels[0].chConnection[this.mixerIndex].channel[
                channelIndex
            ]
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
