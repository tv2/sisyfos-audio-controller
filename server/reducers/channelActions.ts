import { IChannel, IChannels } from './channelsReducer'

export const SET_OUTPUT_LEVEL = 'SET_OUTPUT_LEVEL'
export const SET_AUX_LEVEL = 'SET_AUX_LEVEL'
export const SET_COMPLETE_CH_STATE = 'SET_COMPLETE_CH_STATE'
export const SET_SINGLE_CH_STATE = 'SET_SINGLE_CH_STATE'
export const FADE_ACTIVE = 'FADE_ACTIVE'
export const SET_ASSIGNED_FADER = 'SET_ASSIGNED_FADER'
export const SET_PRIVATE = 'SET_PRIVATE'

export const storeSetOutputLevel = (channel: number, level: number) => {
    return {
        type: SET_OUTPUT_LEVEL,
        channel: channel,
        level: level,
    }
}

export const storeSetAuxLevel = (
    channel: number,
    auxIndex: number,
    level: number
) => {
    return {
        type: SET_AUX_LEVEL,
        channel: channel,
        auxIndex: auxIndex,
        level: level,
    }
}

export const storeSetCompleteChState = (
    allState: IChannels,
    numberOfTypeChannels: number[]
) => {
    return {
        type: SET_COMPLETE_CH_STATE,
        allState: allState,
        numberOfTypeChannels: numberOfTypeChannels,
    }
}

export const storeSetSingleChState = (
    channelIndex: number,
    state: IChannel
) => {
    return {
        type: SET_SINGLE_CH_STATE,
        channelIndex: channelIndex,
        state: state,
    }
}

export const storeFadeActive = (channelIndex: number, active: boolean) => {
    return {
        type: FADE_ACTIVE,
        channel: channelIndex,
        active: active,
    }
}

export const storeSetAssignedFader = (channel: number, faderNumber: number) => {
    return {
        type: SET_ASSIGNED_FADER,
        channel: channel,
        faderNumber: faderNumber,
    }
}

export const storeSetChPrivate = (channel: number, tag: string, value: any) => {
    return {
        type: SET_PRIVATE,
        channel: channel,
        tag: tag,
        value: value,
    }
}
