import { MainThreadHandlers } from './src/MainThreadHandler'
import { expressInit } from './src/expressHandler'

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
