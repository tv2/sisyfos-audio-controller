import { MixerProtocolPresets } from '../MixerProtocolPresets'
import {
    TOGGLE_SHOW_CHAN_STRIP,
    TOGGLE_SHOW_OPTION,
    TOGGLE_SHOW_SETTINGS,
    TOGGLE_SHOW_STORAGE,
    UPDATE_SETTINGS,
    SET_MIXER_ONLINE,
    TOGGLE_SHOW_MONITOR_OPTIONS,
    SET_SERVER_ONLINE,
    SET_PAGE,
    TOGGLE_SHOW_PAGES_SETUP,
    SET_PAGES_LIST,
    TOGGLE_SHOW_CHAN_STRIP_FULL,
    TOGGLE_SHOW_LABEL_SETTINGS,
} from '../actions/settingsActions'

import { ISettings, PageType } from '../../shared/settings-types'

const defaultSettingsReducerState: Array<ISettings> = [
    {
        showSettings: false,
        showPagesSetup: false,
        showLabelSettings: false,
        showChanStrip: -1,
        showChanStripFull: -1,
        showOptions: false,
        showMonitorOptions: -1,
        showStorage: false,
        currentPage: { type: PageType.All },
        numberOfMixers: 1,
        customPages: [],
        mixers: [
            {
                mixerProtocol: 'sslSystemT',
                deviceIp: '0.0.0.0',
                devicePort: 10024,
                protocolLatency: 220,
                mixerMidiInputPort: '',
                mixerMidiOutputPort: '',
                numberOfAux: 0,
                nextSendAux: -1,
                numberOfChannelsInType: [8],
                mixerOnline: false,
                localIp: '0.0.0.0',
                localOscPort: 1234,
            },
        ],
        enableRemoteFader: false,
        remoteFaderMidiInputPort: '',
        remoteFaderMidiOutputPort: '',
        numberOfFaders: 8,
        voLevel: 30,
        autoResetLevel: 5,
        automationMode: true,
        offtubeMode: false,
        fadeTime: 120,
        voFadeTime: 280,
        showPfl: false,
        enablePages: true,
        numberOfCustomPages: 4,
        chanStripFollowsPFL: true,
        serverOnline: true,
        labelType: 'automatic',
    },
]

export const settings = (
    state = defaultSettingsReducerState,
    action: any
): Array<ISettings> => {
    let nextState = [Object.assign({}, state[0])]

    switch (action.type) {
        case TOGGLE_SHOW_SETTINGS:
            nextState[0].showSettings = !nextState[0].showSettings
            return nextState
        case TOGGLE_SHOW_PAGES_SETUP:
            nextState[0].showPagesSetup = !nextState[0].showPagesSetup
            return nextState
        case TOGGLE_SHOW_LABEL_SETTINGS:
            nextState[0].showLabelSettings = !nextState[0].showLabelSettings
            return nextState
        case TOGGLE_SHOW_CHAN_STRIP:
            if (nextState[0].showChanStrip !== action.channel) {
                nextState[0].showChanStrip = action.channel
            } else {
                nextState[0].showChanStrip = -1
            }
            return nextState
        case TOGGLE_SHOW_CHAN_STRIP_FULL:
            if (nextState[0].showChanStripFull !== action.channel) {
                nextState[0].showChanStripFull = action.channel
            } else {
                nextState[0].showChanStripFull = -1
            }
            return nextState
        case TOGGLE_SHOW_MONITOR_OPTIONS:
            if (nextState[0].showMonitorOptions !== action.channel) {
                nextState[0].showMonitorOptions = action.channel
            } else {
                nextState[0].showMonitorOptions = -1
            }
            return nextState
        case TOGGLE_SHOW_OPTION:
            nextState[0].showOptions =
                typeof nextState[0].showOptions === 'number'
                    ? false
                    : action.channel
            return nextState
        case TOGGLE_SHOW_STORAGE:
            nextState[0].showStorage = !nextState[0].showStorage
            return nextState
        case SET_PAGE:
            nextState[0].currentPage = {
                type: action.pageType,
                id: action.id,
                start: action.start,
            }
            return nextState
        case SET_PAGES_LIST:
            nextState[0].customPages = action.customPages
            return nextState
        case SET_MIXER_ONLINE:
            nextState[0].mixers[action.mixerIndex || 0].mixerOnline =
                action.mixerOnline
            return nextState
        case SET_SERVER_ONLINE:
            nextState[0].serverOnline = action.serverOnline
            return nextState
        case UPDATE_SETTINGS:
            nextState[0] = action.settings

            // ignore UI state:
            nextState[0].showSettings = state[0].showSettings || false
            nextState[0].showOptions = state[0].showOptions || false
            nextState[0].showMonitorOptions = state[0].showMonitorOptions || -1
            nextState[0].showStorage = state[0].showStorage || false
            nextState[0].showChanStrip = state[0].showChanStrip || -1
            nextState[0].serverOnline = state[0].serverOnline || true
            nextState[0].currentPage = state[0].currentPage
            nextState[0].customPages = state[0].customPages

            if (!nextState[0].mixers) {
                nextState = [Object.assign({}, defaultSettingsReducerState[0])]
            }
            if (
                typeof MixerProtocolPresets[
                    nextState[0].mixers[0].mixerProtocol
                ] === 'undefined'
            ) {
                nextState[0].mixers[0].mixerProtocol = 'genericMidi'
            }
            return nextState
        default:
            return nextState
    }
}