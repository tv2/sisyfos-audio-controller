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
  label?: string
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