import {
    ChannelActions,
    ChannelActionTypes,
} from '../actions/channelActions'

export interface Channels {
    chMixerConnection: ChMixerConnection[]
}

export interface ChMixerConnection {
    channel: Array<Channel>
}

export interface Channel {
    channelType: number
    channelTypeIndex: number
    assignedFader: number
    label?: string
    fadeActive: boolean
    outputLevel: number
    auxLevel: number[]
    private?: {
        [key: string]: string
    }
}

export interface NumberOfChannels {
    numberOfTypeInCh: number[]
}

export const defaultChannelsReducerState = (
    numberOfChannels: NumberOfChannels[]
): Channels[] => {
    let defaultObj: Channels[] = [
        {
            chMixerConnection: [],
        },
    ]

    for (
        let mixerIndex = 0;
        mixerIndex < numberOfChannels.length;
        mixerIndex++
    ) {
        let totalNumberOfChannels = 0
        defaultObj[0].chMixerConnection.push({ channel: [] })
        numberOfChannels[mixerIndex].numberOfTypeInCh.forEach(
            (channelTypeSize: any, typeIndex: number) => {
                for (let index = 0; index < channelTypeSize; index++) {
                    defaultObj[0].chMixerConnection[mixerIndex].channel[
                        totalNumberOfChannels
                    ] = {
                        channelType: typeIndex,
                        channelTypeIndex: index,
                        assignedFader: totalNumberOfChannels,
                        fadeActive: false,
                        outputLevel: 0.0,
                        auxLevel: [],
                    }
                    totalNumberOfChannels++
                }
            }
        )
    }

    return defaultObj
}

export const channels = (
    state = defaultChannelsReducerState([{ numberOfTypeInCh: [1] }]),
    action: ChannelActions
): Array<Channels> => {
    let nextState = [
        {
            chMixerConnection: [...state[0].chMixerConnection],
        },
    ]

    if ('mixerIndex' in action && nextState[0].chMixerConnection[action.mixerIndex] === undefined) {
        return nextState
    }
    if ('mixerIndex' in action && 'channel' in action && nextState[0].chMixerConnection[action.mixerIndex]?.channel[action.channel] === undefined) {
        return nextState
    }

    switch (action.type) {
        case ChannelActionTypes.SET_OUTPUT_LEVEL:
            nextState[0].chMixerConnection[action.mixerIndex].channel[
                action.channel
            ].outputLevel = action.level
            return nextState
        case ChannelActionTypes.SET_COMPLETE_CH_STATE:
            nextState = defaultChannelsReducerState(action.numberOfTypeChannels)

            nextState[0].chMixerConnection.forEach(
                (chMixerConnection: ChMixerConnection, mixerIndex: number) => {
                    chMixerConnection.channel.forEach(
                        (channel: any, index: number) => {
                            if (
                                index <
                                action.allState.chMixerConnection[mixerIndex]
                                    ?.channel.length
                            ) {
                                nextState[0].chMixerConnection[
                                    mixerIndex
                                ].channel[index] =
                                    action.allState.chMixerConnection[
                                        mixerIndex
                                    ].channel[index]
                            }
                        }
                    )
                }
            )

            return nextState
        case ChannelActionTypes.SET_SINGLE_CH_STATE:
            nextState[0].chMixerConnection[0].channel[action.channelIndex] =
                action.state
            return nextState
        case ChannelActionTypes.FADE_ACTIVE:
            nextState[0].chMixerConnection[action.mixerIndex].channel[
                action.channel
            ].fadeActive = !!action.active
            return nextState
        case ChannelActionTypes.SET_ASSIGNED_FADER:
            if (nextState[0].chMixerConnection[action.mixerIndex].channel.length > action.channel) {
                nextState[0].chMixerConnection[action.mixerIndex].channel[
                    action.channel
                ].assignedFader = action.faderNumber
            }
            return nextState
        case ChannelActionTypes.SET_AUX_LEVEL:
            let auxLevels =
                nextState[0].chMixerConnection[action.mixerIndex].channel[
                    action.channel
                ].auxLevel
            if (action.auxIndex >= auxLevels.length) {
                for (let i = 0; i < action.auxIndex; i++) {
                    if (auxLevels[i] === null) {
                        auxLevels[action.auxIndex] = -1
                    }
                }
            }
            auxLevels[action.auxIndex] = action.level
            nextState[0].chMixerConnection[action.mixerIndex].channel[
                action.channel
            ].auxLevel = auxLevels
            return nextState
        case ChannelActionTypes.SET_PRIVATE:
            if (
                !nextState[0].chMixerConnection[action.mixerIndex].channel[
                    action.channel
                ].private
            ) {
                nextState[0].chMixerConnection[action.mixerIndex].channel[
                    action.channel
                ].private = {}
            }
            nextState[0].chMixerConnection[action.mixerIndex].channel[
                action.channel
            ].private![action.tag] = action.value
            return nextState
        case ChannelActionTypes.SET_CHANNEL_LABEL:
            nextState[0].chMixerConnection[action.mixerIndex].channel[
                action.channel
            ].label = action.label
            return nextState
        case ChannelActionTypes.FLUSH_CHANNEL_LABELS:
            for (const mixer of nextState[0].chMixerConnection) {
                for (const ch of mixer.channel) {
                    ch.label = undefined
                }
            }
            return nextState
        default:
            return nextState
    }
}