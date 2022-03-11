import { fxParamsList } from '../constants/MixerProtocolInterface'
import { IFader, IFaders } from '../reducers/fadersReducer'

export const SET_VU_REDUCTION_LEVEL = 'SET_REDUCTION_LEVEL'
export const SET_COMPLETE_FADER_STATE = 'SET_COMPLETE_FADER_STATE'
export const SET_SINGLE_FADER_STATE = 'SET_SINGLE_FADER_STATE'
export const SET_FADER_LEVEL = 'SET_FADER_LEVEL'
export const SET_INPUT_GAIN = 'SET_INPUT_GAIN'
export const SET_INPUT_SELECTOR = 'SET_INPUT_SELECTOR'
export const SET_FADER_LABEL = 'SET_FADER_LABEL'
export const SET_USER_LABEL = 'SET_USER_LABEL'
export const SET_FADER_FX = 'SET_FADER_FX'
export const SET_FADER_MONITOR = 'SET_FADER_MONITOR'
export const SET_ASSIGNED_CHANNEL = 'SET_ASSIGNED_CHANNEL'
export const REMOVE_ALL_ASSIGNED_CHANNELS = 'REMOVE_ASSIGNED_CHANNELS'
export const TOGGLE_PGM = 'TOGGLE_PGM'
export const SET_PGM = 'SET_PGM'
export const TOGGLE_VO = 'TOGGLE_VO'
export const SET_VO = 'SET_VO'
export const TOGGLE_SLOW_FADE = 'TOGGLE_SLOW_FADE'
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
export const X_MIX = 'X_MIX'
export const NEXT_MIX = 'NEXT_MIX'
export const FADE_TO_BLACK = 'FADE_TO_BLACK'

export const UPDATE_LABEL_LIST = 'UPDATE_LABEL_LIST'
export const FLUSH_FADER_LABELS = 'FLUSH_FADER_LABELS'
export const CLEAR_PST = 'CLEAR_PST'
export const SNAP_RECALL = 'SNAP_RECALL'
export const SET_CHANNEL_DISABLED = 'SET_CHANNEL_DISABLED'
export const TOGGLE_AMIX = 'TOGGLE_AMIX'
export const SET_AMIX = 'SET_AMIX'
export const SET_CAPABILITY = 'SET_CAPABILITY'
export const TOGGLE_ALL_MANUAL = 'TOGGLE_ALL_MANUAL'

export const storeVuReductionLevel = (faderIndex: number, level: number) => {
    return {
        type: SET_VU_REDUCTION_LEVEL,
        faderIndex: faderIndex,
        level: level,
    }
}

export const storeSetCompleteFaderState = (
    allState: IFaders,
    numberOfTypeChannels: number
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

export const storeFaderLevel = (faderIndex: number, level: number) => {
    return {
        type: SET_FADER_LEVEL,
        faderIndex: faderIndex,
        level: level,
    }
}

export const storeInputGain = (faderIndex: number, level: number) => {
    return {
        type: SET_INPUT_GAIN,
        faderIndex: faderIndex,
        level: level,
    }
}

export const storeInputSelector = (faderIndex: number, selected: number) => {
    return {
        type: SET_INPUT_SELECTOR,
        faderIndex: faderIndex,
        selected: selected,
    }
}

export const storeFaderLabel = (faderIndex: number, label: string) => {
    return {
        type: SET_FADER_LABEL,
        faderIndex: faderIndex,
        label: label,
    }
}

export const storeUserLabel = (faderIndex: number, label: string) => {
    return {
        type: SET_USER_LABEL,
        faderIndex: faderIndex,
        label: label,
    }
}

export const storeFaderFx = (
    fxParam: fxParamsList,
    faderIndex: number,
    level: number
) => {
    return {
        type: SET_FADER_FX,
        fxParam: fxParam,
        faderIndex: faderIndex,
        level: level,
    }
}

export const storeFaderMonitor = (faderIndex: number, auxIndex: number) => {
    return {
        type: SET_FADER_MONITOR,
        faderIndex: faderIndex,
        auxIndex: auxIndex,
    }
}

export const storeTogglePgm = (faderIndex: number) => {
    return {
        type: TOGGLE_PGM,
        faderIndex: faderIndex,
    }
}

export const storeSetPgm = (faderIndex: number, pgmOn: boolean) => {
    return {
        type: SET_PGM,
        faderIndex: faderIndex,
        pgmOn: pgmOn,
    }
}

export const storeToggleVo = (faderIndex: number) => {
    return {
        type: TOGGLE_VO,
        faderIndex: faderIndex,
    }
}

export const storeSetVo = (faderIndex: number, voOn: boolean) => {
    return {
        type: SET_VO,
        faderIndex: faderIndex,
        voOn: voOn,
    }
}

export const storeToggleSlowFade = (faderIndex: number) => {
    return {
        type: TOGGLE_SLOW_FADE,
        faderIndex: faderIndex,
    }
}

export const storeTogglePst = (faderIndex: number) => {
    return {
        type: TOGGLE_PST,
        faderIndex: faderIndex,
    }
}

export const storeSetPst = (faderIndex: number, pstOn: boolean) => {
    return {
        type: SET_PST,
        faderIndex: faderIndex,
        pstOn: pstOn,
    }
}

export const storeSetPstVo = (faderIndex: number, pstVoOn: boolean) => {
    return {
        type: SET_PST_VO,
        faderIndex: faderIndex,
        pstVoOn: pstVoOn,
    }
}

export const storeTogglePfl = (faderIndex: number) => {
    return {
        type: TOGGLE_PFL,
        faderIndex: faderIndex,
    }
}

export const storeSetPfl = (faderIndex: number, pflOn: boolean) => {
    return {
        type: SET_PFL,
        faderIndex: faderIndex,
        pflOn: pflOn,
    }
}

export const storeToggleMute = (faderIndex: number) => {
    return {
        type: TOGGLE_MUTE,
        faderIndex: faderIndex,
    }
}

export const storeSetMute = (faderIndex: number, muteOn: boolean) => {
    return {
        type: SET_MUTE,
        faderIndex: faderIndex,
        muteOn: muteOn,
    }
}

export const storeShowChannel = (faderIndex: number, showChannel: boolean) => {
    return {
        type: SHOW_CHANNEL,
        faderIndex: faderIndex,
        showChannel: showChannel,
    }
}

export const storeShowInMiniMonitor = (
    faderIndex: number,
    showInMiniMonitor: boolean
) => {
    return {
        type: SHOW_IN_MINI_MONITOR,
        faderIndex: faderIndex,
        showInMiniMonitor: showInMiniMonitor,
    }
}

export const storeToggleIgnoreAutomation = (faderIndex: number) => {
    return {
        type: IGNORE_AUTOMATION,
        faderIndex: faderIndex,
    }
}

export const storeXmix = () => {
    return {
        type: X_MIX,
    }
}

export const storeNextMix = () => {
    return {
        type: NEXT_MIX,
    }
}

export const storeFadeToBlack = () => {
    return {
        type: FADE_TO_BLACK,
    }
}

export const storeClearPst = () => {
    return {
        type: CLEAR_PST,
    }
}

export const storeChannelDisabled = (faderIndex: number, disabled: boolean) => {
    return {
        type: SET_CHANNEL_DISABLED,
        faderIndex: faderIndex,
        disabled: disabled,
    }
}

export const storeToggleAMix = (faderIndex: number) => {
    return {
        type: TOGGLE_AMIX,
        faderIndex: faderIndex,
    }
}

export const storeSetAMix = (faderIndex: number, state: boolean) => {
    return {
        type: SET_AMIX,
        faderIndex: faderIndex,
        state: state,
    }
}

export const removeAllAssignedChannels = () => {
    return {
        type: REMOVE_ALL_ASSIGNED_CHANNELS,
    }
}

export const storeSetAssignedChannel = (
    faderIndex: number,
    mixerIndex: number,
    channelIndex: number,
    assigned: boolean
) => {
    return {
        type: SET_ASSIGNED_CHANNEL,
        faderIndex: faderIndex,
        mixerIndex: mixerIndex,
        channelIndex: channelIndex,
        assigned: assigned,
    }
}

export const storeCapability = (
    faderIndex: number,
    capability: string,
    enabled: boolean
) => {
    return {
        type: SET_CAPABILITY,
        faderIndex: faderIndex,
        capability: capability,
        enabled: enabled,
    }
}

export const storeAllManual = () => {
    return {
        type: TOGGLE_ALL_MANUAL,
    }
}

export const updateLabels = (update: Record<number, string>) => {
    return {
        type: UPDATE_LABEL_LIST,
        update,
    }
}

export const flushExtLabels = () => {
    return {
        type: FLUSH_FADER_LABELS,
    }
}
