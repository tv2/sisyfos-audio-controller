import { IFader, IFaders } from './fadersReducer'

export const SET_VU_LEVEL = 'SET_VU_LEVEL'
export const SET_VU_REDUCTION_LEVEL = 'SET_REDUCTION_LEVEL'
export const SET_COMPLETE_FADER_STATE = 'SET_COMPLETE_FADER_STATE'
export const SET_SINGLE_FADER_STATE = 'SET_SINGLE_FADER_STATE'
export const SET_FADER_LEVEL = 'SET_FADER_LEVEL'
export const SET_INPUT_GAIN = 'SET_INPUT_GAIN'
export const SET_INPUT_SELECTOR = 'SET_INPUT_SELECTOR'
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

export const storeSetSingleFaderState = (faderIndex: number, state: IFader) => {
    return {
        type: SET_SINGLE_FADER_STATE,
        faderIndex: faderIndex,
        state: state,
    }
}

export const storeFaderLevel = (channel: number, level: number) => {
    return {
        type: SET_FADER_LEVEL,
        channel: channel,
        level: level,
    }
}

export const storeInputGain = (channel: number, level: number) => {
    return {
        type: SET_INPUT_GAIN,
        channel: channel,
        level: level,
    }
}

export const storeInputSelector = (channel: number, level: number) => {
    return {
        type: SET_INPUT_SELECTOR,
        channel: channel,
        selected: level,
    }
}

export const storeFaderLabel = (channel: number, label: string) => {
    return {
        type: SET_CHANNEL_LABEL,
        channel: channel,
        label: label,
    }
}

export const storeFaderThreshold = (channel: number, level: number) => {
    return {
        type: SET_FADER_THRESHOLD,
        channel: channel,
        level: level,
    }
}

export const storeFaderRatio = (channel: number, level: number) => {
    return {
        type: SET_FADER_RATIO,
        channel: channel,
        level: level,
    }
}

export const storeFaderDelayTime = (channel: number, delayTime: number) => {
    return {
        type: SET_FADER_DELAY_TIME,
        channel: channel,
        delayTime: delayTime,
    }
}

export const storeFaderLow = (channel: number, level: number) => {
    return {
        type: SET_FADER_LOW,
        channel: channel,
        level: level,
    }
}

export const storeFaderLoMid = (channel: number, level: number) => {
    return {
        type: SET_FADER_LO_MID,
        channel: channel,
        level: level,
    }
}

export const storeFaderMid = (channel: number, level: number) => {
    return {
        type: SET_FADER_MID,
        channel: channel,
        level: level,
    }
}

export const storeFaderHigh = (channel: number, level: number) => {
    return {
        type: SET_FADER_HIGH,
        channel: channel,
        level: level,
    }
}

export const storeFaderMonitor = (channel: number, auxIndex: number) => {
    return {
        type: SET_FADER_MONITOR,
        channel: channel,
        auxIndex: auxIndex,
    }
}

export const storeTogglePgm = (channel: number) => {
    return {
        type: TOGGLE_PGM,
        channel: channel,
    }
}

export const storeSetPgm = (channel: number, pgmOn: boolean) => {
    return {
        type: SET_PGM,
        channel: channel,
        pgmOn: pgmOn,
    }
}

export const storeToggleVo = (channel: number) => {
    return {
        type: TOGGLE_VO,
        channel: channel,
    }
}

export const storeSetVo = (channel: number, voOn: boolean) => {
    return {
        type: SET_VO,
        channel: channel,
        voOn: voOn,
    }
}

export const storeTogglePst = (channel: number) => {
    return {
        type: TOGGLE_PST,
        channel: channel,
    }
}

export const storeSetPst = (channel: number, pstOn: boolean) => {
    return {
        type: SET_PST,
        channel: channel,
        pstOn: pstOn,
    }
}

export const storeSetPstVo = (channel: number, pstVoOn: boolean) => {
    return {
        type: SET_PST_VO,
        channel: channel,
        pstVoOn: pstVoOn,
    }
}

export const storeTogglePfl = (channel: number) => {
    return {
        type: TOGGLE_PFL,
        channel: channel,
    }
}

export const storeSetPfl = (channel: number, pflOn: boolean) => {
    return {
        type: SET_PFL,
        channel: channel,
        pflOn: pflOn,
    }
}

export const storeToggleMute = (channel: number) => {
    return {
        type: TOGGLE_MUTE,
        channel: channel,
    }
}

export const storeSetMute = (channel: number, muteOn: boolean) => {
    return {
        type: SET_MUTE,
        channel: channel,
        muteOn: muteOn,
    }
}
