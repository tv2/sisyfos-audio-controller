import { MixerProtocolPresets } from '../constants/MixerProtocolPresets'
import {
    SettingsActionTypes,
    SettingsActions,
} from '../actions/settingsActions'

export enum PageType {
    All,
    CustomPage,
}

export interface Settings {
    /* Sisyfos Settings Version: */
    sisyfosVersion?: string

    /** UI state (non persistant) */
    showSettings: boolean
    showPagesSetup: boolean
    showLabelSettings: boolean
    showChanStrip: number
    showChanStripFull: number
    showOptions: number | false
    showMonitorOptions: number
    showStorage: boolean
    currentPage: {
        type: PageType
        start?: number
        id?: string
    }
    customPages: Array<CustomPages>

    /** User config */
    numberOfMixers: number
    mixers: MixerSettings[]
    enableRemoteFader: boolean
    remoteFaderMidiInputPort: string
    remoteFaderMidiOutputPort: string
    numberOfFaders: number
    fadeTime: number // Default fade time for PGM ON - OFF
    voFadeTime: number // Default fade time for VO ON - OFF
    voLevel: number // Relative level of PGM in %
    autoResetLevel: number // Autoreset before pgm on, if level is lower than in %
    automationMode: boolean
    offtubeMode: boolean
    showPfl: boolean
    enablePages: boolean
    numberOfCustomPages: number
    chanStripFollowsPFL: boolean
    labelType: 'automatic' | 'user' | 'automation' | 'channel'

    /** Connection state */
    serverOnline: boolean
}

export interface CustomPages {
    id: string
    label: string
    faders: Array<number>
}

export interface MixerSettings {
    mixerProtocol: string
    deviceIp: string
    devicePort: number
    protocolLatency: number // If a protocol has latency and feedback, the amount of time before enabling receiving data from channel again
    mixerMidiInputPort: string
    mixerMidiOutputPort: string
    numberOfChannelsInType: Array<number>
    numberOfAux: number
    nextSendAux: number
    mixerOnline: boolean
    localIp: string
    localOscPort: number
}

const defaultSettingsReducerState: Array<Settings> = [
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
    action: SettingsActions
): Array<Settings> => {
    let nextState = [Object.assign({}, state[0])]

    switch (action.type) {
        case SettingsActionTypes.TOGGLE_SHOW_SETTINGS:
            nextState[0].showSettings = !nextState[0].showSettings
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_PAGES_SETUP:
            nextState[0].showPagesSetup = !nextState[0].showPagesSetup
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_LABEL_SETTINGS:
            nextState[0].showLabelSettings = !nextState[0].showLabelSettings
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_CHAN_STRIP:
            if (nextState[0].showChanStrip !== action.channel) {
                nextState[0].showChanStrip = action.channel
            } else {
                nextState[0].showChanStrip = -1
            }
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_CHAN_STRIP_FULL:
            if (nextState[0].showChanStripFull !== action.channel) {
                nextState[0].showChanStripFull = action.channel
            } else {
                nextState[0].showChanStripFull = -1
            }
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_MONITOR_OPTIONS:
            if (nextState[0].showMonitorOptions !== action.channel) {
                nextState[0].showMonitorOptions = action.channel
            } else {
                nextState[0].showMonitorOptions = -1
            }
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_OPTION:
            nextState[0].showOptions =
                typeof nextState[0].showOptions === 'number'
                    ? false
                    : action.channel
            return nextState
        case SettingsActionTypes.TOGGLE_SHOW_STORAGE:
            nextState[0].showStorage = !nextState[0].showStorage
            return nextState
        case SettingsActionTypes.SET_PAGE:
            let currentPage
            if (typeof action.id === 'string') {
                currentPage = {
                    type: action.pageType,
                    id: action.id,
                    start: 0,
                }
            } else {
               currentPage = {
                    type: action.pageType,
                    id: '',
                    start: action.id,
                }
            }
            nextState[0].currentPage = currentPage
            return nextState
        case SettingsActionTypes.SET_PAGES_LIST:
            nextState[0].customPages = action.customPages
            return nextState
        case SettingsActionTypes.SET_MIXER_ONLINE:
            nextState[0].mixers[action.mixerIndex || 0].mixerOnline =
                action.mixerOnline
            return nextState
        case SettingsActionTypes.SET_SERVER_ONLINE:
            nextState[0].serverOnline = action.serverOnline
            return nextState
        case SettingsActionTypes.UPDATE_SETTINGS:
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
