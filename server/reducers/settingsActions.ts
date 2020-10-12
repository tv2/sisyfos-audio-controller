import { PageType } from './settingsReducer'

export const TOGGLE_SHOW_SETTINGS = 'TOGGLE_SHOW_SETTINGS'
export const TOGGLE_SHOW_CHAN_STRIP = 'TOGGLE_SHOW_CHAN_STRIP'
export const TOGGLE_SHOW_OPTION = 'TOGGLE_SHOW_OPTION'
export const TOGGLE_SHOW_MONITOR_OPTIONS = 'TOGGLE_SHOW_MONITOR_OPTIONS'
export const TOGGLE_SHOW_STORAGE = 'TOGGLE_SHOW_STORAGE'
export const TOGGLE_SHOW_SNAPS = 'TOGGLE_SHOW_SNAPS'
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SET_MIXER_ONLINE = 'SET_MIXER_ONLINE'
export const SET_SERVER_ONLINE = 'SET_SERVER_ONLINE'
export const SET_PAGE = 'SET_PAGE'

export const storeShowSettings = () => {
    return {
        type: TOGGLE_SHOW_SETTINGS,
    }
}
export const storeShowChanStrip = (faderIndex: number) => {
    return {
        type: TOGGLE_SHOW_CHAN_STRIP,
        channel: faderIndex,
    }
}
export const storeShowOptions = (faderIndex: number) => {
    return {
        type: TOGGLE_SHOW_OPTION,
        channel: faderIndex,
    }
}
export const storeShowMonitorOptions = (faderIndex: number) => {
    return {
        type: TOGGLE_SHOW_MONITOR_OPTIONS,
        channel: faderIndex,
    }
}
export const storeShowStorage = () => {
    return {
        type: TOGGLE_SHOW_STORAGE,
    }
}
export const storeUpdateSettings = (settings: any) => {
    return {
        type: UPDATE_SETTINGS,
        settings: settings,
    }
}
export const storeSetMixerOnline = (mixerOnline: boolean) => {
    return {
        type: SET_MIXER_ONLINE,
        mixerOnline: mixerOnline,
    }
}
export const storeSetServerOnline = (serverOnline: boolean) => {
    return {
        type: SET_SERVER_ONLINE,
        serverOnline: serverOnline,
    }
}
export const storeSetPage = (pageType: PageType, id: number | string) => {
    return {
        type: SET_PAGE,
        pageType: pageType,
        id: id,
    }
}
