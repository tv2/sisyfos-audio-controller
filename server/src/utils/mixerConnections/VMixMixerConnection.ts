//Node Modules:
import { store, state } from '../../reducers/store'
import { ConnectionTCP } from 'node-vmix'
import { XmlApi } from 'vmix-js-utils'

//Utils:
import {
    fxParamsList,
    MixerProtocol,
} from '../../../../shared/src/constants/MixerProtocolInterface'
import {
    ChannelActions,
    ChannelActionTypes,
} from '../../../../shared/src/actions/channelActions'
import {
    FaderActions,
    FaderActionTypes,
} from '../../../../shared/src/actions/faderActions'
import {
    SettingsActions,
    SettingsActionTypes,
} from '../../../../shared/src/actions/settingsActions'
import { logger } from '../logger'
import { sendVuLevel } from '../vuServer'
import { VuType } from '../../../../shared/src/utils/vu-server-types'
import { dbToFloat } from './LawoRubyConnection'
import {
    ChannelReference,
    Fader,
} from '../../../../shared/src/reducers/fadersReducer'

export class VMixMixerConnection {
    mixerProtocol: MixerProtocol
    mixerIndex: number
    cmdChannelIndex: number
    vmixConnection: any
    vmixVuConnection: ConnectionTCP
    mixerOnlineTimer: any

    audioOn: Record<string, boolean> = {}
    lastLevel: Record<string, number> = {}

    constructor(mixerProtocol: MixerProtocol, mixerIndex: number) {
        this.sendOutMessage = this.sendOutMessage.bind(this)
        this.pingMixerCommand = this.pingMixerCommand.bind(this)

        store.dispatch({
            type: SettingsActionTypes.SET_MIXER_ONLINE,
            mixerIndex: this.mixerIndex,
            mixerOnline: false,
        })

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

        this.vmixConnection = new ConnectionTCP(
            state.settings[0].mixers[this.mixerIndex].deviceIp,
            {
                port: parseInt(
                    state.settings[0].mixers[this.mixerIndex].devicePort + ''
                ),
                debug: true,
            }
        )
        this.vmixVuConnection = new ConnectionTCP(
            state.settings[0].mixers[this.mixerIndex].deviceIp,
            {
                port: parseInt(
                    state.settings[0].mixers[this.mixerIndex].devicePort + ''
                ),
            }
        )
        this.setupMixerConnection()
    }

    mixerOnline(onLineState: boolean) {
        store.dispatch({
            type: SettingsActionTypes.SET_MIXER_ONLINE,
            mixerIndex: this.mixerIndex,
            mixerOnline: onLineState,
        })

        global.mainThreadHandler.updateMixerOnline(this.mixerIndex, onLineState)
    }

    private getAssignedFaderIndex(channelIndex: number) {
        return state.faders[0].fader.findIndex((fader: Fader) =>
            fader.assignedChannels?.some((assigned: ChannelReference) => {
                return (
                    assigned.mixerIndex === this.mixerIndex &&
                    assigned.channelIndex === channelIndex
                )
            })
        )
    }

    setupMixerConnection() {
        this.vmixConnection._socket
            .on('connect', () => {
                logger.info('Receiving state of desk')
                this.initialCommands()

                this.mixerOnline(true)
                global.mainThreadHandler.updateFullClientStore()
            })
            .on('data', (data: any) => {
                const message = data.toString()
                // logger.trace(XmlApi.DataParser.parse(message))
                clearTimeout(this.mixerOnlineTimer)
                if (!state.settings[0].mixers[this.mixerIndex].mixerOnline) {
                    this.mixerOnline(true)
                }
            })
            .on('error', (error: any) => {
                global.mainThreadHandler.updateFullClientStore()
                logger.error(error)
            })
            .on('disconnect', () => {
                this.mixerOnline(false)
                logger.info('Lost VMix connection')
            })

        logger.info(
            `OSC listening on port ${
                state.settings[0].mixers[this.mixerIndex].localOscPort
            }`
        )

        //Ping OSC mixer if mixerProtocol needs it.
        if (this.mixerProtocol.pingTime > 0) {
            setInterval(() => {
                this.pingMixerCommand()
            }, this.mixerProtocol.pingTime)
        }

        // use separate connection for updates to prevent blocking any commands
        this.vmixVuConnection.on('xml', (xml: string) => {
            const doc = XmlApi.DataParser.parse(xml)
            const inputs = XmlApi.Inputs.extractInputsFromXML(doc)

            const mappedInputs = inputs.map((input) => {
                const d: Record<string, any> = {
                    name: input.childNodes[0].nodeValue,
                }

                const attrs = [
                    'volume',
                    'muted',
                    'meterF1',
                    'meterF2',
                    'number',
                    'gainDb',
                    'solo',
                ]
                Object.values(input.attributes)
                    .filter((attr: Attr) => attrs.includes(attr.name))
                    .forEach((attr: Attr) => {
                        d[attr.name] = attr.value
                    })

                d.volume = Math.pow(parseFloat(d.volume || '0') / 100, 0.25)
                d.meterF1 = (9.555 * Math.log(d.meterF1 || 0)) / Math.log(3)
                d.meterF2 = (9.555 * Math.log(d.meterF2 || 0)) / Math.log(3)
                d.muted = d.muted ? d.muted === 'True' : true
                d.solo = d.solo === 'True'
                d.gainDb = parseFloat(d.gainDb || '0') / 24

                return d
            })

            mappedInputs.forEach((input) => {
                if (
                    !state.channels[0].chMixerConnection[this.mixerIndex]
                        .channel[input.number - 1]
                )
                    return

                if ('number' in input) {
                    sendVuLevel(
                        input.number - 1,
                        VuType.Channel,
                        0,
                        dbToFloat(input.meterF1 + 12)
                    ) // add +15 to convert from dBFS
                    sendVuLevel(
                        input.number - 1,
                        VuType.Channel,
                        1,
                        dbToFloat(input.meterF2 + 12)
                    ) // add +15 to convert from dBFS
                }

                // If vMix has more channels than Sisyfos is configured to handle,
                // then do nothing with those additional channels.
                if (!this.doesChannelExists(input.number - 1)) {
                    return
                }

                const { outputLevel, fadeActive } =
                    state.channels[0].chMixerConnection[this.mixerIndex]
                        .channel[input.number - 1]
                const assignedFaderIndex = this.getAssignedFaderIndex(
                    input.number - 1
                )
                if (!state.faders[0].fader[assignedFaderIndex]) {
                    return
                }
                const { inputGain, muteOn, pflOn, pgmOn, voOn } =
                    state.faders[0].fader[assignedFaderIndex]
                let sendUpdate = false
                
                const dispatchAndSetUpdateState = (
                    update: FaderActions | ChannelActions | SettingsActions
                ) => {
                    store.dispatch(update)
                    sendUpdate = true
                }

                if ('muted' in input) {
                    if (input.muted === false) {
                        if (
                            !fadeActive &&
                            outputLevel > 0 &&
                            Math.abs(outputLevel - input.volume) > 0.01
                        ) {
                            dispatchAndSetUpdateState({
                                type: FaderActionTypes.SET_FADER_LEVEL,
                                faderIndex: assignedFaderIndex,
                                level: input.volume,
                            })
                            dispatchAndSetUpdateState({
                                type: ChannelActionTypes.SET_OUTPUT_LEVEL,
                                channel: assignedFaderIndex,
                                mixerIndex: this.mixerIndex,
                                level: voOn
                                    ? input.volume /
                                      (state.settings[0].voLevel / 100)
                                    : input.volume,
                            })
                        }
                        if (muteOn) {
                            dispatchAndSetUpdateState({
                                type: FaderActionTypes.SET_MUTE,
                                faderIndex: assignedFaderIndex,
                                muteOn: false,
                            })
                        }
                        if (!fadeActive && !pgmOn && !voOn) {
                            dispatchAndSetUpdateState({
                                type: FaderActionTypes.SET_PGM,
                                faderIndex: assignedFaderIndex,
                                pgmOn: true,
                            })
                            dispatchAndSetUpdateState({
                                type: ChannelActionTypes.SET_OUTPUT_LEVEL,
                                channel: assignedFaderIndex,
                                mixerIndex: this.mixerIndex,
                                level: input.volume,
                            })
                        }
                    } else if (!muteOn) {
                        if (pgmOn) {
                            dispatchAndSetUpdateState({
                                type: FaderActionTypes.SET_PGM,
                                faderIndex: assignedFaderIndex,
                                pgmOn: false,
                            })
                        }
                        if (voOn) {
                            dispatchAndSetUpdateState({
                                type: FaderActionTypes.SET_VO,
                                faderIndex: assignedFaderIndex,
                                voOn: false,
                            })
                        }
                    }

                    if (inputGain !== input.gainDb) {
                        dispatchAndSetUpdateState({
                            type: FaderActionTypes.SET_INPUT_GAIN,
                            faderIndex: assignedFaderIndex,
                            level: input.gainDb,
                        })
                    }
                    if (pflOn !== input.solo) {
                        dispatchAndSetUpdateState({
                            type: FaderActionTypes.SET_PFL,
                            faderIndex: assignedFaderIndex,
                            pflOn: input.solo,
                        })
                    }
                }

                if (sendUpdate) {
                    global.mainThreadHandler.updatePartialStore(
                        input.number - 1
                    )
                }
            })
        })
        this.vmixVuConnection.on('connect', () => {
            setInterval(() => {
                this.vmixVuConnection.send('XML')
            }, 80)
        })
    }

    initialCommands() {
        this.vmixConnection.send('XML')
        this.vmixConnection.send({ Function: 'SUBSCRIBE TALLY' })
        return
        // To prevent network overload, timers will delay the requests.
        this.mixerProtocol.initializeCommands?.forEach(
            (item, itemIndex: number) => {
                setTimeout(() => {
                    if (item.mixerMessage.includes('{channel}')) {
                        if (item.type !== undefined && item.type === 'aux') {
                            state.channels[0].chMixerConnection[
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
        if (!this.mixerProtocol.pingCommand.length) return

        this.mixerProtocol.pingCommand.map((command) => {
            let value = command.value || 0
            let type = command.type || 'i'
            this.sendOutMessage(command.mixerMessage, 0, value, type)
        })
        global.mainThreadHandler.updateFullClientStore()
        this.mixerOnlineTimer = setTimeout(() => {
            store.dispatch({
                type: SettingsActionTypes.SET_MIXER_ONLINE,
                mixerIndex: this.mixerIndex,
                mixerOnline: false,
            })
        }, this.mixerProtocol.pingTime)
    }

    checkFxCommands(message: any) {
        Object.keys(fxParamsList).forEach((keyName: string) => {
            if (!isNaN(parseFloat(keyName))) {
                return
            }

            let fxKey = keyName as keyof typeof fxParamsList
            if (
                this.mixerProtocol.channelTypes[0].fromMixer[
                    fxParamsList[fxKey]
                ] &&
                this.checkVMixCommand(
                    message.address,
                    this.mixerProtocol.channelTypes[0].fromMixer[
                        fxParamsList[fxKey]
                    ][0].mixerMessage
                )
            ) {
                let ch = message.address.split('/')[this.cmdChannelIndex]
                const assignedFaderIndex = this.getAssignedFaderIndex(ch - 1)
                store.dispatch({
                    type: FaderActionTypes.SET_FADER_FX,
                    faderIndex: assignedFaderIndex,
                    fxParam: fxParamsList[fxKey],
                    level: message.args[0],
                })
                global.mainThreadHandler.updatePartialStore(assignedFaderIndex)
            }

            logger.trace(fxKey)
        })
    }

    checkVMixCommand(message: string, command: string | undefined): boolean {
        if (!command) return false
        if (message === command) return true
        return
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
        vMixMessage: string,
        channel: number,
        value: string | number,
        type: string
    ) {
        if (state.settings[0].mixers[this.mixerIndex].mixerOnline) {
            logger.trace(`send${vMixMessage} Input=1&Value=${value}`)
            this.vmixConnection.send({
                Function: vMixMessage,
                Input: channel, // todo - should we map these?
                Value: value,
            })
        }
    }

    sendOutRequest(oscMessage: string, channel: number) {
        let channelString = this.mixerProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        let message = oscMessage.replace('{channel}', channelString)
        if (message != 'none') {
            this.vmixConnection.send({
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
        logger.trace(`Initial Aux Message : ${message}`)
        if (message != 'none') {
            this.vmixConnection.send({
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
        const level = Math.round(
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].outputLevel * 100
        )
        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex + 1,
            level,
            'f'
        )
    }

    updatePflState(channelIndex: number) {
        let { channelType, channelTypeIndex, outputLevel } =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]

        if (state.faders[0].fader[channelIndex].pflOn === true) {
            if (outputLevel === 0) {
                // this.sendOutMessage('AudioOff', channelTypeIndex + 1,  1, '')
                // this.sendOutMessage('SetVolume', channelTypeIndex + 1,  75, '')
            }
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
            if (outputLevel === 0) {
                // this.sendOutMessage('SetVolume', channelTypeIndex + 1,  0, '')
                // this.sendOutMessage('AudioOn', channelTypeIndex + 1,  1, '')
            }
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
        const { channelType, channelTypeIndex, outputLevel } =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]

        if (muteOn === true && outputLevel > 0) {
            let mute =
                this.mixerProtocol.channelTypes[channelType].toMixer
                    .CHANNEL_MUTE_ON[0]
            this.sendOutMessage(
                mute.mixerMessage,
                channelTypeIndex + 1,
                mute.value,
                mute.type
            )
        } else if (muteOn === false && outputLevel > 0) {
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
        let channelType =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelType
        let channelTypeIndex =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].channelTypeIndex
        let mixerMessage =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_INPUT_GAIN[0]
        if (mixerMessage.min !== undefined && mixerMessage.max !== undefined) {
            level =
                mixerMessage.min + (mixerMessage.max - mixerMessage.min) * level
        }
        this.sendOutMessage(
            mixerMessage.mixerMessage,
            channelTypeIndex + 1,
            Math.round(level),
            'f'
        )
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        const { channelType, channelTypeIndex } =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let { mixerMessage, value } =
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_INPUT_SELECTOR[inputSelected - 1]

        this.sendOutMessage(mixerMessage, channelTypeIndex + 1, value, '')
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
        if (fx.min !== undefined && fx.max !== undefined) {
            level = fx.min + (fx.max - fx.min) * level
        }
        this.sendOutMessage(
            fx.mixerMessage,
            channelTypeIndex + 1,
            Math.round(level),
            'f'
        ) // todo - is it always rounded?
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
        let { channelType, channelTypeIndex } =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        let { muteOn } = state.faders[0].fader[channelIndex]
        outputLevel = Math.round(100 * outputLevel)

        if (this.lastLevel[channelIndex] === outputLevel) {
            return
        }

        this.sendOutMessage(
            this.mixerProtocol.channelTypes[channelType].toMixer
                .CHANNEL_OUT_GAIN[0].mixerMessage,
            channelTypeIndex + 1,
            String(outputLevel),
            'f'
        )
        this.lastLevel[channelIndex] = outputLevel

        if (!muteOn && outputLevel > 0 && !this.audioOn[channelIndex]) {
            this.sendOutMessage('AudioOn', channelTypeIndex + 1, 1, '')
            this.audioOn[channelIndex] = true
        }

        if (outputLevel < 1 && this.audioOn[channelIndex]) {
            this.sendOutMessage('AudioOff', channelTypeIndex + 1, 1, '')
            // audio off command is a bit slow...
            setTimeout(() => {
                console.log('turn off')
                this.sendOutMessage('SetVolume', channelTypeIndex + 1, 75, '')
            }, 80)
            // this.sendOutMessage('SetVolume', channelTypeIndex + 1, 75, '')
            this.audioOn[channelIndex] = false
        }
    }

    updateChannelName(channelIndex: number) {
        // let channelType =
        //     state.channels[0].chMixerConnection[this.mixerIndex].channel[
        //         channelIndex
        //     ].channelType
        // let channelTypeIndex =
        //     state.channels[0].chMixerConnection[this.mixerIndex].channel[
        //         channelIndex
        //     ].channelTypeIndex
        // let channelName = state.faders[0].fader[channelIndex].label
        // this.sendOutMessage(
        //     this.mixerProtocol.channelTypes[channelType].toMixer.CHANNEL_NAME[0]
        //         .mixerMessage,
        //     channelTypeIndex + 1,
        //     channelName,
        //     's'
        // )
        return true
    }

    loadMixerPreset(presetName: string) {
        logger.info(`Loading preset : ${presetName}`)
        if (this.mixerProtocol.presetFileExtension === 'X32') {
            let data = JSON.parse(
                '{}' // ''fs.readFileSync(path.resolve(STORAGE_FOLDER, presetName))
            )

            this.vmixConnection.send({
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

    doesChannelExists(channelNumber: number): boolean {
        return !!state.channels[0].chMixerConnection[this.mixerIndex].channel[
            channelNumber
        ]
    }

    updateAMixState(channelIndex: number, amixOn: boolean) {}

    updateChannelSetting(
        channelIndex: number,
        setting: string,
        value: string
    ) {}
}
