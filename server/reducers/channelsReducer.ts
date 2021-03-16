import {
    SET_OUTPUT_LEVEL,
    SET_ASSIGNED_FADER,
    SET_COMPLETE_CH_STATE,
    SET_PRIVATE,
    FADE_ACTIVE,
    SET_AUX_LEVEL,
    SET_SINGLE_CH_STATE,
} from './channelActions'

export interface IChannels {
    chMixerConnection: IchMixerConnection[]
}

export interface IchMixerConnection {
    channel: Array<IChannel>
}

export interface IChannel {
    channelType: number
    channelTypeIndex: number
    assignedFader: number
    fadeActive: boolean
    outputLevel: number
    auxLevel: number[]
    private?: {
        [key: string]: string
    }
}

export interface InumberOfChannels {
    numberOfTypeInCh: number[]
}

const defaultChannelsReducerState = (
    numberOfChannels: InumberOfChannels[]
): IChannels[] => {
    let defaultObj: IChannels[] = [
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
    action: any
): Array<IChannels> => {
    let nextState = [
        {
            chConnection: [...state[0].chMixerConnection],
        },
    ]

    switch (action.type) {
        case SET_OUTPUT_LEVEL:
            nextState[0].chConnection[action.mixerIndex].channel[
                action.channel
            ].outputLevel = parseFloat(action.level)
            return nextState
        case SET_COMPLETE_CH_STATE:
            nextState = defaultChannelsReducerState(action.numberOfTypeChannels)

            nextState[0].chConnection.forEach(
                (chConnection: IchMixerConnection, mixerIndex: number) => {
                    chConnection.channel.forEach(
                        (channel: any, index: number) => {
                            if (
                                index <
                                action.allState.chConnection[mixerIndex]
                                    ?.channel.length
                            ) {
                                nextState[0].chConnection[mixerIndex].channel[
                                    index
                                ] =
                                    action.allState.chConnection[
                                        mixerIndex
                                    ].channel[index]
                            }
                        }
                    )
                }
            )

            return nextState
        case SET_SINGLE_CH_STATE:
            nextState[0].chConnection[0].channel[action.channelIndex] =
                action.state
            return nextState
        case FADE_ACTIVE:
            nextState[0].chConnection[action.mixerIndex].channel[
                action.channel
            ].fadeActive = !!action.active
            return nextState
        case SET_ASSIGNED_FADER:
            nextState[0].chConnection[action.mixerIndex].channel[
                action.channel
            ].assignedFader = action.faderNumber
            return nextState
        case SET_AUX_LEVEL:
            nextState[0].chConnection[action.mixerIndex].channel[
                action.channel
            ].auxLevel[action.auxIndex] = parseFloat(action.level)
            return nextState
        case SET_PRIVATE:
            if (!nextState[0].chConnection[0].channel[action.channel].private) {
                nextState[0].chConnection[0].channel[
                    action.channel
                ].private = {}
            }
            nextState[0].chConnection[0].channel[action.channel].private![
                action.tag
            ] = action.value
            return nextState
        default:
            return nextState
    }
}
