import * as FADER_ACTIONS from '../actions/faderActions'
export interface IFaders {
    fader: Array<IFader>
    vuMeters: Array<IVuMeters>
}

export interface IChannelReference {
    mixerIndex: number
    channelIndex: number
}

export interface IFader {
    faderLevel: number
    inputGain: number
    inputSelector: number
    label: string
    userLabel?: string
    pgmOn: boolean
    voOn: boolean
    slowFadeOn: boolean
    pstOn: boolean
    pstVoOn: boolean
    pflOn: boolean
    muteOn: boolean
    amixOn: boolean
    [fxparam: number]: Array<number>
    monitor: number
    showChannel: boolean
    showInMiniMonitor: boolean
    ignoreAutomation: boolean
    disabled: boolean
    assignedChannels?: IChannelReference[]

    /**
     * Assuming that the protocol has a "feature", can it be enabled on this fader?
     * If the capibilities object does not exist, yes is assumed.
     */
    capabilities?: {
        hasAMix?: boolean
        hasInputSelector?: boolean
    }
}

export interface IVuMeters {
    reductionVal: number
}

export const defaultFadersReducerState = (
    numberOfFaders: number
): IFaders[] => {
    let defaultObj: Array<IFaders> = [
        {
            fader: [],
            vuMeters: [],
        },
    ]

    for (let index = 0; index < numberOfFaders; index++) {
        defaultObj[0].fader[index] = {
            faderLevel: 0.75,
            inputGain: 0.75,
            inputSelector: 1,
            label: '',
            pgmOn: false,
            voOn: false,
            slowFadeOn: false,
            pstOn: false,
            pstVoOn: false,
            pflOn: false,
            muteOn: false,
            amixOn: false,
            monitor: index + 1, // route fader - aux 1:1 as default
            showChannel: true,
            showInMiniMonitor: false,
            ignoreAutomation: false,
            disabled: false,
        }
        defaultObj[0].vuMeters.push({
            reductionVal: 0.0,
        })
    }
    return defaultObj
}

export const faders = (
    state = defaultFadersReducerState(0),
    action: any
): Array<IFaders> => {
    let nextState = [
        {
            vuMeters: [...state[0].vuMeters],
            fader: [...state[0].fader],
        },
    ]
    if (
        action.faderIndex &&
        (action.faderIndex < 0 ||
            action.faderIndex >= nextState[0].fader.length)
    ) {
        return nextState
    }

    switch (action.type) {
        case FADER_ACTIONS.SET_VU_REDUCTION_LEVEL:
            if (
                typeof nextState[0].vuMeters[action.faderIndex] !== 'undefined'
            ) {
                nextState[0].vuMeters[
                    action.faderIndex
                ].reductionVal = parseFloat(action.level)
            }
            return nextState
        case FADER_ACTIONS.SET_COMPLETE_FADER_STATE:
            nextState = defaultFadersReducerState(action.numberOfTypeChannels)
            action.allState.fader.forEach((fader: any, index: number) => {
                if (index < nextState[0].fader.length) {
                    nextState[0].fader[index] = fader
                }
            })
            return nextState
        case FADER_ACTIONS.SET_SINGLE_FADER_STATE:
            nextState[0].fader[action.faderIndex] = action.state
            return nextState
        case FADER_ACTIONS.SET_FADER_LEVEL:
            nextState[0].fader[action.faderIndex].faderLevel = parseFloat(
                action.level
            )
            return nextState
        case FADER_ACTIONS.SET_INPUT_GAIN:
            nextState[0].fader[action.faderIndex].inputGain = parseFloat(
                action.level
            )
            return nextState
        case FADER_ACTIONS.SET_INPUT_SELECTOR:
            nextState[0].fader[action.faderIndex].inputSelector = parseFloat(
                action.selected
            )
            return nextState
        case FADER_ACTIONS.SET_FADER_FX:
            if (!nextState[0].fader[action.faderIndex][action.fxParam]) {
                nextState[0].fader[action.faderIndex][action.fxParam] = []
            }
            nextState[0].fader[action.faderIndex][
                action.fxParam
            ][0] = parseFloat(action.level ?? 0)
            return nextState
        case FADER_ACTIONS.SET_FADER_MONITOR:
            nextState[0].fader[action.faderIndex].monitor = action.auxIndex
            return nextState
        case FADER_ACTIONS.SET_FADER_LABEL:
            if (!nextState[0].fader[action.faderIndex]) return nextState
            nextState[0].fader[action.faderIndex].label = action.label
            return nextState
        case FADER_ACTIONS.TOGGLE_PGM:
            nextState[0].fader[action.faderIndex].pgmOn = !nextState[0].fader[
                action.faderIndex
            ].pgmOn
            nextState[0].fader[action.faderIndex].voOn = false
            return nextState
        case FADER_ACTIONS.SET_PGM:
            nextState[0].fader[action.faderIndex].pgmOn = !!action.pgmOn
            nextState[0].fader[action.faderIndex].voOn = false
            return nextState
        case FADER_ACTIONS.TOGGLE_VO:
            nextState[0].fader[action.faderIndex].voOn = !nextState[0].fader[
                action.faderIndex
            ].voOn
            nextState[0].fader[action.faderIndex].pgmOn = false
            return nextState
        case FADER_ACTIONS.SET_VO:
            nextState[0].fader[action.faderIndex].voOn = !!action.voOn
            nextState[0].fader[action.faderIndex].pgmOn = false
            return nextState
        case FADER_ACTIONS.TOGGLE_SLOW_FADE:
            nextState[0].fader[action.faderIndex].slowFadeOn = !nextState[0]
                .fader[action.faderIndex].slowFadeOn
            return nextState
        case FADER_ACTIONS.TOGGLE_PST:
            if (nextState[0].fader[action.faderIndex].pstOn) {
                nextState[0].fader[action.faderIndex].pstOn = false
                // Disable toggle to pstVoOn, to enable change pstVoOn: true here:
                nextState[0].fader[action.faderIndex].pstVoOn = false
            } else if (nextState[0].fader[action.faderIndex].pstVoOn) {
                nextState[0].fader[action.faderIndex].pstOn = false
                nextState[0].fader[action.faderIndex].pstVoOn = false
            } else {
                nextState[0].fader[action.faderIndex].pstOn = true
                nextState[0].fader[action.faderIndex].pstVoOn = false
            }
            return nextState
        case FADER_ACTIONS.SET_PST:
            nextState[0].fader[action.faderIndex].pstOn = !!action.pstOn
            nextState[0].fader[action.faderIndex].pstVoOn = false
            return nextState
        case FADER_ACTIONS.SET_PST_VO:
            nextState[0].fader[action.faderIndex].pstVoOn = !!action.pstVoOn
            nextState[0].fader[action.faderIndex].pstOn = false
            return nextState
        case FADER_ACTIONS.TOGGLE_PFL:
            nextState[0].fader[action.faderIndex].pflOn = !nextState[0].fader[
                action.faderIndex
            ].pflOn
            return nextState
        case FADER_ACTIONS.SET_PFL:
            nextState[0].fader[action.faderIndex].pflOn = !!action.pflOn
            return nextState
        case FADER_ACTIONS.TOGGLE_MUTE:
            nextState[0].fader[action.faderIndex].muteOn = !nextState[0].fader[
                action.faderIndex
            ].muteOn
            return nextState
        case FADER_ACTIONS.SET_MUTE:
            nextState[0].fader[action.faderIndex].muteOn = !!action.muteOn
            return nextState
        case FADER_ACTIONS.SHOW_CHANNEL:
            nextState[0].fader[
                action.faderIndex
            ].showChannel = !!action.showChannel
            return nextState
        case FADER_ACTIONS.SHOW_IN_MINI_MONITOR: //faderIndexz // showInMiniMonitor
            nextState[0].fader[
                action.faderIndex
            ].showInMiniMonitor = !!action.showInMiniMonitor
            return nextState
        case FADER_ACTIONS.IGNORE_AUTOMATION: //channel // ignoreAutomation
            nextState[0].fader[
                action.faderIndex
            ].ignoreAutomation = !nextState[0].fader[action.faderIndex]
                .ignoreAutomation
            return nextState
        case FADER_ACTIONS.X_MIX: //none
            nextState[0].fader.forEach((item, index) => {
                if (!state[0].fader[index].ignoreAutomation) {
                    let nextPgmOn = state[0].fader[index].pstOn
                    let nextVoOn = state[0].fader[index].pstVoOn
                    nextState[0].fader[index].pstOn =
                        state[0].fader[index].pgmOn
                    nextState[0].fader[index].pstVoOn =
                        state[0].fader[index].voOn
                    nextState[0].fader[index].pgmOn = nextPgmOn
                    nextState[0].fader[index].voOn = nextVoOn
                }
            })
            return nextState
        case FADER_ACTIONS.NEXT_MIX: //none
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pgmOn = state[0].fader[index].pstOn
                nextState[0].fader[index].voOn = state[0].fader[index].pstVoOn
                nextState[0].fader[index].pstOn = false
                nextState[0].fader[index].pstVoOn = false
            })
            return nextState
        case FADER_ACTIONS.FADE_TO_BLACK: //none
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pgmOn = false
                nextState[0].fader[index].voOn = false
            })
            return nextState
        case FADER_ACTIONS.CLEAR_PST: //none
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pstOn = false
                nextState[0].fader[index].pstVoOn = false
            })
            return nextState
        case FADER_ACTIONS.SET_CHANNEL_DISABLED:
            if (!nextState[0].fader[action.faderIndex]) return nextState
            nextState[0].fader[action.faderIndex].disabled = action.disabled
            return nextState
        case FADER_ACTIONS.TOGGLE_AMIX: //channel
            nextState[0].fader[action.faderIndex].amixOn = !nextState[0].fader[
                action.faderIndex
            ].amixOn
            return nextState
        case FADER_ACTIONS.SET_AMIX: //channel
            nextState[0].fader[action.faderIndex].amixOn = action.state
            return nextState
        case FADER_ACTIONS.REMOVE_ALL_ASSIGNED_CHANNELS: //channel
            nextState[0].fader.forEach((fader) => {
                fader.assignedChannels = []
            })
            return nextState
        case FADER_ACTIONS.SET_ASSIGNED_CHANNEL:
            let newAssignments: IChannelReference[] =
                nextState[0].fader[action.faderIndex].assignedChannels || []

            if (action.assigned) {
                if (
                    !newAssignments.some((channel) => {
                        return (channel.mixerIndex === action.mixerIndex &&
                            channel.channelIndex === action.channelIndex)
                    })
                ) {
                    newAssignments.push({
                        mixerIndex: action.mixerIndex,
                        channelIndex: action.channelIndex,
                    })
                    newAssignments.sort(
                        (n1: IChannelReference, n2: IChannelReference) =>
                            n1.channelIndex - n2.channelIndex
                    )
                    newAssignments.sort(
                        (n1: IChannelReference, n2: IChannelReference) =>
                            n1.mixerIndex - n2.mixerIndex
                    )
                }
            } else {
                newAssignments = newAssignments.filter((channel: IChannelReference) => {
                    return !(
                        channel.channelIndex === action.channelIndex &&
                        channel.mixerIndex === action.mixerIndex
                    )
                })
            }

            nextState[0].fader[action.faderIndex].assignedChannels =
                newAssignments
            return nextState
        case FADER_ACTIONS.SET_CAPABILITY:
            nextState[0].fader[action.faderIndex].capabilities = {
                ...nextState[0].fader[action.faderIndex].capabilities,
                [action.capability]: action.enabled,
            }
            // remove object if empty:
            if (
                Object.entries(
                    nextState[0].fader[action.faderIndex].capabilities!
                ).length === 0
            ) {
                delete nextState[0].fader[action.faderIndex].capabilities
            }
            return nextState
        case FADER_ACTIONS.TOGGLE_ALL_MANUAL:
            const isAllManual =
                nextState[0].fader.find((f) => f.ignoreAutomation !== true) ===
                undefined

            if (isAllManual) {
                nextState[0].fader.forEach((f) => {
                    f.ignoreAutomation = false
                })
            } else {
                nextState[0].fader.forEach((f) => {
                    f.ignoreAutomation = true
                })
            }
            return nextState
        case FADER_ACTIONS.UPDATE_LABEL_LIST:
            Object.entries(action.update).forEach(
                ([index, label]: [string, string]) => {
                    nextState[0].fader[Number(index)].userLabel =
                        label === '' ? undefined : label
                }
            )
            return nextState
        case FADER_ACTIONS.FLUSH_FADER_LABELS:
            for (const fader of nextState[0].fader) {
                fader.label = undefined
            }
            return nextState
        default:
            return nextState
    }
}
