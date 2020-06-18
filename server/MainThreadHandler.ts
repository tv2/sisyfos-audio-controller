import { store, state } from './reducers/store'
import {
    mixerProtocolList,
    mixerProtocolPresets,
    mixerGenericConnection,
    remoteConnections,
} from './mainClasses'
import { SnapshotHandler } from './utils/SnapshotHandler'
import { socketServer } from './expressHandler'

import { UPDATE_SETTINGS, LOAD_CUSTOM_PAGES } from './reducers/settingsActions'
import {
    loadSettings,
    saveSettings,
    getSnapShotList,
    getCcgSettingsList,
    setCcgDefault,
    getMixerPresetList,
    getCustomPages,
} from './utils/SettingsStorage'
import {
    SOCKET_TOGGLE_PGM,
    SOCKET_TOGGLE_VO,
    SOCKET_TOGGLE_PST,
    SOCKET_TOGGLE_PFL,
    SOCKET_TOGGLE_MUTE,
    SOCKET_SET_FADERLEVEL,
    SOCKET_SET_INPUT_GAIN,
    SOCKET_SAVE_SETTINGS,
    SOCKET_GET_SNAPSHOT_LIST,
    SOCKET_RETURN_SNAPSHOT_LIST,
    SOCKET_GET_CCG_LIST,
    SOCKET_RETURN_CCG_LIST,
    SOCKET_LOAD_SNAPSHOT,
    SOCKET_SAVE_SNAPSHOT,
    SOCKET_SET_ASSIGNED_FADER,
    SOCKET_SET_AUX_LEVEL,
    SOCKET_NEXT_MIX,
    SOCKET_CLEAR_PST,
    SOCKET_SET_THRESHOLD,
    SOCKET_SET_RATIO,
    SOCKET_SET_LOW,
    SOCKET_SET_MID,
    SOCKET_SET_HIGH,
    SOCKET_RESTART_SERVER,
    SOCKET_SET_FADER_MONITOR,
    SOCKET_TOGGLE_IGNORE,
    SOCKET_SET_FULL_STORE,
    SOCKET_SET_STORE_FADER,
    SOCKET_SET_STORE_CHANNEL,
    SOCKET_SET_LO_MID,
    SOCKET_SET_INPUT_OPTION,
    SOCKET_SAVE_CCG_FILE,
    SOCKET_SET_DELAY_TIME,
    SOCKET_SHOW_IN_MINI_MONITOR,
    SOCKET_GET_MIXER_PRESET_LIST,
    SOCKET_RETURN_MIXER_PRESET_LIST,
    SOCKET_LOAD_MIXER_PRESET,
    SOCKET_SET_INPUT_SELECTOR,
    SOCKET_GET_PAGES_LIST,
    SOCKET_RETURN_PAGES_LIST,
} from './constants/SOCKET_IO_DISPATCHERS'
import {
    TOGGLE_PGM,
    TOGGLE_VO,
    TOGGLE_PST,
    TOGGLE_PFL,
    TOGGLE_MUTE,
    NEXT_MIX,
    CLEAR_PST,
    SET_FADER_THRESHOLD,
    SET_FADER_RATIO,
    SET_FADER_LOW,
    SET_FADER_MID,
    SET_FADER_HIGH,
    SET_FADER_MONITOR,
    IGNORE_AUTOMATION,
    SET_FADER_LO_MID,
    SET_FADER_DELAY_TIME,
    SHOW_IN_MINI_MONITOR,
    SET_INPUT_GAIN,
    SET_INPUT_SELECTOR,
} from './reducers/faderActions'
import { SET_FADER_LEVEL } from './reducers/faderActions'
import { SET_ASSIGNED_FADER, SET_AUX_LEVEL } from './reducers/channelActions'
import { IChannel } from './reducers/channelsReducer'
import { logger } from './utils/logger'
const path = require('path')

export class MainThreadHandlers {
    snapshotHandler: SnapshotHandler

    constructor() {
        logger.info('Setting up MainThreadHandlers', {})

        this.snapshotHandler = new SnapshotHandler()
        store.dispatch({
            type: UPDATE_SETTINGS,
            settings: loadSettings(state),
        })
    }

    updateFullClientStore() {
        socketServer.emit(SOCKET_SET_FULL_STORE, state)
    }

    updatePartialStore(faderIndex: number) {
        state.faders[0].fader[faderIndex]
        socketServer.emit(SOCKET_SET_STORE_FADER, {
            faderIndex: faderIndex,
            state: state.faders[0].fader[faderIndex],
        })
        state.channels[0].channel.forEach(
            (channel: IChannel, index: number) => {
                if (channel.assignedFader === faderIndex) {
                    socketServer.emit(SOCKET_SET_STORE_CHANNEL, {
                        channelIndex: index,
                        state: channel,
                    })
                }
            }
        )
    }

    socketServerHandlers(socket: any) {
        logger.info('SETTING UP SOCKET IO MAIN HANDLERS', {})

        // get-store get-settings and get-mixerprotocol will be replaces with
        // serverside Redux middleware emitter when moved to Socket IO:
        socket
            .on('get-store', () => {
                logger.info(
                    'Settings initial store on :' + String(socket.client.id),
                    {}
                )
                this.updateFullClientStore()
            })
            .on('get-settings', () => {
                socketServer.emit('set-settings', state.settings[0])
            })
            .on('get-mixerprotocol', () => {
                socketServer.emit('set-mixerprotocol', {
                    mixerProtocol:
                        mixerProtocolPresets[state.settings[0].mixerProtocol],
                    mixerProtocolPresets: mixerProtocolPresets,
                    mixerProtocolList: mixerProtocolList,
                })
            })
            .on(SOCKET_GET_SNAPSHOT_LIST, () => {
                logger.info('Get snapshot list', {})
                socketServer.emit(
                    SOCKET_RETURN_SNAPSHOT_LIST,
                    getSnapShotList()
                )
            })
            .on(SOCKET_LOAD_SNAPSHOT, (payload: string) => {
                logger.info('Load Snapshot', {})
                this.snapshotHandler.loadSnapshotSettings(
                    path.resolve('storage', payload),
                    false
                )
                this.updateFullClientStore()
            })
            .on(SOCKET_SAVE_SNAPSHOT, (payload: string) => {
                logger.info('Save Snapshot', {})
                this.snapshotHandler.saveSnapshotSettings(
                    path.resolve('storage', payload)
                )

                socketServer.emit(
                    SOCKET_RETURN_SNAPSHOT_LIST,
                    getSnapShotList()
                )
            })
            .on(SOCKET_GET_CCG_LIST, () => {
                logger.info('Get CCG settings list', {})
                socketServer.emit(SOCKET_RETURN_CCG_LIST, getCcgSettingsList())
            })
            .on(SOCKET_GET_MIXER_PRESET_LIST, () => {
                logger.info('Get Preset list', {})
                socketServer.emit(
                    SOCKET_RETURN_MIXER_PRESET_LIST,
                    getMixerPresetList(
                        mixerGenericConnection.getPresetFileExtention()
                    )
                )
            })
            .on(SOCKET_SAVE_CCG_FILE, (payload: any) => {
                logger.info('Set default CCG File :' + String(payload), {})
                setCcgDefault(payload)
                this.updateFullClientStore()
            })
            .on(SOCKET_LOAD_MIXER_PRESET, (payload: any) => {
                logger.info('Set Mixer Preset :' + String(payload), {})
                mixerGenericConnection.loadMixerPreset(payload)
                this.updateFullClientStore()
            })
            .on(SOCKET_GET_PAGES_LIST, () => {
                logger.info('Get custom pages list', {})
                socketServer.emit(SOCKET_RETURN_PAGES_LIST, getCustomPages())
            })
            .on(SOCKET_SAVE_SETTINGS, (payload: any) => {
                logger.info('Save settings :' + String(payload), {})
                saveSettings(payload)
                this.updateFullClientStore()
            })
            .on(SOCKET_RESTART_SERVER, () => {
                process.exit(0)
            })
            .on(SOCKET_SET_ASSIGNED_FADER, (payload: any) => {
                logger.verbose(
                    'Set assigned fader. Channel:' +
                        String(payload.channel) +
                        'Fader :' +
                        String(payload.faderAssign),
                    {}
                )
                store.dispatch({
                    type: SET_ASSIGNED_FADER,
                    channel: payload.channel,
                    faderNumber: payload.faderAssign,
                })
                this.updateFullClientStore()
            })
            .on(SOCKET_SET_FADER_MONITOR, (payload: any) => {
                store.dispatch({
                    type: SET_FADER_MONITOR,
                    channel: payload.faderIndex,
                    auxIndex: payload.auxIndex,
                })
                this.updateFullClientStore()
            })
            .on(SOCKET_SHOW_IN_MINI_MONITOR, (payload: any) => {
                store.dispatch({
                    type: SHOW_IN_MINI_MONITOR,
                    faderIndex: payload.faderIndex,
                    showInMiniMonitor: payload.showInMiniMonitor,
                })
                this.updateFullClientStore()
            })
            .on(SOCKET_SET_INPUT_OPTION, (payload: any) => {
                mixerGenericConnection.updateChannelSettings(
                    payload.channel,
                    payload.prop,
                    payload.option
                )
            })
            .on(SOCKET_SET_AUX_LEVEL, (payload: any) => {
                logger.verbose(
                    'Set Auxlevel Channel:' + String(payload.channel),
                    {}
                )
                store.dispatch({
                    type: SET_AUX_LEVEL,
                    channel: payload.channel,
                    auxIndex: payload.auxIndex,
                    level: payload.level,
                })
                mixerGenericConnection.updateAuxLevel(
                    payload.channel,
                    payload.auxIndex
                )
                this.updateFullClientStore()
                remoteConnections.updateRemoteAuxPanels()
            })
            .on(SOCKET_SET_THRESHOLD, (payload: any) => {
                logger.verbose('Set Threshold:' + String(payload.channel), {})
                store.dispatch({
                    type: SET_FADER_THRESHOLD,
                    channel: payload.channel,
                    level: payload.level,
                })
                mixerGenericConnection.updateThreshold(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_SET_RATIO, (payload: any) => {
                logger.verbose('Set Ratio:' + String(payload.channel), {})
                store.dispatch({
                    type: SET_FADER_RATIO,
                    channel: payload.channel,
                    level: payload.level,
                })
                mixerGenericConnection.updateRatio(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_SET_DELAY_TIME, (payload: any) => {
                logger.verbose('Set Delay:' + String(payload.channel), {})
                store.dispatch({
                    type: SET_FADER_DELAY_TIME,
                    channel: payload.channel,
                    delayTime: payload.delayTime,
                })
                mixerGenericConnection.updateDelayTime(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_SET_LOW, (payload: any) => {
                logger.verbose('Set Low:' + String(payload.channel), {})
                store.dispatch({
                    type: SET_FADER_LOW,
                    channel: payload.channel,
                    level: payload.level,
                })
                mixerGenericConnection.updateLow(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_SET_LO_MID, (payload: any) => {
                logger.verbose('Set Mid:' + String(payload.level), {})
                store.dispatch({
                    type: SET_FADER_LO_MID,
                    channel: payload.channel,
                    level: payload.level,
                })
                mixerGenericConnection.updateLoMid(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_SET_MID, (payload: any) => {
                logger.verbose('Set Mid:' + String(payload.level), {})
                store.dispatch({
                    type: SET_FADER_MID,
                    channel: payload.channel,
                    level: payload.level,
                })
                mixerGenericConnection.updateMid(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_SET_HIGH, (payload: any) => {
                logger.verbose('Set High:' + String(payload.channel), {})
                store.dispatch({
                    type: SET_FADER_HIGH,
                    channel: payload.channel,
                    level: payload.level,
                })
                mixerGenericConnection.updateHigh(payload.channel)
                this.updatePartialStore(payload.channel)
            })
            .on(SOCKET_NEXT_MIX, () => {
                store.dispatch({
                    type: NEXT_MIX,
                })
                mixerGenericConnection.updateOutLevels()
                this.updateFullClientStore()
            })
            .on(SOCKET_CLEAR_PST, () => {
                store.dispatch({
                    type: CLEAR_PST,
                })
                mixerGenericConnection.updateOutLevels()
                this.updateFullClientStore()
            })
            .on(SOCKET_TOGGLE_PGM, (faderIndex: any) => {
                mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                store.dispatch({
                    type: TOGGLE_PGM,
                    channel: faderIndex,
                })
                mixerGenericConnection.updateOutLevel(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(SOCKET_TOGGLE_VO, (faderIndex: any) => {
                mixerGenericConnection.checkForAutoResetThreshold(faderIndex)
                store.dispatch({
                    type: TOGGLE_VO,
                    channel: faderIndex,
                })
                mixerGenericConnection.updateOutLevel(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(SOCKET_TOGGLE_PST, (faderIndex: any) => {
                store.dispatch({
                    type: TOGGLE_PST,
                    channel: faderIndex,
                })
                mixerGenericConnection.updateNextAux(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(SOCKET_TOGGLE_PFL, (faderIndex: any) => {
                store.dispatch({
                    type: TOGGLE_PFL,
                    channel: faderIndex,
                })
                mixerGenericConnection.updatePflState(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(SOCKET_TOGGLE_MUTE, (faderIndex: any) => {
                store.dispatch({
                    type: TOGGLE_MUTE,
                    channel: faderIndex,
                })
                mixerGenericConnection.updateMuteState(faderIndex)
                this.updatePartialStore(faderIndex)
            })
            .on(SOCKET_TOGGLE_IGNORE, (faderIndex: any) => {
                store.dispatch({
                    type: IGNORE_AUTOMATION,
                    channel: faderIndex,
                })
                this.updatePartialStore(faderIndex)
            })
            .on(SOCKET_SET_FADERLEVEL, (payload: any) => {
                logger.verbose(
                    'Set faderlevel  Channel : ' +
                        String(payload.faderIndex + 1) +
                        '  Level : ' +
                        String(payload.level)
                )
                store.dispatch({
                    type: SET_FADER_LEVEL,
                    channel: payload.faderIndex,
                    level: parseFloat(payload.level),
                })
                mixerGenericConnection.updateOutLevel(payload.faderIndex)
                mixerGenericConnection.updateNextAux(payload.faderIndex)
                this.updatePartialStore(payload.faderIndex)
            })
            .on(SOCKET_SET_INPUT_GAIN, (payload: any) => {
                logger.verbose(
                    'Set fInput Gain Channel : ' +
                        String(payload.faderIndex + 1) +
                        '  Level : ' +
                        String(payload.level)
                )
                store.dispatch({
                    type: SET_INPUT_GAIN,
                    channel: payload.faderIndex,
                    level: parseFloat(payload.level),
                })
                mixerGenericConnection.updateInputGain(payload.faderIndex)
                this.updatePartialStore(payload.faderIndex)
            })
            .on(SOCKET_SET_INPUT_SELECTOR, (payload: any) => {
                logger.verbose(
                    'Set Input selector : ' +
                        String(payload.faderIndex + 1) +
                        '  Selected : ' +
                        String(payload.selected)
                )
                console.log(payload)
                store.dispatch({
                    type: SET_INPUT_SELECTOR,
                    channel: payload.faderIndex,
                    selected: parseFloat(payload.selected),
                })
                mixerGenericConnection.updateInputSelector(payload.faderIndex)
                this.updatePartialStore(payload.faderIndex)
            })
    }
}
