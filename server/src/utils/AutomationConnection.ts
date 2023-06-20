//Node Modules:
import osc from 'osc'
import { store, state } from '../reducers/store'
import { mixerGenericConnection } from '../mainClasses'

//Utils:
import {
    IAutomationProtocol,
    AutomationPresets,
} from '../../../shared/src/constants/AutomationPresets'
import { IFader } from '../../../shared/src/reducers/fadersReducer'
import {
    SNAP_RECALL,
    storeFaderLevel,
    storeFaderLabel,
    storeSetPgm,
    storeSetVo,
    storeSetPstVo,
    storeSetMute,
    storeSetPst,
    storeShowChannel,
    storeXmix,
    storeFadeToBlack,
    storeClearPst,
} from '../../../shared/src/actions/faderActions'
import { getFaderLabel } from './labels'
import { logger } from './logger'

const AUTOMATION_OSC_PORT = 5255
export class AutomationConnection {
    oscConnection: any
    automationProtocol: IAutomationProtocol

    constructor() {
        this.sendOutMessage = this.sendOutMessage.bind(this)

        this.automationProtocol = AutomationPresets.sofie

        this.oscConnection = new osc.UDPPort({
            localAddress: '0.0.0.0',
            localPort: AUTOMATION_OSC_PORT,
        })
        this.setupAutomationConnection()
    }

    setupAutomationConnection() {
        const messageHandler = (
            message: any,
            timetag: number | undefined,
            info: any
        ) => {
            const check = (key: keyof IAutomationProtocol['fromAutomation']) =>
                this.checkOscCommand(
                    message.address,
                    this.automationProtocol.fromAutomation[key]
                )
            const wrapChannelCommand = (fn: (ch: any) => void) => {
                let ch: number
                let chMessage = message.address.split('/')[2]

                if (Number.isNaN(parseInt(chMessage))) {
                    // look among labels to find channel
                    const fader = state.faders[0].fader
                        .map((f, i) => ({ ...f, i }))
                        .find(
                            (f) =>
                                f.userLabel === chMessage ||
                                f.label === chMessage
                        )
                    const channel = state.channels[0].chMixerConnection
                        .map((conn) =>
                            conn.channel.map((ch) => ({
                                assignedFader: ch.assignedFader,
                                label: ch.label,
                            }))
                        )
                        .map((m) => m.find((ch) => ch.label === chMessage))
                        .find((m) => m)

                    if (fader) {
                        ch = fader.i + 1
                    } else if (channel) {
                        ch = channel.assignedFader + 1
                    } else {
                        logger.error(
                            `Could not find fader with label: ${chMessage}`
                        )
                        return
                    }
                } else {
                    ch = parseInt(chMessage)
                }

                if (
                    state.faders[0].fader[ch - 1] &&
                    !state.faders[0].fader[ch - 1].ignoreAutomation
                ) {
                    fn(ch)
                }
                global.mainThreadHandler.updatePartialStore(ch - 1)
            }

            logger.data(message).debug(`RECIEVED AUTOMATION MESSAGE: ${message.address}`)

            // Set state of Sisyfos:
            if (check('CHANNEL_PGM_ON_OFF')) {
                wrapChannelCommand((ch: any) => {
                    if (message.args[0] === 1) {
                        mixerGenericConnection.checkForAutoResetThreshold(
                            ch - 1
                        )
                        store.dispatch(storeSetPgm(ch - 1, true))
                    } else if (message.args[0] === 2) {
                        mixerGenericConnection.checkForAutoResetThreshold(
                            ch - 1
                        )
                        store.dispatch(storeSetVo(ch - 1, true))
                    } else {
                        store.dispatch(storeSetPgm(ch - 1, false))
                    }

                    if (message.args.length > 1) {
                        mixerGenericConnection.updateOutLevel(
                            ch - 1,
                            parseFloat(message.args[1])
                        )
                    } else {
                        mixerGenericConnection.updateOutLevel(ch - 1, -1)
                    }
                })
            } else if (check('CHANNEL_PST_ON_OFF')) {
                wrapChannelCommand((ch) => {
                    if (message.args[0] === 1) {
                        store.dispatch(storeSetPst(ch - 1, true))
                    } else if (message.args[0] === 2) {
                        store.dispatch(storeSetPstVo(ch - 1, true))
                    } else {
                        store.dispatch(storeSetPst(ch - 1, false))
                    }
                    mixerGenericConnection.updateNextAux(ch - 1)
                })
            } else if (check('CHANNEL_MUTE')) {
                wrapChannelCommand((ch: any) => {
                    store.dispatch(storeSetMute(ch - 1, message.args[0] === 1))
                    mixerGenericConnection.updateMuteState(ch - 1)
                })
            } else if (check('CHANNEL_FADER_LEVEL')) {
                wrapChannelCommand((ch: any) => {
                    store.dispatch(storeFaderLevel(ch - 1, message.args[0]))
                    mixerGenericConnection.updateOutLevel(ch - 1, -1)
                    global.mainThreadHandler.updatePartialStore(ch - 1)
                })
            } else if (check('INJECT_COMMAND')) {
                wrapChannelCommand((ch: any) => {
                    store.dispatch(storeFaderLabel(ch - 1, message.args[0]))
                    mixerGenericConnection.injectCommand(message.args)
                })
            } else if (check('SNAP_RECALL')) {
                let snapNumber = message.address.split('/')[2]
                store.dispatch({
                    type: SNAP_RECALL,
                    snapIndex: snapNumber - 1,
                })
            } else if (check('SET_LABEL')) {
                wrapChannelCommand((ch: any) => {
                    store.dispatch(storeFaderLabel(ch - 1, message.args[0]))
                    mixerGenericConnection.updateChannelName(ch - 1)
                })
            } else if (check('X_MIX')) {
                store.dispatch(storeXmix())
                mixerGenericConnection.updateOutLevels()
                global.mainThreadHandler.updateFullClientStore()
            } else if (check('CHANNEL_VISIBLE')) {
                wrapChannelCommand((ch: any) => {
                    store.dispatch(
                        storeShowChannel(ch - 1, message.args[0] === 1)
                    )
                })
            } else if (check('FADE_TO_BLACK')) {
                store.dispatch(storeFadeToBlack())
                mixerGenericConnection.updateFadeToBlack()
                global.mainThreadHandler.updateFullClientStore()
            } else if (check('CLEAR_PST')) {
                store.dispatch(storeClearPst())
                mixerGenericConnection.updateOutLevels()
                global.mainThreadHandler.updateFullClientStore()
            } else if (check('STATE_FULL')) {
                // Get state from Producers Audio Mixer:
                this.sendOutMessage(
                    this.automationProtocol.toAutomation.STATE_FULL,
                    0,
                    JSON.stringify({
                        channel: state.faders[0].fader.map(
                            (
                                {
                                    faderLevel,
                                    pgmOn,
                                    voOn,
                                    pstOn,
                                    showChannel,
                                }: IFader,
                                index
                            ) => ({
                                faderLevel,
                                pgmOn,
                                voOn,
                                pstOn,
                                showChannel,
                                label: getFaderLabel(index),
                            })
                        ),
                    }),
                    's',
                    info
                )
            } else if (check('STATE_CHANNEL_PGM')) {
                wrapChannelCommand((ch: any) => {
                    this.sendOutMessage(
                        this.automationProtocol.toAutomation.STATE_CHANNEL_PGM,
                        ch,
                        state.faders[0].fader[ch - 1].pgmOn,
                        'i',
                        info
                    )
                })
            } else if (check('STATE_CHANNEL_PST')) {
                wrapChannelCommand((ch) => {
                    this.sendOutMessage(
                        this.automationProtocol.toAutomation.STATE_CHANNEL_PST,
                        ch,
                        state.faders[0].fader[ch - 1].pstOn,
                        'i',
                        info
                    )
                })
            } else if (check('STATE_CHANNEL_MUTE')) {
                wrapChannelCommand((ch) => {
                    this.sendOutMessage(
                        this.automationProtocol.toAutomation.STATE_CHANNEL_MUTE,
                        ch,
                        state.faders[0].fader[ch - 1].muteOn,
                        'i',
                        info
                    )
                })
            } else if (check('STATE_CHANNEL_FADER_LEVEL')) {
                wrapChannelCommand((ch) => {
                    this.sendOutMessage(
                        this.automationProtocol.toAutomation
                            .STATE_CHANNEL_FADER_LEVEL,
                        ch,
                        state.faders[0].fader[ch - 1].faderLevel,
                        'f',
                        info
                    )
                })
            } else if (check('PING')) {
                let pingValue = state.settings[0].mixers[0].mixerOnline
                    ? message.address.split('/')[2]
                    : 'offline'

                this.sendOutMessage(
                    this.automationProtocol.toAutomation.PONG,
                    0,
                    pingValue,
                    's',
                    info
                )
            }
        }

        this.oscConnection
            .on('ready', () => {
                this.automationProtocol.initializeCommands.map((item) => {
                    // this.sendOutMessage(item.oscMessage, 1, item.value, item.type);
                    logger.info('Listening for Automation via OSC over UDP.')
                })
            })
            .on('message', messageHandler)
            .on('error', (error: any) => {
                logger.data(error).error('Error OSC')
            })

        this.oscConnection.open()
        logger.info(`OSC Automation listening on port ${AUTOMATION_OSC_PORT}`)
    }

    checkOscCommand(message: string, command: string) {
        if (message === command) return true

        let cmdArray = command.split('{value1}')

        if (
            message.substr(0, cmdArray[0].length) === cmdArray[0] &&
            (message.substr(-cmdArray[1].length) === cmdArray[1] ||
                cmdArray[1].length === 0) &&
            message.length >= command.replace('{value1}', '').length
        ) {
            return true
        } else {
            return false
        }
    }

    sendOutMessage(
        oscMessage: string,
        channel: number,
        value: string | number | boolean,
        type: string,
        to: { address: string; port: number }
    ) {
        let channelString = this.automationProtocol.leadingZeros
            ? ('0' + channel).slice(-2)
            : channel.toString()
        let message = oscMessage.replace('{value1}', channelString)
        if (message != 'none') {
            this.oscConnection.send(
                {
                    address: message,
                    args: [
                        {
                            type: type,
                            value: value,
                        },
                    ],
                },
                to.address,
                to.port
            )
        }
    }
}
