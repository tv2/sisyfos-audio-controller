import { ICustomPages, PageType } from '../reducers/settingsReducer'

export const TOGGLE_SHOW_SETTINGS = 'TOGGLE_SHOW_SETTINGS'
export const TOGGLE_SHOW_PAGES_SETUP = 'TOGGLE_SHOW_PAGES_SETUP'
export const TOGGLE_SHOW_LABEL_SETTINGS = 'TOGGLE_SHOW_LABEL_SETTINGS'
export const TOGGLE_SHOW_CHAN_STRIP = 'TOGGLE_SHOW_CHAN_STRIP'
export const TOGGLE_SHOW_CHAN_STRIP_FULL = 'TOGGLE_SHOW_CHAN_STRIP_FULL'
export const TOGGLE_SHOW_OPTION = 'TOGGLE_SHOW_OPTION'
export const TOGGLE_SHOW_MONITOR_OPTIONS = 'TOGGLE_SHOW_MONITOR_OPTIONS'
export const TOGGLE_SHOW_STORAGE = 'TOGGLE_SHOW_STORAGE'
export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'
export const SET_MIXER_ONLINE = 'SET_MIXER_ONLINE'
export const SET_SERVER_ONLINE = 'SET_SERVER_ONLINE'
export const SET_PAGE = 'SET_PAGE'
export const SET_PAGES_LIST = 'SET_PAGES_LIST'

export const storeShowSettings = () => {
    return {
        type: TOGGLE_SHOW_SETTINGS,
    }
}
export const storeShowPagesSetup = () => {
    return {
        type: TOGGLE_SHOW_PAGES_SETUP,
    }
}
export const storeShowLabelSetup = () => {
    return {
        type: TOGGLE_SHOW_LABEL_SETTINGS,
    }
}
export const storeShowChanStrip = (faderIndex: number) => {
    return {
        type: TOGGLE_SHOW_CHAN_STRIP,
        channel: faderIndex,
    }
}
export const storeShowChanStripFull = (faderIndex: number) => {
    return {
        type: TOGGLE_SHOW_CHAN_STRIP_FULL,
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
export const storeUpdatePagesList = (customPages: ICustomPages[]) => {
    return {
        type: SET_PAGES_LIST,
        customPages: customPages,
    }
}
export const storeSetMixerOnline = (
    mixerIndex: number,
    mixerOnline: boolean
) => {
    return {
        type: SET_MIXER_ONLINE,
        mixerIndex: mixerIndex,
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
    if (typeof id === 'string') {
        return {
            type: SET_PAGE,
            pageType: pageType,
            id: id,
            start: 0,
        }
    } else {
        return {
            type: SET_PAGE,
            pageType: pageType,
            id: '',
            start: id,
        }
    }
}
