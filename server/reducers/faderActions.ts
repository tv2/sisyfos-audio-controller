import { IFaders } from './fadersReducer'

export const SET_VU_LEVEL = 'SET_VU_LEVEL'
export const SET_VU_REDUCTION_LEVEL = 'SET_REDUCTION_LEVEL'
export const SET_COMPLETE_FADER_STATE = 'SET_COMPLETE_FADER_STATE'
export const SET_SINGLE_FADER_STATE = 'SET_SINGLE_FADER_STATE'
export const SET_FADER_LEVEL = 'SET_FADER_LEVEL'
export const SET_INPUT_GAIN = 'SET_INPUT_GAIN'
export const SET_INPUT_SELECTOR = 'SET_INPUT_SELECTOR'
export const SET_ALL_VU_LEVELS = 'SET_ALL_VU_LEVELS'
export const SET_CHANNEL_LABEL = 'SET_CHANNEL_LABEL'
export const SET_FADER_THRESHOLD = 'SET_FADER_THRESHOLD'
export const SET_FADER_RATIO = 'SET_FADER_RATIO'
export const SET_FADER_DELAY_TIME = 'SET_FADER_DELAY_TIME'
export const SET_FADER_LOW = 'SET_FADER_LOW'
export const SET_FADER_LO_MID = 'SET_FADER_LO_MID'
export const SET_FADER_MID = 'SET_FADER_MID'
export const SET_FADER_HIGH = 'SET_FADER_HIGH'
export const SET_FADER_MONITOR = 'SET_FADER_MONITOR'
export const TOGGLE_PGM = 'TOGGLE_PGM'
export const SET_PGM = 'SET_PGM'
export const TOGGLE_VO = 'TOGGLE_VO'
export const SET_VO = 'SET_VO'
export const TOGGLE_PST = 'TOGGLE_PST'
export const SET_PST = 'SET_PST'
export const SET_PST_VO = 'SET_PST_VO'
export const TOGGLE_PFL = 'TOGGLE_PFL'
export const SET_PFL = 'SET_PFL'
export const TOGGLE_MUTE = 'TOGGLE_MUTE'
export const SET_MUTE = 'SET_MUTE'
export const SHOW_CHANNEL = 'SHOW_CHANNEL'
export const SHOW_IN_MINI_MONITOR = 'SHOW_IN_MINI_MONITOR'
export const IGNORE_AUTOMATION = 'IGNORE_AUTOMATION'
export const TOGGLE_SNAP = 'TOGGLE_SNAP'
export const X_MIX = 'X_MIX'
export const NEXT_MIX = 'NEXT_MIX'
export const FADE_TO_BLACK = 'FADE_TO_BLACK'
export const CLEAR_PST = 'CLEAR_PST'
export const SNAP_RECALL = 'SNAP_RECALL'
export const SET_CHANNEL_DISABLED = 'SET_CHANNEL_DISABLED'
export const TOGGLE_AMIX = 'TOGGLE_AMIX'
export const SET_AMIX = 'SET_AMIX'
export const SET_CAPABILITY = 'SET_CAPABILITY'
export const TOGGLE_ALL_MANUAL = 'TOGGLE_ALL_MANUAL'

export const storeVuLevel = (channel: number, level: number) => {
    return {
        type: SET_VU_LEVEL,
        channel: channel,
        level: level,
    }
}

export const storeVuReductionLevel = (channel: number, level: number) => {
    return {
        type: SET_VU_REDUCTION_LEVEL,
        channel: channel,
        level: level,
    }
}

export const storeSetCompleteFaderState = (
    numberOfTypeChannels: number,
    allState: IFaders
) => {
    return {
        type: SET_COMPLETE_FADER_STATE,
        numberOfTypeChannels: numberOfTypeChannels,
        allState: allState,
    }
}
