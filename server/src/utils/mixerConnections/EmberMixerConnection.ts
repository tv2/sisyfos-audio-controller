import { EmberClient, Model, Types } from 'emberplus-connection'
import { store, state } from '../../reducers/store'
import { remoteConnections } from '../../mainClasses'
import path from 'path'
import fs from 'fs'

//Utils:
import {
    fxParamsList,
    IMixerProtocol,
} from '../../../../shared/src/constants/MixerProtocolInterface'
import {
    storeFaderLevel,
    storeInputGain,
    storeSetPgm,
    storeSetPfl,
    storeShowChannel,
    storeSetAMix,
    storeCapability,
    storeInputSelector,
} from '../../../../shared/src/actions/faderActions'
import { logger } from '../logger'
import { LawoMC2 } from '../../../../shared/src/constants/mixerProtocols/LawoMC2'
import { dbToFloat, floatToDB } from './LawoRubyConnection'
import {
    SET_OUTPUT_LEVEL,
    storeSetChLabel,
} from '../../../../shared/src/actions/channelActions'
import { storeSetMixerOnline } from '../../../../shared/src/actions/settingsActions'

export class EmberMixerConnection {
    mixerProtocol: IMixerProtocol
    mixerIndex: number
    emberConnection: EmberClient
    deviceRoot: any
    emberNodeObject: Array<any>
    isSubscribedToChannel: Array<boolean> = []

    constructor(mixerProtocol: IMixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        this.emberNodeObject = new Array(200)
        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex

        this.setupEmberSocket()
    }

    setupEmberSocket() {
        logger.info('Setting up new Ember connection')
        this.emberConnection = new EmberClient(
            state.settings[0].mixers[this.mixerIndex].deviceIp,
            state.settings[0].mixers[this.mixerIndex].devicePort
        )

        this.emberConnection.on('error', (error: any) => {
            if (
                (error.message + '').match(/econnrefused/i) ||
                (error.message + '').match(/disconnected/i)
            ) {
                logger.error('Ember connection not establised')
            } else {
                logger.data(error).error('Ember connection unknown error')
            }
        })
        this.emberConnection.on('disconnected', () => {
            logger.error('Lost Ember connection')

            store.dispatch(storeSetMixerOnline(this.mixerIndex, false))
            global.mainThreadHandler.updateMixerOnline(this.mixerIndex)

            this.emberNodeObject = []
            this.isSubscribedToChannel = []
            this.emberConnection.tree = []
            // this.emberConnection.discard()
            // delete this.emberConnection
            // this.setupEmberSocket()
        })
        this.emberConnection.on('connected', async () => {
            logger.info('Found Ember connection')

            store.dispatch(storeSetMixerOnline(this.mixerIndex, true))
            global.mainThreadHandler.updateMixerOnline(this.mixerIndex)

            const req = await this.emberConnection.getDirectory(
                this.emberConnection.tree
            )

            await req.response

            this.setupMixerConnection()
        })
        logger.info('Connecting to Ember')
        this.emberConnection.connect()
    }

    async setupMixerConnection() {
        logger.info(
            'Ember connection established - setting up subscription of channels'
        )

        let ch: number = 1
        for (const [typeIndex, numberOfChannels] of Object.entries(
            state.settings[0].mixers[this.mixerIndex].numberOfChannelsInType
        )) {
            for (
                let channelTypeIndex = 0;
                channelTypeIndex < numberOfChannels;
                channelTypeIndex++
            ) {
                if (this.mixerProtocol.label === LawoMC2.label) {
                    await this.subscribeToMc2ChannelOnline(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                } else {
                    await this.setupFaderSubscriptions(
                        ch,
                        Number(typeIndex),
                        channelTypeIndex
                    )
                }

                ch++
            }
        }
    }

    async setupFaderSubscriptions(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const protocol =
            this.mixerProtocol.channelTypes[Number(typeIndex)].fromMixer

        await this.subscribeFaderLevel(ch, Number(typeIndex), channelTypeIndex)

        if (protocol.CHANNEL_NAME)
            await this.subscribeChannelName(
                ch,
                Number(typeIndex),
                channelTypeIndex
            )

        if (protocol.PFL)
            await this.subscribeChannelPFL(
                ch,
                Number(typeIndex),
                channelTypeIndex
            )

        if (protocol.CHANNEL_AMIX)
            await this.subscribeAMix(ch, Number(typeIndex), channelTypeIndex)

        if (protocol.CHANNEL_INPUT_GAIN)
            await this.subscribeChannelInputGain(
                ch,
                Number(typeIndex),
                channelTypeIndex
            )

        if (protocol.CHANNEL_INPUT_SELECTOR) {
            if (this.mixerProtocol.label === LawoMC2.label) {
                await this.subscribeToMc2InputSelector(
                    ch,
                    Number(typeIndex),
                    channelTypeIndex
                )
            } else {
                await this.subscribeChannelInputSelector(
                    ch,
                    Number(typeIndex),
                    channelTypeIndex
                )
            }
        }
    }

    async subscribeToMc2ChannelOnline(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const mixerMessage = 'Channels.Inputs.${channel}.Fader'
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]

        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            async (node: Model.NumberedTreeNode<Model.EmberNode>) => {
                if (node.contents.isOnline) {
                    logger.info(`Channel ${ch} online`)
                    if (!this.isSubscribedToChannel[ch - 1]) {
                        this.isSubscribedToChannel[ch - 1] = true
                        await this.setupFaderSubscriptions(
                            ch,
                            typeIndex,
                            channelTypeIndex
                        )
                    }
                    store.dispatch(
                        storeShowChannel(channel.assignedFader, true)
                    )
                    global.mainThreadHandler.updatePartialStore(
                        channel.assignedFader
                    )
                } else {
                    logger.info(`Channel ${ch} offline`)
                    store.dispatch(
                        storeShowChannel(channel.assignedFader, false)
                    )
                    global.mainThreadHandler.updatePartialStore(
                        channel.assignedFader
                    )
                }
            }
        )
    }

    async subscribeToEmberNode(
        channelTypeIndex: number,
        mixerMessage: string,
        cb: (node: Model.TreeElement<Model.EmberElement>) => void
    ) {
        const channelName = this._insertChannelName(
            mixerMessage,
            String(channelTypeIndex + 1)
        )
        logger.trace(`Subscribe to ${channelName}`)
        try {
            const node = await this.emberConnection.getElementByPath(
                this._insertChannelName(
                    mixerMessage,
                    String(channelTypeIndex + 1)
                )
            )
            if (!node) return

            await this.emberConnection.subscribe(node, cb)

            cb(node)
        } catch (e) {
            logger.data(e).debug('Error when subscribing to fader label')
        }
    }

    async subscribeFaderLevel(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        let mixerMessage = this._insertChannelName(
            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage,
            String(channelTypeIndex + 1)
        )

        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            (node) => {
                const parameter = node.contents as Model.Parameter
                const val = (parameter.value as number) / parameter.factor
                const level = this._faderLevelToFloat(val, typeIndex)
                const channel =
                    state.channels[0].chMixerConnection[this.mixerIndex]
                        .channel[ch - 1]

                logger.trace(
                    `Receiving Level from Ch "${ch}", val: ${val}, level: ${level}`
                )

                if (!channel.fadeActive && level >= 0 && level <= 1) {
                    store.dispatch(
                        storeFaderLevel(channel.assignedFader, level)
                    )
                    store.dispatch({
                        type: SET_OUTPUT_LEVEL,
                        channel: channel.assignedFader,
                        mixerIndex: this.mixerIndex,
                        level,
                    })

                    // toggle pgm based on level
                    logger.trace(`Set Channel ${ch} pgmOn ${level > 0}`)
                    store.dispatch(
                        storeSetPgm(channel.assignedFader, level > 0)
                    )

                    global.mainThreadHandler.updatePartialStore(
                        channel.assignedFader
                    )
                    if (remoteConnections) {
                        remoteConnections.updateRemoteFaderState(
                            channel.assignedFader,
                            level
                        )
                    }
                }
            }
        )
        this.emberNodeObject[ch - 1] =
            await this.emberConnection.getElementByPath(mixerMessage)
    }

    async subscribeChannelName(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const mixerMessage =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_NAME[0]
                .mixerMessage
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]
        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            (node) => {
                if (node.contents.type === Model.ElementType.Node) {
                    logger.trace(
                        `Receiving Label from Ch "${ch}", val: ${node.contents.description}`
                    )
                    store.dispatch(
                        storeSetChLabel(
                            this.mixerIndex,
                            channelTypeIndex,
                            node.contents.description
                        )
                    )
                } else {
                    logger.trace(
                        `Receiving Label from Ch "${ch}", val: ${
                            (node.contents as Model.Parameter).value
                        }`
                    )
                    store.dispatch(
                        storeSetChLabel(
                            this.mixerIndex,
                            channelTypeIndex,
                            String((node.contents as Model.Parameter).value)
                        )
                    )
                }
                global.mainThreadHandler.updatePartialStore(
                    channel.assignedFader
                )
            }
        )
    }

    async subscribeChannelPFL(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const mixerMessage =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer.PFL[0]
                .mixerMessage
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]

        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            (node) => {
                logger.trace(
                    `Receiving PFL from Ch "${ch}", val: ${
                        (node.contents as Model.Parameter).value
                    }`
                )
                store.dispatch(
                    storeSetPfl(
                        channel.assignedFader,
                        (node.contents as Model.Parameter).value as boolean
                    )
                )
                global.mainThreadHandler.updatePartialStore(
                    channel.assignedFader
                )
            }
        )
    }

    async subscribeChannelInputGain(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const mixerMessage =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                .CHANNEL_INPUT_GAIN[0].mixerMessage
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]

        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            (node) => {
                logger.trace(
                    `Receiving input gain from Ch "${ch}", val: ${
                        (node.contents as Model.Parameter).value
                    }`
                )

                let level = (node.contents as Model.Parameter).value
                if (
                    (node.contents as Model.Parameter).factor &&
                    typeof level === 'number'
                ) {
                    level /= (node.contents as Model.Parameter).factor
                }

                // assume it is in db now
                level = this._faderLevelToFloat(Number(level), 0)
                store.dispatch(storeInputGain(channel.assignedFader, level))
                global.mainThreadHandler.updatePartialStore(
                    channel.assignedFader
                )
            }
        )
    }

    async subscribeChannelInputSelector(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]
        for (const i in this.mixerProtocol.channelTypes[typeIndex].fromMixer
            .CHANNEL_INPUT_SELECTOR) {
            const proto =
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_INPUT_SELECTOR[i]
            const mixerMessage = proto.mixerMessage

            await this.subscribeToEmberNode(
                channelTypeIndex,
                mixerMessage,
                (node) => {
                    logger.trace(
                        `Receiving input selector from Ch "${ch}", val: ${i}: ${
                            (node.contents as Model.Parameter).value
                        }`
                    )

                    let value = (node.contents as Model.Parameter).value

                    if (value === proto.value) {
                        logger.trace(
                            `Dispatching input selector Ch "${ch}", selected: ${
                                i + 1
                            }`
                        )
                        store.dispatch(
                            storeInputSelector(
                                channel.assignedFader,
                                Number(i) + 1
                            )
                        )
                    }
                    global.mainThreadHandler.updatePartialStore(
                        channel.assignedFader
                    )
                }
            )
        }
    }

    async subscribeToMc2InputSelector(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        // subscription for enabling input selectors
        const mixerMessage = 'Channels.Inputs.${channel}.Channel States.Stereo'
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]
        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            (node) => {
                logger.trace(
                    `Update received for ch inp sel capability: ${
                        (node.contents as Model.Parameter).value
                    }`
                )
                store.dispatch(
                    storeCapability(
                        channel.assignedFader,
                        'hasInputSelector',
                        (node.contents as Model.Parameter).value as boolean
                    )
                )
                global.mainThreadHandler.updatePartialStore(
                    channel.assignedFader
                )
            }
        )
        // subscribe to input selectors
        let llState = false
        let rrState = false

        const updateState = () => {
            if (llState && !rrState) {
                logger.trace(`Input selector state: ll`)
                store.dispatch(storeInputSelector(channel.assignedFader, 2))
            } else if (rrState && !llState) {
                logger.trace(`Input selector state: rr`)
                store.dispatch(storeInputSelector(channel.assignedFader, 3))
            } else {
                logger.trace(`Input selector state: lr`)
                store.dispatch(storeInputSelector(channel.assignedFader, 1))
            }
            global.mainThreadHandler.updatePartialStore(channel.assignedFader)
        }

        const llMixerMessage =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                .CHANNEL_INPUT_SELECTOR[1].mixerMessage
        const rrMixerMessage =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer
                .CHANNEL_INPUT_SELECTOR[2].mixerMessage

        await this.subscribeToEmberNode(
            channelTypeIndex,
            llMixerMessage,
            (node) => {
                logger.trace(
                    `Update received for ch inp sel: ll: ${
                        (node.contents as Model.Parameter).value
                    }`
                )
                llState = (node.contents as Model.Parameter).value as boolean
                updateState()
            }
        )
        await this.subscribeToEmberNode(
            channelTypeIndex,
            rrMixerMessage,
            (node) => {
                logger.trace(
                    `Update received for ch inp sel: rr: ${
                        (node.contents as Model.Parameter).value
                    }`
                )
                rrState = (node.contents as Model.Parameter).value as boolean
                updateState()
            }
        )
    }

    async subscribeAMix(
        ch: number,
        typeIndex: number,
        channelTypeIndex: number
    ) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[ch - 1]
        if (this.mixerProtocol.label === LawoMC2.label) {
            // subscription for enabling amix button
            const mixerMessage =
                'Channels.Inputs.${channel}.Automix.Automix Group Assignment'
            await this.subscribeToEmberNode(
                channelTypeIndex,
                mixerMessage,
                (node) => {
                    logger.trace(
                        `Update received for amix capability: ${
                            (node.contents as Model.Parameter).value
                        }`
                    )
                    store.dispatch(
                        storeCapability(
                            channel.assignedFader,
                            'hasAMix',
                            (node.contents as Model.Parameter).value !==
                                ((node.contents as Model.Parameter).maximum ||
                                    63) // max is unassigned, max = 63 in firmware 6.4
                        )
                    )
                    global.mainThreadHandler.updatePartialStore(
                        channel.assignedFader
                    )
                }
            )
        }
        // subscribe to amix
        const mixerMessage =
            this.mixerProtocol.channelTypes[typeIndex].fromMixer.CHANNEL_AMIX[0]
                .mixerMessage
        await this.subscribeToEmberNode(
            channelTypeIndex,
            mixerMessage,
            (node) => {
                logger.trace(
                    `Receiving AMix from Ch "${ch}", val: ${
                        (node.contents as Model.Parameter).value
                    }`
                )
                store.dispatch(
                    storeSetAMix(
                        channel.assignedFader,
                        (node.contents as Model.Parameter).value as boolean
                    )
                )
                global.mainThreadHandler.updatePartialStore(
                    channel.assignedFader
                )
            }
        )
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
        value: string | number | boolean,
        type: string
    ) {
        let message = this._insertChannelName(mixerMessage, channel.toString())
        logger.trace('Sending out message : ' + message + ', val: ' + value)

        this.emberConnection
            .getElementByPath(message)
            .then((element: any) => {
                if (element.contents.factor && typeof value === 'number') {
                    value *= element.contents.factor
                }
                logger.trace(
                    `Sending out message: ${message}\n  val: ${value}\n  typeof: ${typeof value}`
                )
                this.emberConnection.setValue(element, value)
            })
            .catch((error: any) => {
                logger.data(error).error('Ember Error')
            })
    }

    sendOutLevelMessage(channel: number, value: number) {
        logger.trace(`Sending out Level: ${value}\n  To CH: ${channel}`)
        const node = this.emberNodeObject[channel - 1]
        if (!node) return
        if (node.contents.factor) {
            value *= node.contents.factor
        }
        this.emberConnection
            .setValue(this.emberNodeObject[channel - 1], value, false)
            .catch((error: any) => {
                logger.data(error).error('Ember Error')
            })
    }

    sendOutRequest(mixerMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        // let message = mixerMessage.replace('{channel}', channelString)
        let message = this._insertChannelName(mixerMessage, channelString)
        if (message != 'none') {
            /*
            this.oscConnection.send({
                address: message
            });
*/
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
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0]
        let level =
            (state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel -
                protocol.min) *
            (protocol.max - protocol.min)
        this.sendOutLevelMessage(channelTypeIndex + 1, level)
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
        // let protocol = this.mixerProtocol.channelTypes[channelType].toMixer
        //     .CHANNEL_OUT_GAIN[0]
        // let level = (outputLevel - protocol.min) * (protocol.max - protocol.min)

        const level = this._floatToFaderLevel(outputLevel, channelTypeIndex)

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
                !!this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
                    .value as any,
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_ON[0]
                    .type
            )
        } else {
            this.sendOutMessage(
                this.mixerProtocol.channelTypes[channelType].toMixer.PFL_OFF[0]
                    .mixerMessage,
                channelTypeIndex + 1,
                !!this.mixerProtocol.channelTypes[channelType].toMixer
                    .PFL_OFF[0].value as any,
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

    updateInputGain(channelIndex: number, gain: number) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_INPUT_GAIN[0]

        let level = this._floatToFaderLevel(gain, 0)

        // let level = gain * (protocol.max - protocol.min) + protocol.min

        this.sendOutMessage(
            protocol.mixerMessage,
            channelTypeIndex + 1,
            level,
            ''
        )
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex

        logger.debug(`select in ${channelIndex} ${inputSelected}`)

        if (this.mixerProtocol.label === LawoMC2.label) {
            if (inputSelected === 1) {
                // LR
                this.sendOutMessage(
                    this.mixerProtocol.channelTypes[0].toMixer
                        .CHANNEL_INPUT_SELECTOR[1].mixerMessage,
                    channelTypeIndex + 1,
                    false as any,
                    'boolean'
                )
                this.sendOutMessage(
                    this.mixerProtocol.channelTypes[0].toMixer
                        .CHANNEL_INPUT_SELECTOR[2].mixerMessage,
                    channelTypeIndex + 1,
                    false as any,
                    'boolean'
                )
            } else if (inputSelected === 2) {
                // LL
                this.sendOutMessage(
                    this.mixerProtocol.channelTypes[0].toMixer
                        .CHANNEL_INPUT_SELECTOR[1].mixerMessage,
                    channelTypeIndex + 1,
                    true as any,
                    'boolean'
                )
            } else if (inputSelected === 3) {
                // RR
                this.sendOutMessage(
                    this.mixerProtocol.channelTypes[0].toMixer
                        .CHANNEL_INPUT_SELECTOR[2].mixerMessage,
                    channelTypeIndex + 1,
                    true as any,
                    'boolean'
                )
            }
        }

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

    updateAMixState(channelIndex: number, amixOn: boolean) {
        const channel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let channelType = channel.channelType
        let channelTypeIndex = channel.channelTypeIndex
        let protocol =
            this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_AMIX[0]

        this.sendOutMessage(
            protocol.mixerMessage,
            channelTypeIndex + 1,
            amixOn,
            ''
        )
    }

    async loadMixerPreset(presetName: string) {
        logger.info(`Loading preset: ${presetName}`)
        if (this.mixerProtocol.presetFileExtension === 'MC2') {
            let data = JSON.parse(
                fs
                    .readFileSync(
                        path.resolve(process.cwd(), 'storage', presetName)
                    )
                    .toString()
            )

            const loadFunction = await this.emberConnection.getElementByPath(
                this.mixerProtocol.loadPresetCommand[0].mixerMessage
            )

            if (loadFunction.contents.type === Model.ElementType.Function) {
                this.emberConnection.invoke(
                    loadFunction as any,
                    data.sceneAddress
                )
            }
        }
    }

    injectCommand(command: string[]) {
        return true
    }

    private _insertChannelName(command: string, channel: string | number) {
        const pad = (inp: string | number, l: number) =>
            ('   ' + inp).substr(-l)

        if (this.mixerProtocol.label === LawoMC2.label) {
            const channelName = '_' + Number(channel).toString(16) // 'INP ' + pad(channel, 3)
            return command.replace('${channel}', channelName)
        } else if (this.mixerProtocol.leadingZeros) {
            return command.replace('${channel}', pad(channel, 2))
        } else {
            return command.replace('${channel}', channel + '')
        }
    }

    private _floatToFaderLevel(value: number, typeIndex: number) {
        if (this.mixerProtocol.label === LawoMC2.label) {
            return floatToDB(value)
        } else {
            const range =
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_OUT_GAIN[0].max -
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_OUT_GAIN[0].min
            const min =
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_OUT_GAIN[0].min

            return value / range + min
        }
    }

    private _faderLevelToFloat(value: number, typeIndex: number) {
        if (this.mixerProtocol.label === LawoMC2.label) {
            return dbToFloat(value)
        } else {
            const range =
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_OUT_GAIN[0].max -
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_OUT_GAIN[0].min
            const min =
                this.mixerProtocol.channelTypes[typeIndex].fromMixer
                    .CHANNEL_OUT_GAIN[0].min

            return (value - min) / range
        }
    }
}
