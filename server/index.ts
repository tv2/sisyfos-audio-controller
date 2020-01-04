import { MainThreadHandlers } from './MainThreadHandler'
import { expressInit } from './expressHandler'

declare global {
  namespace NodeJS {
      interface Global {
          mainThreadHandler: MainThreadHandlers
          navigator: any // Workaround for WebMidi
          performance: any // Workaround for WebMidi
      }
  }
}

global.mainThreadHandler = new MainThreadHandlers()
expressInit()