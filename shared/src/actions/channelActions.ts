import {
  IChannel,
  IChannels,
  InumberOfChannels,
} from '../reducers/channelsReducer'

export enum ChannelActionTypes {
  SET_OUTPUT_LEVEL = 'SET_OUTPUT_LEVEL',
  SET_AUX_LEVEL = 'SET_AUX_LEVEL',
  SET_COMPLETE_CH_STATE = 'SET_COMPLETE_CH_STATE',
  SET_SINGLE_CH_STATE = 'SET_SINGLE_CH_STATE',
  FADE_ACTIVE = 'FADE_ACTIVE',
  SET_ASSIGNED_FADER = 'SET_ASSIGNED_FADER',
  SET_PRIVATE = 'SET_PRIVATE',
  SET_CHANNEL_LABEL = 'SET_CHANNEL_LABEL',
  FLUSH_CHANNEL_LABELS = 'FLUSH_CHANNEL_LABELS',
}

export type ChannelActions =
  | {
        type: ChannelActionTypes.SET_OUTPUT_LEVEL
        mixerIndex: number
        channel: number
        level: number
    }
  | {
        type: ChannelActionTypes.SET_COMPLETE_CH_STATE
        numberOfTypeChannels: InumberOfChannels[]
        allState: IChannels
    }
  | {
        type: ChannelActionTypes.SET_SINGLE_CH_STATE
        channelIndex: number
        state: IChannel
    }
  | {
        type: ChannelActionTypes.FADE_ACTIVE
        mixerIndex: number
        channel: number
        active: boolean
    }
  | {
        type: ChannelActionTypes.SET_ASSIGNED_FADER
        mixerIndex: number
        channel: number
        faderNumber: number
    }
  | {
        type: ChannelActionTypes.SET_AUX_LEVEL
        mixerIndex: number
        channel: number
        auxIndex: number
        level: number
    }
  | {
        type: ChannelActionTypes.SET_PRIVATE
        mixerIndex: number
        channel: number
        tag: string
        value: string
    }
  | {
        type: ChannelActionTypes.SET_CHANNEL_LABEL
        mixerIndex: number
        channel: number
        label: string
    }
  | { type: ChannelActionTypes.FLUSH_CHANNEL_LABELS }