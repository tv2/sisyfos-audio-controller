import { fxParamsList } from '../constants/MixerProtocolInterface'
import { IFader, IFaders } from './fadersReducer'

export const SET_VU_LEVEL = 'SET_VU_LEVEL'
export const SET_VU_REDUCTION_LEVEL = 'SET_REDUCTION_LEVEL'
export const SET_COMPLETE_FADER_STATE = 'SET_COMPLETE_FADER_STATE'
export const SET_SINGLE_FADER_STATE = 'SET_SINGLE_FADER_STATE'
export const SET_FADER_LEVEL = 'SET_FADER_LEVEL'
export const SET_INPUT_GAIN = 'SET_INPUT_GAIN'
export const SET_INPUT_SELECTOR = 'SET_INPUT_SELECTOR'
export const SET_CHANNEL_LABEL = 'SET_CHANNEL_LABEL'
export const SET_FADER_FX = 'SET_FADER_FX'
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

export const storeInputSelector = (channel: number, selected: number) => {
    return {
        type: SET_INPUT_SELECTOR,
        channel: channel,
        selected: selected,
    }
}

export const storeFaderLabel = (channel: number, label: string) => {
    return {
        type: SET_CHANNEL_LABEL,
        channel: channel,
        label: label,
    }
}

export const storeFaderFx = (
    fxParam: fxParamsList,
    channel: number,
    level: number
) => {
    return {
        type: SET_FADER_FX,
        fxParam: fxParam,
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

export const storeShowChannel = (channel: number, showChannel: boolean) => {
    return {
        type: SHOW_CHANNEL,
        channel: channel,
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

export const storeToggleIgnoreAutomation = (channel: number) => {
    return {
        type: IGNORE_AUTOMATION,
        channel: channel,
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

export const storeChannelDisabled = (channel: number, disabled: boolean) => {
    return {
        type: SET_CHANNEL_DISABLED,
        channel: channel,
        disabled: disabled,
    }
}

export const storeToggleAMix = (channel: number) => {
    return {
        type: TOGGLE_AMIX,
        channel: channel,
    }
}

export const storeSetAMix = (channel: number, state: boolean) => {
    return {
        type: SET_AMIX,
        channel: channel,
        state: state,
    }
}

export const storeCapability = (
    channel: number,
    capability: string,
    enabled: boolean
) => {
    return {
        type: SET_CAPABILITY,
        channel: channel,
        capability: capability,
        enabled: enabled,
    }
}

export const storeAllManual = () => {
    return {
        type: TOGGLE_ALL_MANUAL,
    }
}
