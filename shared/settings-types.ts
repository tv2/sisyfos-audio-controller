export enum PageType {
  All,
  CustomPage,
}

export interface ISettings {
  /* Sisyfos Settings Version: */
  sisyfosVersion?: string

  /** UI state (non persistant) */
  showSettings: boolean
  showPagesSetup: boolean
  showLabelSettings: boolean
  showChanStrip: number
  showChanStripFull: number
  showOptions: number | false
  showMonitorOptions: number
  showStorage: boolean
  currentPage: {
      type: PageType
      start?: number
      id?: string
  }
  customPages: Array<ICustomPages>

  /** User config */
  numberOfMixers: number
  mixers: IMixerSettings[]
  enableRemoteFader: boolean
  remoteFaderMidiInputPort: string
  remoteFaderMidiOutputPort: string
  numberOfFaders: number
  fadeTime: number // Default fade time for PGM ON - OFF
  voFadeTime: number // Default fade time for VO ON - OFF
  voLevel: number // Relative level of PGM in %
  autoResetLevel: number // Autoreset before pgm on, if level is lower than in %
  automationMode: boolean
  offtubeMode: boolean
  showPfl: boolean
  enablePages: boolean
  numberOfCustomPages: number
  chanStripFollowsPFL: boolean
  labelType: 'automatic' | 'user' | 'automation' | 'channel'

  /** Connection state */
  serverOnline: boolean
}

export interface ICustomPages {
  id: string
  label: string
  faders: Array<number>
}

export interface IMixerSettings {
  mixerProtocol: string
  deviceIp: string
  devicePort: number
  protocolLatency: number // If a protocol has latency and feedback, the amount of time before enabling receiving data from channel again
  mixerMidiInputPort: string
  mixerMidiOutputPort: string
  numberOfChannelsInType: Array<number>
  numberOfAux: number
  nextSendAux: number
  mixerOnline: boolean
  localIp: string
  localOscPort: number
}