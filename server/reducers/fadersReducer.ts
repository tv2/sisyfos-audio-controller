import * as DEFAULTS from '../constants/DEFAULTS'
import { fxParamsList } from '../constants/MixerProtocolInterface'
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
    SET_VU_LEVEL,
    SET_VU_REDUCTION_LEVEL,
    SHOW_CHANNEL,
    IGNORE_AUTOMATION,
    SNAP_RECALL,
    TOGGLE_MUTE,
    TOGGLE_PFL,
    TOGGLE_PGM,
    TOGGLE_PST,
    TOGGLE_VO,
    X_MIX,
    SET_FADER_THRESHOLD,
    SET_FADER_RATIO,
    SET_FADER_DELAY_TIME,
    SET_FADER_LOW,
    SET_FADER_LO_MID,
    SET_FADER_MID,
    SET_FADER_HIGH,
    SET_FADER_MONITOR,
    SET_SINGLE_FADER_STATE,
    SHOW_IN_MINI_MONITOR,
    SET_INPUT_SELECTOR,
    SET_CHANNEL_DISABLED,
    TOGGLE_AMIX,
    SET_AMIX,
    SET_CAPABILITY,
    TOGGLE_ALL_MANUAL,
} from '../reducers/faderActions'

export interface IFaders {
    fader: Array<IFader>
    vuMeters: Array<IVuMeters>
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
    fxParam: Array<IFxParam>
    threshold: number
    ratio: number
    delayTime: number
    monitor: number
    showChannel: boolean
    showInMiniMonitor: boolean
    ignoreAutomation: boolean
    snapOn: Array<boolean>
    disabled: boolean

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
    vuVal: number
    reductionVal: number
}

export interface IFxParam {
    key: fxParamsList
    value: number
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
            fxParam: Object.keys(fxParamsList)
                .filter((key) => {
                    return !isNaN(Number(key))
                })
                .map(
                    (key): IFxParam => {
                        return { key: Number(key), value: NaN }
                    }
                ),
            threshold: 0.75,
            ratio: 0.75,
            delayTime: 0,
            monitor: index + 1, // route fader - aux 1:1 as default
            showChannel: true,
            showInMiniMonitor: false,
            ignoreAutomation: false,
            snapOn: [],
            disabled: false,
        }
        defaultObj[0].vuMeters.push({
            vuVal: 0.0,
            reductionVal: 0.0,
        })
        for (let y = 0; y < DEFAULTS.NUMBER_OF_SNAPS; y++) {
            defaultObj[0].fader[index].snapOn.push(false)
        }
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
    if (action.channel > nextState[0].fader.length) {
        return nextState
    }

    switch (action.type) {
        case SET_VU_LEVEL:
            if (typeof nextState[0].vuMeters[action.channel] !== 'undefined') {
                nextState[0].vuMeters[action.channel].vuVal = parseFloat(
                    action.level
                )
            }
            return nextState
        case SET_VU_REDUCTION_LEVEL:
            if (typeof nextState[0].vuMeters[action.channel] !== 'undefined') {
                nextState[0].vuMeters[action.channel].reductionVal = parseFloat(
                    action.level
                )
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
            nextState[0].fader[action.channel].faderLevel = parseFloat(
                action.level
            )
            return nextState
        case SET_INPUT_GAIN:
            nextState[0].fader[action.channel].inputGain = parseFloat(
                action.level
            )
            return nextState
        case SET_INPUT_SELECTOR:
            nextState[0].fader[action.channel].inputSelector = parseFloat(
                action.selected
            )
            return nextState
        case SET_FADER_THRESHOLD:
            nextState[0].fader[action.channel].threshold = parseFloat(
                action.level
            )
            return nextState
        case SET_FADER_RATIO:
            nextState[0].fader[action.channel].ratio = parseFloat(action.level)
            return nextState
        case SET_FADER_DELAY_TIME:
            nextState[0].fader[action.channel].delayTime = parseFloat(
                action.delayTime
            )
            return nextState
        case SET_FADER_LOW:
            nextState[0].fader[action.channel].fxParam[
                fxParamsList.EqLowGain
            ].value = parseFloat(action.level)
            return nextState
        case SET_FADER_LO_MID:
            nextState[0].fader[action.channel].fxParam[
                fxParamsList.EqLowMidGain
            ].value = parseFloat(action.level)
            return nextState
        case SET_FADER_MID:
            nextState[0].fader[action.channel].fxParam[
                fxParamsList.EqMidGain
            ].value = parseFloat(action.level)
            return nextState
        case SET_FADER_HIGH:
            nextState[0].fader[action.channel].fxParam[
                fxParamsList.EqHighGain
            ].value = parseFloat(action.level)
            return nextState
        case SET_FADER_MONITOR:
            nextState[0].fader[action.channel].monitor = action.auxIndex
            return nextState
        case SET_CHANNEL_LABEL:
            if (!nextState[0].fader[action.channel]) return nextState
            nextState[0].fader[action.channel].label = action.label
            return nextState
        case TOGGLE_PGM:
            nextState[0].fader[action.channel].pgmOn = !nextState[0].fader[
                action.channel
            ].pgmOn
            nextState[0].fader[action.channel].voOn = false
            return nextState
        case SET_PGM:
            nextState[0].fader[action.channel].pgmOn = !!action.pgmOn
            nextState[0].fader[action.channel].voOn = false
            return nextState
        case TOGGLE_VO:
            nextState[0].fader[action.channel].voOn = !nextState[0].fader[
                action.channel
            ].voOn
            nextState[0].fader[action.channel].pgmOn = false
            return nextState
        case SET_VO:
            nextState[0].fader[action.channel].voOn = !!action.voOn
            nextState[0].fader[action.channel].pgmOn = false
            return nextState
        case TOGGLE_PST:
            if (nextState[0].fader[action.channel].pstOn) {
                nextState[0].fader[action.channel].pstOn = false
                // Disable toggle to pstVoOn, to enable change pstVoOn: true here:
                nextState[0].fader[action.channel].pstVoOn = false
            } else if (nextState[0].fader[action.channel].pstVoOn) {
                nextState[0].fader[action.channel].pstOn = false
                nextState[0].fader[action.channel].pstVoOn = false
            } else {
                nextState[0].fader[action.channel].pstOn = true
                nextState[0].fader[action.channel].pstVoOn = false
            }
            return nextState
        case SET_PST:
            nextState[0].fader[action.channel].pstOn = !!action.pstOn
            nextState[0].fader[action.channel].pstVoOn = false
            return nextState
        case SET_PST_VO:
            nextState[0].fader[action.channel].pstVoOn = !!action.pstVoOn
            nextState[0].fader[action.channel].pstOn = false
            return nextState
        case TOGGLE_PFL:
            nextState[0].fader[action.channel].pflOn = !nextState[0].fader[
                action.channel
            ].pflOn
            return nextState
        case SET_PFL:
            nextState[0].fader[action.channel].pflOn = !!action.pflOn
            return nextState
        case TOGGLE_MUTE:
            nextState[0].fader[action.channel].muteOn = !nextState[0].fader[
                action.channel
            ].muteOn
            return nextState
        case SET_MUTE:
            nextState[0].fader[action.channel].muteOn = !!action.muteOn
            return nextState
        case SHOW_CHANNEL:
            nextState[0].fader[
                action.channel
            ].showChannel = !!action.showChannel
            return nextState
        case SHOW_IN_MINI_MONITOR: //faderIndexz // showInMiniMonitor
            nextState[0].fader[
                action.faderIndex
            ].showInMiniMonitor = !!action.showInMiniMonitor
            return nextState
        case IGNORE_AUTOMATION: //channel // ignoreAutomation
            nextState[0].fader[action.channel].ignoreAutomation = !nextState[0]
                .fader[action.channel].ignoreAutomation
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
        case SNAP_RECALL: //snapIndex
            nextState[0].fader.forEach((item, index) => {
                nextState[0].fader[index].pstOn = !!state[0].fader[index]
                    .snapOn[action.snapIndex]
            })
            return nextState
        case SET_CHANNEL_DISABLED:
            if (!nextState[0].fader[action.channel]) return nextState
            nextState[0].fader[action.channel].disabled = action.disabled
            return nextState
        case TOGGLE_AMIX: //channel
            nextState[0].fader[action.channel].amixOn = !nextState[0].fader[
                action.channel
            ].amixOn
            return nextState
        case SET_AMIX: //channel
            nextState[0].fader[action.channel].amixOn = action.state
            return nextState
        case SET_CAPABILITY:
            nextState[0].fader[action.channel].capabilities = {
                ...nextState[0].fader[action.channel].capabilities,
                [action.capability]: action.enabled,
            }
            // remove object if empty:
            if (
                Object.entries(nextState[0].fader[action.channel].capabilities!)
                    .length === 0
            ) {
                delete nextState[0].fader[action.channel].capabilities
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
