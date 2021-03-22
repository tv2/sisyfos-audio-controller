import {
    CLEAR_PST,
    FADE_TO_BLACK,
    NEXT_MIX,
    SET_CHANNEL_LABEL,
    SET_COMPLETE_FADER_STATE,
    SET_FADER_LEVEL,
    SET_INPUT_GAIN,
    SET_MUTE,
    SET_PFL,
    SET_PGM,
    SET_PST,
    SET_PST_VO,
    SET_VO,
    SET_VU_REDUCTION_LEVEL,
    SHOW_CHANNEL,
    IGNORE_AUTOMATION,
    TOGGLE_MUTE,
    TOGGLE_PFL,
    TOGGLE_PGM,
    TOGGLE_PST,
    TOGGLE_VO,
    X_MIX,
    SET_FADER_FX,
    SET_FADER_MONITOR,
    SET_SINGLE_FADER_STATE,
    SHOW_IN_MINI_MONITOR,
    SET_INPUT_SELECTOR,
    SET_CHANNEL_DISABLED,
    TOGGLE_AMIX,
    SET_AMIX,
    SET_CAPABILITY,
    TOGGLE_ALL_MANUAL,
    SET_ASSIGNED_CHANNEL,
    REMOVE_ALL_ASSIGNED_CHANNELS,
} from '../reducers/faderActions'

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
    pgmOn: boolean
    voOn: boolean
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

const defaultFadersReducerState = (numberOfFaders: number): IFaders[] => {
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
        case SET_VU_REDUCTION_LEVEL:
            if (
                typeof nextState[0].vuMeters[action.faderIndex] !== 'undefined'
            ) {
                nextState[0].vuMeters[
                    action.faderIndex
                ].reductionVal = parseFloat(action.level)
            }
            return nextState
        case SET_COMPLETE_FADER_STATE:
            let emptyState = defaultFadersReducerState(
                action.numberOfTypeChannels
            )
            if (
                emptyState[0].vuMeters.length === nextState[0].vuMeters.length
            ) {
                emptyState[0].vuMeters = [...state[0].vuMeters]
            }
            nextState = emptyState
            if (action.allState.fader.length == nextState[0].fader.length) {
                action.allState.fader.map((channel: any, index: number) => {
                    nextState[0].fader[index] = channel
                })
            }
            return nextState
        case SET_SINGLE_FADER_STATE:
            nextState[0].fader[action.faderIndex] = action.state
            return nextState
        case SET_FADER_LEVEL:
            nextState[0].fader[action.faderIndex].faderLevel = parseFloat(
                action.level
            )
            return nextState
        case SET_INPUT_GAIN:
            nextState[0].fader[action.faderIndex].inputGain = parseFloat(
                action.level
            )
            return nextState
        case SET_INPUT_SELECTOR:
            nextState[0].fader[action.faderIndex].inputSelector = parseFloat(
                action.selected
            )
            return nextState
        case SET_FADER_FX:
            if (!nextState[0].fader[action.faderIndex][action.fxParam]) {
                nextState[0].fader[action.faderIndex][action.fxParam] = []
            }
            nextState[0].fader[action.faderIndex][
                action.fxParam
            ][0] = parseFloat(action.level ?? 0)
            return nextState
        case SET_FADER_MONITOR:
            nextState[0].fader[action.faderIndex].monitor = action.auxIndex
            return nextState
        case SET_CHANNEL_LABEL:
            if (!nextState[0].fader[action.faderIndex]) return nextState
            nextState[0].fader[action.faderIndex].label = action.label
            return nextState
        case TOGGLE_PGM:
            nextState[0].fader[action.faderIndex].pgmOn = !nextState[0].fader[
                action.faderIndex
            ].pgmOn
            nextState[0].fader[action.faderIndex].voOn = false
            return nextState
        case SET_PGM:
            nextState[0].fader[action.faderIndex].pgmOn = !!action.pgmOn
            nextState[0].fader[action.faderIndex].voOn = false
            return nextState
        case TOGGLE_VO:
            nextState[0].fader[action.faderIndex].voOn = !nextState[0].fader[
                action.faderIndex
            ].voOn
            nextState[0].fader[action.faderIndex].pgmOn = false
            return nextState
        case SET_VO:
            nextState[0].fader[action.faderIndex].voOn = !!action.voOn
            nextState[0].fader[action.faderIndex].pgmOn = false
            return nextState
        case TOGGLE_PST:
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
        case SET_PST:
            nextState[0].fader[action.faderIndex].pstOn = !!action.pstOn
            nextState[0].fader[action.faderIndex].pstVoOn = false
            return nextState
        case SET_PST_VO:
            nextState[0].fader[action.faderIndex].pstVoOn = !!action.pstVoOn
            nextState[0].fader[action.faderIndex].pstOn = false
            return nextState
        case TOGGLE_PFL:
            nextState[0].fader[action.faderIndex].pflOn = !nextState[0].fader[
                action.faderIndex
            ].pflOn
            return nextState
        case SET_PFL:
            nextState[0].fader[action.faderIndex].pflOn = !!action.pflOn
            return nextState
        case TOGGLE_MUTE:
            nextState[0].fader[action.faderIndex].muteOn = !nextState[0].fader[
                action.faderIndex
            ].muteOn
            return nextState
        case SET_MUTE:
            nextState[0].fader[action.faderIndex].muteOn = !!action.muteOn
            return nextState
        case SHOW_CHANNEL:
            nextState[0].fader[
                action.faderIndex
            ].showChannel = !!action.showChannel
            return nextState
        case SHOW_IN_MINI_MONITOR: //faderIndexz // showInMiniMonitor
            nextState[0].fader[
                action.faderIndex
            ].showInMiniMonitor = !!action.showInMiniMonitor
            return nextState
        case IGNORE_AUTOMATION: //channel // ignoreAutomation
            nextState[0].fader[
                action.faderIndex
            ].ignoreAutomation = !nextState[0].fader[action.faderIndex]
                .ignoreAutomation
            return nextState
        case X_MIX: //none
            nextState[0].fader.forEach((item, index) => {
                let nextPgmOn = state[0].fader[index].pstOn
                let nextVoOn = state[0].fader[index].pstVoOn
                nextState[0].fader[index].pstOn = state[0].fader[index].pgmOn
                nextState[0].fader[index].pstVoOn = state[0].fader[index].voOn
                nextState[0].fader[index].pgmOn = nextPgmOn
                nextState[0].fader[index].voOn = nextVoOn
            })
            return nextState
        case NEXT_MIX: //none
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pgmOn = state[0].fader[index].pstOn
                nextState[0].fader[index].voOn = state[0].fader[index].pstVoOn
                nextState[0].fader[index].pstOn = false
                nextState[0].fader[index].pstVoOn = false
            })
            return nextState
        case FADE_TO_BLACK: //none
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pgmOn = false
                nextState[0].fader[index].voOn = false
            })
            return nextState
        case CLEAR_PST: //none
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pstOn = false
                nextState[0].fader[index].pstVoOn = false
            })
            return nextState
        case SET_CHANNEL_DISABLED:
            if (!nextState[0].fader[action.faderIndex]) return nextState
            nextState[0].fader[action.faderIndex].disabled = action.disabled
            return nextState
        case TOGGLE_AMIX: //channel
            nextState[0].fader[action.faderIndex].amixOn = !nextState[0].fader[
                action.faderIndex
            ].amixOn
            return nextState
        case SET_AMIX: //channel
            nextState[0].fader[action.faderIndex].amixOn = action.state
            return nextState
        case REMOVE_ALL_ASSIGNED_CHANNELS: //channel
            nextState[0].fader.forEach((fader) => {
                fader.assignedChannels = []
            })
            return nextState
        case SET_ASSIGNED_CHANNEL:
            if (action.assigned) {
                let assignedChannels: IChannelReference[] =
                    nextState[0].fader[action.faderIndex].assignedChannels || []
                assignedChannels.push({
                    mixerIndex: action.mixerIndex,
                    channelIndex: action.channelIndex,
                })
                assignedChannels.sort(
                    (n1: IChannelReference, n2: IChannelReference) =>
                        n1.channelIndex - n2.channelIndex
                )
                nextState[0].fader[
                    action.faderIndex
                ].assignedChannels = assignedChannels
            } else {
                let assignedChannels =
                    nextState[0].fader[action.faderIndex].assignedChannels
                if (
                    assignedChannels.find(
                        (channelReference: IChannelReference) => {
                            return (
                                channelReference.channelIndex ===
                                action.channelIndex
                            )
                        }
                    )
                ) {
                    assignedChannels = assignedChannels.filter((channel) => {
                        return channel !== action.channelIndex
                    })
                }
                nextState[0].fader[
                    action.faderIndex
                ].assignedChannels = assignedChannels
            }
            return nextState
        case SET_CAPABILITY:
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
        case TOGGLE_ALL_MANUAL:
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
        default:
            return nextState
    }
}
