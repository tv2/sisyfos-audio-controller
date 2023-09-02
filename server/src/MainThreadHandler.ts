import { store, state } from './reducers/store'
import {
    mixerProtocolList,
    mixerProtocolPresets,
    mixerGenericConnection,
    remoteConnections,
} from './mainClasses'
import { SnapshotHandler } from './utils/SnapshotHandler'
import { socketServer } from './expressHandler'

import { storeUpdateSettings } from '../../shared/src/actions/settingsActions'
import * as IO from '../../shared/src/constants/SOCKET_IO_DISPATCHERS'
import * as FADER_ACTIONS from '../../shared/src/actions/faderActions'
import * as CHANNEL_ACTIONS from '../../shared/src/actions/channelActions'

import {
    loadSettings,
    saveSettings,
    getSnapShotList,
    getCcgSettingsList,
    setCcgDefault,
    getMixerPresetList,
    getCustomPages,
    saveCustomPages,
    STORAGE_FOLDER,
} from './utils/SettingsStorage'

import {
    storeFlushChLabels,
    storeSetAuxLevel,
} from '../../shared/src/actions/channelActions'
import { logger } from './utils/logger'
import { ICustomPages } from '../../shared/src/reducers/settingsReducer'
import { fxParamsList } from '../../shared/src/constants/MixerProtocolInterface'
import path from 'path'
import { IChannel } from '../../shared/src/reducers/channelsReducer'
import { IChannelReference } from '../../shared/src/reducers/fadersReducer'

export class MainThreadHandlers {
    snapshotHandler: SnapshotHandler

    constructor() {
        logger.info('Setting up MainThreadHandlers')

        this.snapshotHandler = new SnapshotHandler()
        store.dispatch(storeUpdateSettings(loadSettings(state)))
        this.cleanUpAssignedChannelsOnFaders()
        this.reIndexAssignedChannelsRelation()
    }

    updateFullClientStore() {
        socketServer.emit(IO.SOCKET_SET_FULL_STORE, state)
    }

    updatePartialStore(faderIndex: number) {
        socketServer.emit(IO.SOCKET_SET_STORE_FADER, {
            faderIndex: faderIndex,
            state: state.faders[0].fader[faderIndex],
        })
        state.faders[0].fader[faderIndex].assignedChannels?.forEach(
            (channel: IChannelReference) => {
                socketServer.emit(IO.SOCKET_SET_STORE_CHANNEL, {
                    channelIndex: channel.channelIndex,
                    state: state.channels[0].chMixerConnection[channel.mixerIndex]
                        .channel[channel.channelIndex],
                })
            }
        )

    }

    updateMixerOnline(mixerIndex: number, onLineState?: boolean) {
        socketServer.emit(IO.SOCKET_SET_MIXER_ONLINE, {
            mixerIndex,
            mixerOnline:
                onLineState ?? state.settings[0].mixers[mixerIndex].mixerOnline,
        })
    }

    reIndexAssignedChannelsRelation() {
        state.channels[0].chMixerConnection.forEach((mixer: any) => {
            mixer.channel.forEach((channel: IChannel) => {
                channel.assignedFader = -1
            })
        })
        state.faders[0].fader.forEach((fader, faderIndex) => {
            fader.assignedChannels?.forEach((channel: IChannelReference) => {
                store.dispatch(
                    CHANNEL_ACTIONS.storeSetAssignedFader(
                        channel.mixerIndex,
                        channel.channelIndex,
                        faderIndex
                    )
                )
            })
        })
    }

    cleanUpAssignedChannelsOnFaders() {
        state.faders[0].fader.forEach((fader, faderIndex) => {
            fader.assignedChannels?.forEach((channel: IChannelReference) => {
                if (state.settings[0].numberOfMixers < channel.mixerIndex + 1) {
                    store.dispatch(
                        FADER_ACTIONS.storeSetAssignedChannel(
                            faderIndex,
                            channel.mixerIndex,
                            channel.channelIndex,
                            false
                        )
                    )
                }
            })
        })
    }



    socketServerHandlers(socket: any) {
        logger.info('Setting up socket IO main handlers.')

        socket
            .on('get-store', () => {
                logger.info(`Setting initial store on: ${socket.client.id}`)
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
            })
            .on('get-settings', () => {
                socketServer.emit('set-settings', state.settings[0])
            })
            .on('get-mixerprotocol', () => {
                socketServer.emit('set-mixerprotocol', {
                    mixerProtocol:
                        mixerProtocolPresets[
                        state.settings[0].mixers[0].mixerProtocol
                        ],
                    mixerProtocolPresets: mixerProtocolPresets,
                    mixerProtocolList: mixerProtocolList,
                })
            })
            .on(IO.SOCKET_GET_SNAPSHOT_LIST, () => {
                logger.info('Get snapshot list')
                socketServer.emit(
                    IO.SOCKET_RETURN_SNAPSHOT_LIST,
                    getSnapShotList()
                )
            })
            .on(IO.SOCKET_LOAD_SNAPSHOT, (payload: string) => {
                logger.info('Load Snapshot')
                this.snapshotHandler.loadSnapshotSettings(
                    path.join(STORAGE_FOLDER, payload),
                    true
                )
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_SAVE_SNAPSHOT, (payload: string) => {
                logger.info('Save Snapshot')
                this.snapshotHandler.saveSnapshotSettings(
                    path.join(STORAGE_FOLDER, payload)
                )

                socketServer.emit(
                    IO.SOCKET_RETURN_SNAPSHOT_LIST,
                    getSnapShotList()
                )
            })
            .on(IO.SOCKET_GET_CCG_LIST, () => {
                logger.info('Get CCG settings list')
                socketServer.emit(
                    IO.SOCKET_RETURN_CCG_LIST,
                    getCcgSettingsList()
                )
            })
            .on(IO.SOCKET_GET_MIXER_PRESET_LIST, () => {
                logger.info('Get Preset list')
                socketServer.emit(
                    IO.SOCKET_RETURN_MIXER_PRESET_LIST,
                    getMixerPresetList(
                        mixerGenericConnection.getPresetFileExtention()
                    )
                )
            })
            .on(IO.SOCKET_SAVE_CCG_FILE, (payload: any) => {
                logger.info(`Set default CCG File: ${payload}`)
                setCcgDefault(payload)
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_LOAD_MIXER_PRESET, (payload: any) => {
                logger.info(`Set Mixer Preset: ${payload}`)
                mixerGenericConnection.loadMixerPreset(payload)
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_GET_PAGES_LIST, () => {
                logger.info('Get custom pages list')
                let customPages: ICustomPages[] = getCustomPages()
                if (
                    customPages.length === state.settings[0].numberOfCustomPages
                ) {
                    socketServer.emit(IO.SOCKET_RETURN_PAGES_LIST, customPages)
                } else {
                    for (
                        let i = 0;
                        i < state.settings[0].numberOfCustomPages;
                        i++
                    ) {
                        if (!customPages[i]) {
                            customPages.push({
                                id: 'custom' + String(i),
                                label: 'Custom ' + String(i),
                                faders: [],
                            })
                        }
                    }
                    socketServer.emit(
                        IO.SOCKET_RETURN_PAGES_LIST,
                        customPages.slice(
                            0,
                            state.settings[0].numberOfCustomPages
                        )
                    )
                }
            })
            .on(IO.SOCKET_SET_PAGES_LIST, (payload: any) => {
                saveCustomPages(payload)
                logger.info(`Save custom pages list: ${payload}`)
            })
            .on(IO.SOCKET_SAVE_SETTINGS, (payload: any) => {
                logger.data(payload).info('Save settings:')
                saveSettings(payload)
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
                /** Delay restart to ensure the async saveSettings is done before restarting*/
                setTimeout(() => {
                    process.exit(0)
                }, 1000)
            })
            .on(IO.SOCKET_RESTART_SERVER, () => {
                process.exit(0)
            })
            .on(IO.SOCKET_ASSIGN_CH_TO_FADER, (payload: any) => {
                logger.trace(
                    `Set assigned fader.\n  Mixer: ${payload.mixerIndex + 1
                    }\n  Channel: ${payload.channel}\n  Fader: ${payload.faderAssign
                    }`
                )
                store.dispatch(
                    FADER_ACTIONS.storeSetAssignedChannel(
                        payload.faderIndex,
                        payload.mixerIndex,
                        payload.channel,
                        payload.assigned
                    )
                )
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_REMOVE_ALL_CH_ASSIGNMENTS, () => {
                logger.trace(
                    `Remove all channel assignments.\n`)
                store.dispatch(
                    FADER_ACTIONS.removeAllAssignedChannels()
                )
                this.reIndexAssignedChannelsRelation()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_SET_FADER_MONITOR, (payload: any) => {
                store.dispatch(
                    FADER_ACTIONS.storeFaderMonitor(
                        payload.faderIndex,
                        payload.auxIndex
                    )
                )
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_SHOW_IN_MINI_MONITOR, (payload: any) => {
                store.dispatch(
                    FADER_ACTIONS.storeShowInMiniMonitor(
                        payload.faderIndex,
                        payload.showInMiniMonitor
                    )
                )
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_SET_INPUT_OPTION, (payload: any) => {
                mixerGenericConnection.updateChannelSettings(
                    payload.channel,
                    payload.prop,
                    payload.option
                )
            })
            .on(IO.SOCKET_SET_AUX_LEVEL, (payload: any) => {
                logger.trace(
                    `Set Auxlevel Channel: ${payload.channel} Auxindex : ${payload.auxIndex} level : ${payload.level}`
                )
                store.dispatch(
                    storeSetAuxLevel(
                        0,
                        payload.channel,
                        payload.auxIndex,
                        payload.level
                    )
                )
                mixerGenericConnection.updateAuxLevel(
                    payload.channel,
                    payload.auxIndex
                )
                this.updateFullClientStore()
                remoteConnections.updateRemoteAuxPanels()
            })
            .on(IO.SOCKET_SET_FX, (payload: any) => {
                logger.trace(
                    `Set ${fxParamsList[payload.fxParam]}: ${payload.channel}`
                )
                store.dispatch(
                    FADER_ACTIONS.storeFaderFx(
                        payload.fxParam,
                        payload.faderIndex,
                        payload.level
                    )
                )
                mixerGenericConnection.updateFx(
                    payload.fxParam,
                    payload.faderIndex
                )
                this.updatePartialStore(payload.faderIndex)
            })
            .on(IO.SOCKET_NEXT_MIX, () => {
                store.dispatch(FADER_ACTIONS.storeNextMix())
                mixerGenericConnection.updateOutLevels()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_CLEAR_PST, () => {
                store.dispatch(FADER_ACTIONS.storeClearPst())
                mixerGenericConnection.updateOutLevels()
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_TOGGLE_PGM, (faderIndex: any) => {
                mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                store.dispatch(FADER_ACTIONS.storeTogglePgm(faderIndex))
                mixerGenericConnection.updateOutLevel(faderIndex, -1)
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_VO, (faderIndex: any) => {
                mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                store.dispatch(FADER_ACTIONS.storeToggleVo(faderIndex))
                mixerGenericConnection.updateOutLevel(faderIndex, -1)
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_SLOW_FADE, (faderIndex: any) => {
                store.dispatch(FADER_ACTIONS.storeToggleSlowFade(faderIndex))
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_PST, (faderIndex: any) => {
                store.dispatch(FADER_ACTIONS.storeTogglePst(faderIndex))
                mixerGenericConnection.updateNextAux(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_PFL, (faderIndex: any) => {
                store.dispatch(FADER_ACTIONS.storeTogglePfl(faderIndex))
                mixerGenericConnection.updatePflState(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_MUTE, (faderIndex: any) => {
                store.dispatch(FADER_ACTIONS.storeToggleMute(faderIndex))
                mixerGenericConnection.updateMuteState(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_AMIX, (faderIndex: any) => {
                store.dispatch(FADER_ACTIONS.storeToggleAMix(faderIndex))
                mixerGenericConnection.updateAMixState(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_IGNORE, (faderIndex: any) => {
                store.dispatch(
                    FADER_ACTIONS.storeToggleIgnoreAutomation(faderIndex)
                )
                this.updatePartialStore(faderIndex)
            })
            .on(IO.SOCKET_SET_FADERLEVEL, (payload: any) => {
                logger.trace(
                    `Set fader level\n  Channel: ${payload.faderIndex + 1
                    }\n  Level: ${payload.level}`
                )
                store.dispatch(
                    FADER_ACTIONS.storeFaderLevel(
                        payload.faderIndex,
                        parseFloat(payload.level)
                    )
                )
                mixerGenericConnection.updateOutLevel(payload.faderIndex, 0)
                mixerGenericConnection.updateNextAux(payload.faderIndex)
                this.updatePartialStore(payload.faderIndex)
            })
            .on(IO.SOCKET_SET_INPUT_GAIN, (payload: any) => {
                logger.trace(
                    `Set fInput\n  Gain Channel: ${payload.faderIndex + 1
                    }\n  Level: ${payload.level}`
                )
                store.dispatch(
                    FADER_ACTIONS.storeInputGain(
                        payload.faderIndex,
                        parseFloat(payload.level)
                    )
                )
                mixerGenericConnection.updateInputGain(payload.faderIndex)
                this.updatePartialStore(payload.faderIndex)
            })
            .on(IO.SOCKET_SET_INPUT_SELECTOR, (payload: any) => {
                logger.trace(
                    `Set Input selector: ${payload.faderIndex + 1
                    }\n  Selected: ${payload.selected}`
                )
                logger.debug(payload)
                store.dispatch(
                    FADER_ACTIONS.storeInputSelector(
                        payload.faderIndex,
                        parseFloat(payload.selected)
                    )
                )
                mixerGenericConnection.updateInputSelector(payload.faderIndex)
                this.updatePartialStore(payload.faderIndex)
            })
            .on(IO.SOCKET_TOGGLE_ALL_MANUAL, () => {
                logger.trace('Toggle manual mode for all')
                store.dispatch(FADER_ACTIONS.storeAllManual())
                this.updateFullClientStore()
            })
            .on(IO.SOCKET_SET_LABELS, (payload: any) => {
                store.dispatch(FADER_ACTIONS.updateLabels(payload.update))
            })
            .on(IO.SOCKET_GET_LABELS, () => {
                socketServer.emit(
                    IO.SOCKET_GET_LABELS,
                    state.faders[0].fader.map((f) => f.userLabel)
                )
            })
            .on(IO.SOCKET_FLUSH_LABELS, () => {
                store.dispatch(FADER_ACTIONS.flushExtLabels())
                store.dispatch(storeFlushChLabels())
            })
    }
}
