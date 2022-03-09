//Node Modules:
import osc from 'osc'
import fs from 'fs'
import * as path from 'path'
import { CasparCG } from 'casparcg-connection'

//Utils:
import { store, state } from '../../reducers/store'
import {
    ICasparCGMixerGeometry,
    ICasparCGChannelLayerPair,
    ICasparCGMixerGeometryFile,
    fxParamsList,
} from '../../../../shared/src/constants/MixerProtocolInterface'
import { IChannel } from '../../../../shared/src/reducers/channelsReducer'
import {
    storeSetChLabel,
    storeSetChPrivate,
} from '../../../../shared/src/actions/channelActions'
import { logger } from '../logger'
import { dbToFloat, floatToDB } from './LawoRubyConnection'
import { IFader } from '../../../../shared/src/reducers/fadersReducer'
import { sendVuLevel } from '../vuServer'
import { VuType } from '../../../../shared/src/utils/vu-server-types'
import { storeSetMixerOnline } from '../../../../shared/src/actions/settingsActions'

interface CommandChannelMap {
    [key: string]: number
}

interface ICasparCGChannel extends IChannel {
    producer?: string
    source?: string
}

const OSC_PATH_PRODUCER =
    /\/channel\/(\d+)\/stage\/layer\/(\d+)\/producer\/type/
const OSC_PATH_PRODUCER_FILE_NAME =
    /\/channel\/(\d+)\/stage\/layer\/(\d+)\/file\/path/
const OSC_PATH_PRODUCER_CHANNEL_LAYOUT =
    /\/channel\/(\d+)\/stage\/layer\/(\d+)\/producer\/channel_layout/

export class CasparCGConnection {
    mixerProtocol: ICasparCGMixerGeometry
    mixerIndex: number
    connection: CasparCG
    oscClient: any
    oscCommandMap: { [key: string]: CommandChannelMap } = {}

    constructor(mixerProtocol: ICasparCGMixerGeometry, mixerIndex: number) {
        this.mixerProtocol = mixerProtocol
        this.mixerIndex = mixerIndex
        this.injectCasparCGSetting()

        this.connection = new CasparCG({
            autoReconnect: true,
            autoReconnectAttempts: 20,
            autoReconnectInterval: 3000,
            host: state.settings[0].mixers[this.mixerIndex].deviceIp,
            port: parseInt(
                state.settings[0].mixers[this.mixerIndex].devicePort + ''
            ),
        })
        logger.info('Trying to connect to CasparCG...')
        this.connection.onConnected = () => {
            logger.info('CasparCG connected')
            store.dispatch(storeSetMixerOnline(this.mixerIndex, true))
            global.mainThreadHandler.updateMixerOnline(this.mixerIndex)

            this.setupMixerConnection()
        }
        this.connection.onDisconnected = () => {
            logger.info('CasparCG disconnected')

            store.dispatch(storeSetMixerOnline(this.mixerIndex, false))
            global.mainThreadHandler.updateMixerOnline(this.mixerIndex)
        }
        this.connection.connect()

        this.oscCommandMap.CHANNEL_VU = {}
        this.mixerProtocol.fromMixer.CHANNEL_VU.forEach((paths, index) => {
            this.oscCommandMap.CHANNEL_VU[paths[0]] = index
        })
    }

    injectCasparCGSetting() {
        const geometryFile = path.resolve(
            process.cwd(),
            'storage',
            'default-casparcg.ccg'
        )

        let geometry: ICasparCGMixerGeometryFile | undefined
        try {
            let inputObj = JSON.parse(
                fs.readFileSync(geometryFile, {
                    encoding: 'utf-8',
                })
            )
            if (inputObj.toMixer && inputObj.toMixer.PGM_CHANNEL_FADER_LEVEL) {
                geometry = inputObj
            }
        } catch (e) {
            // Handling a file should be removed from Constants in the future:
            logger.info('CasparCG Audio geometry file has not been created')
        }
        if (geometry) {
            this.mixerProtocol.fromMixer =
                geometry.fromMixer || this.mixerProtocol.fromMixer
            this.mixerProtocol.toMixer =
                geometry.toMixer || this.mixerProtocol.toMixer
            this.mixerProtocol.channelLabels =
                geometry.channelLabels || this.mixerProtocol.channelLabels
            this.mixerProtocol.sourceOptions =
                geometry.sourceOptions || this.mixerProtocol.sourceOptions
        }
    }

    setupMixerConnection() {
        const calcVuLevel = (level: number) => {
            return dbToFloat(20 * Math.log(level) + 12)
        }
        if (!this.oscClient) {
            const remotePort =
                parseInt(
                    state.settings[0].mixers[this.mixerIndex].devicePort + ''
                ) + 1000
            this.oscClient = new osc.UDPPort({
                localAddress: state.settings[0].mixers[this.mixerIndex].localIp,
                localPort: remotePort,
                remoteAddress:
                    state.settings[0].mixers[this.mixerIndex].deviceIp,
                remotePort,
            })
                .on('ready', () => {
                    logger.info('Receiving state of mixer')
                })
                .on('message', (message: any) => {
                    for (const channelIndex in this.mixerProtocol.fromMixer
                        .CHANNEL_VU) {
                        for (const vuChannelIndex in this.mixerProtocol
                            .fromMixer.CHANNEL_VU[channelIndex]) {
                            if (
                                message.address ===
                                this.mixerProtocol.fromMixer.CHANNEL_VU[
                                    channelIndex
                                ][vuChannelIndex]
                            ) {
                                const faderIndex =
                                    state.channels[0].chMixerConnection[
                                        this.mixerIndex
                                    ].channel[channelIndex].assignedFader
                                sendVuLevel(
                                    faderIndex,
                                    VuType.Channel,
                                    parseInt(vuChannelIndex),
                                    calcVuLevel(message.args[0])
                                )
                            }
                        }
                    }
                    if (this.mixerProtocol.sourceOptions) {
                        const m = message.address.split('/')

                        if (
                            m[1] === 'channel' &&
                            m[6] === 'producer' &&
                            m[7] === 'type'
                        ) {
                            const index =
                                this.mixerProtocol.sourceOptions.sources.findIndex(
                                    (i) =>
                                        i.channel === parseInt(m[2], 10) &&
                                        i.layer === parseInt(m[5])
                                )
                            if (index >= 0) {
                                store.dispatch(
                                    storeSetChPrivate(
                                        index,
                                        'producer',
                                        message.args[0]
                                    )
                                )
                            }
                        } else if (
                            m[1] === 'channel' &&
                            m[6] === 'producer' &&
                            m[7] === 'channel_layout'
                        ) {
                            const index =
                                this.mixerProtocol.sourceOptions.sources.findIndex(
                                    (i) =>
                                        i.channel === parseInt(m[2], 10) &&
                                        i.layer === parseInt(m[5])
                                )
                            if (index >= 0) {
                                store.dispatch(
                                    storeSetChPrivate(
                                        index,
                                        'channel_layout',
                                        message.args[0]
                                    )
                                )
                            }
                        } else if (
                            m[1] === 'channel' &&
                            m[6] === 'file' &&
                            m[7] === 'path'
                        ) {
                            const index =
                                this.mixerProtocol.sourceOptions.sources.findIndex(
                                    (i) =>
                                        i.channel === parseInt(m[2], 10) &&
                                        i.layer === parseInt(m[5])
                                )
                            if (index >= 0) {
                                const value =
                                    typeof message.args[0] === 'string'
                                        ? message.args[0]
                                        : message.args[0].low
                                store.dispatch(
                                    storeSetChPrivate(index, 'file_path', value)
                                )
                            }
                        }
                    }
                })
                .on('error', (error: any) => {
                    logger.data(error).error('Lost OSC connection')
                })

            this.oscClient.open()
            const remoteIp = state.settings[0].mixers[this.mixerIndex].deviceIp
            logger.info(
                `Listening for status on CasparCG: ${remoteIp}:${remotePort}`
            )
        }

        // Restore mixer values to the ones we have internally
        state.channels[0].chMixerConnection[this.mixerIndex].channel.forEach(
            (channel: IChannel, index) => {
                // const fader =  state.faders[0].fader[channel.assignedFader]
                this.updateFadeIOLevel(index, channel.outputLevel)
                this.updatePflState(index)
            }
        )

        // Set source labels from geometry definition
        if (this.mixerProtocol.channelLabels) {
            this.mixerProtocol.channelLabels.forEach((label, channelIndex) => {
                store.dispatch(
                    storeSetChLabel(this.mixerIndex, channelIndex, label)
                )
            })
        }
    }

    checkOscCommand(
        address: string,
        commandSpace: CommandChannelMap
    ): number | undefined {
        const index = commandSpace[address]
        if (index !== undefined) {
            return index
        }
        return undefined
    }

    pingMixerCommand = () => {
        //Ping OSC mixer if mixerProtocol needs it.
        /* this.mixerProtocol.pingCommand.map((command) => {
            this.sendOutMessage(
                command.mixerMessage,
                0,
                command.value
            );
        }); */
    }

    private syncCommand = Promise.resolve()
    floatToVolume = (float: number) => {
        const db = floatToDB(float)
        const volume = Math.pow(10, db / 20)

        return Math.min(Math.max(volume, 0), 3.2) // clamp between 0 and 3.2
    }
    controlVolume = (channel: number, layer: number, value: number) => {
        logger.trace(`Set ${channel}-${layer} volume = ${value}`)
        this.syncCommand = this.syncCommand
            .then(() =>
                this.connection
                    .mixerVolume(
                        channel,
                        layer,
                        this.floatToVolume(value),
                        0,
                        undefined
                    )
                    .catch((e: any) => {
                        logger.data(e).error('Failed to send command')
                    })
            )
            .then(() => {})
    }

    controlChannelSetting = (
        channel: number,
        layer: number,
        producer: string,
        file: string,
        setting: string,
        value: string
    ) => {
        this.connection
            .stop(channel, layer)
            .then(() => {
                if (setting === 'CHANNEL_LAYOUT') {
                    switch (producer) {
                        case 'ffmpeg':
                            return this.connection.play(
                                channel,
                                layer,
                                file,
                                true,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                value
                            )
                        case 'decklink':
                            return this.connection.playDecklink(
                                channel,
                                layer,
                                parseInt(file, 10),
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                value
                            )
                        case 'layer-producer':
                            return this.connection.playRoute(
                                channel,
                                layer,
                                file,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                value,
                                undefined
                            )
                    }
                }
                return Promise.reject('Unknown operation')
            })
            .then(() => {})
            .catch((e: any) => {
                logger.data(e).error('Failed to change channel setting')
            })
    }

    setAllLayers = (pairs: ICasparCGChannelLayerPair[], value: number) => {
        pairs.forEach((i) => {
            this.controlVolume(i.channel, i.layer, value)
        })
    }

    updatePflState(channelIndex: number) {
        if (
            channelIndex >
            this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1
        ) {
            return
        }
        logger.trace(`Update PFL state for ${channelIndex}`)
        const channel: IChannel =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ]
        const fader: IFader = state.faders[0].fader[channel.assignedFader]
        const otherFaders: Array<IFader> = state.channels[0].chMixerConnection[
            this.mixerIndex
        ].channel
            .filter((_ch: any, i: number) => i !== channelIndex)
            .map((ch: IChannel) => state.faders[0].fader[ch.assignedFader])
        if (fader.pflOn === true) {
            // Enable SOLO on this channel on MONITOR
            const pairs =
                this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL[channelIndex]
            this.setAllLayers(
                pairs,
                state.faders[0].fader[channel.assignedFader].faderLevel
            )
            // Ensure that all other non-SOLO channels are muted on MONITOR
            // const others = state.channels[0].chMixerConnection[this.mixerIndex].channel.map((ch: IChannel) => state.faders[0].fader[ch.assignedFader].pflOn ? undefined : index)
            const others = state.channels[0].chMixerConnection[
                this.mixerIndex
            ].channel
                .map((ch: IChannel, index: number) =>
                    state.faders[0].fader[ch.assignedFader].pflOn
                        ? undefined
                        : index
                )
                .filter(
                    (i) =>
                        i !== undefined &&
                        i <
                            this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL
                                .length
                ) as number[]
            others.forEach((i) => {
                const pairs = this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL[i]
                this.setAllLayers(pairs, this.mixerProtocol.fader.min)
            })
        } else {
            // check if any other channels are SOLO
            const others = otherFaders
                .map((i, index) => (i.pflOn ? index : undefined))
                .filter(
                    (i) =>
                        i !== undefined &&
                        i <
                            this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL
                                .length
                ) as number[]
            if (others.length > 0) {
                // other channels are SOLO, mute this channel on PFL
                const pairs =
                    this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL[channelIndex]
                this.setAllLayers(pairs, this.mixerProtocol.fader.min)
            } else {
                // There are no other SOLO channels, restore PFL to match PGM
                state.channels[0].chMixerConnection[
                    this.mixerIndex
                ].channel.forEach((_ch: IChannel, index: number) => {
                    if (
                        index >
                        this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL.length -
                            1
                    ) {
                        return
                    }
                    const pairs =
                        this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL[index]
                    this.setAllLayers(
                        pairs,
                        state.channels[0].chMixerConnection[this.mixerIndex]
                            .channel[index].outputLevel
                    )
                })
            }
        }
    }

    updateMuteState(channelIndex: number, muteOn: boolean) {
        return true
    }

    updateNextAux(channelIndex: number, level: number) {
        if (
            channelIndex >
            this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1
        ) {
            return
        }
        logger.trace(`Update NEXT AUX for ${channelIndex}`)
        if (this.mixerProtocol.toMixer.NEXT_AUX_FADER_LEVEL) {
            const faderIndex: number =
                state.channels[0].chMixerConnection[this.mixerIndex].channel[
                    channelIndex
                ].assignedFader
            if (state.faders[0].fader[faderIndex].pstOn === true) {
                // add this channel to the PST mix
                const pairs =
                    this.mixerProtocol.toMixer.NEXT_AUX_FADER_LEVEL[faderIndex]
                this.setAllLayers(
                    pairs,
                    state.faders[0].fader[faderIndex].faderLevel
                )
            } else {
                // mute this channel to the PST mix
                const pairs =
                    this.mixerProtocol.toMixer.NEXT_AUX_FADER_LEVEL[faderIndex]
                this.setAllLayers(pairs, this.mixerProtocol.fader.min)
            }
        }
    }

    updateInputGain(channelIndex: number, level: number) {
        return true
    }
    updateInputSelector(channelIndex: number, inputSelected: number) {
        if (
            this.mixerProtocol.toMixer.CHANNEL_INPUT_SELECTOR &&
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].private
        ) {
            const pair = this.mixerProtocol.sourceOptions.sources[channelIndex]
            const producer =
                state.channels[0].chMixerConnection[this.mixerIndex].channel[
                    channelIndex
                ].private!['producer']
            let filePath = String(
                state.channels[0].chMixerConnection[this.mixerIndex].channel[
                    channelIndex
                ].private!['file_path']
            )
            filePath = filePath.replace(/\.[\w\d]+$/, '')
            this.controlChannelSetting(
                pair.channel,
                pair.layer,
                producer,
                filePath,
                'CHANNEL_LAYOUT',
                this.mixerProtocol.toMixer.CHANNEL_INPUT_SELECTOR[
                    inputSelected - 1
                ].mixerMessage
            )
        }
    }
    updateFx(fxParam: fxParamsList, channelIndex: number, level: number) {
        return true
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        return true
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        if (
            channelIndex >
            this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1
        ) {
            return
        }

        logger.trace(
            `updateFadeIOLevel: channelId: ${channelIndex}, fader.pflOn = "${state.faders[0].fader[channelIndex].pflOn}". faderLevel = "${state.faders[0].fader[channelIndex].faderLevel}"`
        )

        const faderIndex: number =
            state.channels[0].chMixerConnection[this.mixerIndex].channel[
                channelIndex
            ].assignedFader
        const pgmPairs =
            this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL[channelIndex]
        this.setAllLayers(pgmPairs, outputLevel)

        const anyPflOn = state.faders[0].fader.find((f: IFader) => f.pflOn)
        // Check if there are no SOLO channels on MONITOR or there are, but this channel is SOLO
        if (!anyPflOn || state.faders[0].fader[faderIndex].pflOn) {
            const pairs =
                this.mixerProtocol.toMixer.PFL_AUX_FADER_LEVEL[channelIndex]
            if (state.faders[0].fader[faderIndex].pflOn) {
                this.setAllLayers(
                    pairs,
                    state.faders[0].fader[faderIndex].faderLevel
                )
            } else {
                this.setAllLayers(pairs, outputLevel)
            }
        }
    }

    updateChannelName(channelIndex: number) {
        //CasparCG does not need Labels.
    }

    loadMixerPreset(presetName: string) {
        // This is where CasparCG settings preset loading should be refactored to
    }

    injectCommand(command: string[]) {
        this.connection.createCommand(command[0])
    }
}
