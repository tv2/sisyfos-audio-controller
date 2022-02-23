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