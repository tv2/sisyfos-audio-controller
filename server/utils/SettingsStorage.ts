// Node Modules:
const fs = require('fs')
const path = require('path')
import { store } from '../reducers/store'
import { checkVersion } from './migrations'

// Redux:
import { storeSetCompleteChState } from '../reducers/channelActions'
import { storeSetCompleteFaderState } from '../reducers/faderActions'
import { logger } from './logger'
import { InumberOfChannels } from '../reducers/channelsReducer'
import { IFaders } from '../reducers/fadersReducer'
import { IChannels } from '../reducers/channelsReducer'

import { ICustomPages, ISettings } from '../reducers/settingsReducer'

export interface IShotStorage {
    channelState: IChannels
    faderState: IFaders
}

export const loadSettings = (storeRedux: any): ISettings => {
    let newSettings = storeRedux.settings[0]
    try {
        newSettings = JSON.parse(
            fs.readFileSync(path.resolve('storage', 'settings.json'))
        )
        checkVersion(newSettings)
        return newSettings
    } catch (error) {
        logger.error('Couldn´t read Settings.json file, creating af new', error)
        saveSettings(newSettings)
        return newSettings
    }
}

export const saveSettings = (settings: any) => {
    const settingsCopy = { ...settings }
    delete settingsCopy.customPages
    let json = JSON.stringify(settingsCopy)
    if (!fs.existsSync('storage')) {
        fs.mkdirSync('storage')
    }
    fs.writeFile(
        path.resolve('storage', 'settings.json'),
        json,
        'utf8',
        (error: any) => {
            logger.error('Error writing settings.json file: ', error)
        }
    )
}

export const loadSnapshotState = (
    stateSnapshot: IFaders,
    stateChannelSnapshot: IChannels,
    numberOfChannels: InumberOfChannels[],
    numberOfFaders: number,
    fileName: string,
    loadAll: boolean
) => {
    try {
        const stateFromFile: IShotStorage = JSON.parse(
            fs.readFileSync(fileName)
        )

        if (loadAll) {
            store.dispatch(
                storeSetCompleteChState(
                    stateFromFile.channelState as IChannels,
                    numberOfChannels
                )
            )
            store.dispatch(
                storeSetCompleteFaderState(
                    stateFromFile.faderState as IFaders,
                    numberOfFaders
                )
            )
        }
    } catch (error) {
        logger.error('Error loading Snapshot' + String(error), {})
    }
}

export const saveSnapshotState = (stateSnapshot: any, fileName: string) => {
    let json = JSON.stringify(stateSnapshot)
    fs.writeFile(fileName, json, 'utf8', (error: any) => {
        if (error) {
            logger.error('Error saving Snapshot' + String(error), {})
        } else {
            logger.verbose(
                'Snapshot ' + fileName + ' Saved to storage folder',
                {}
            )
        }
    })
}

export const getSnapShotList = (): string[] => {
    const files = fs
        .readdirSync(path.resolve('storage'))
        .filter((file: string) => {
            if (file.includes('.shot') && file !== 'default.shot') {
                return true
            }
        })
    return files
}

export const getMixerPresetList = (fileExtension: string): string[] => {
    if (fileExtension === '') {
        return []
    }
    const files = fs
        .readdirSync(path.resolve('storage'))
        .filter((file: string) => {
            if (
                file.toUpperCase().includes('.' + fileExtension.toUpperCase())
            ) {
                return true
            }
        })
    return files
}

export const getCcgSettingsList = () => {
    const files = fs
        .readdirSync(path.resolve('storage'))
        .filter((file: string) => {
            if (file.includes('.ccg') && file !== 'default-casparcg.ccg') {
                return true
            }
        })
    return files
}

export const setCcgDefault = (fileName: string) => {
    let data: any
    try {
        data = fs.readFileSync(path.join('storage', fileName))
    } catch (error) {
        logger.error('Couldn´t read ' + fileName + ' file', {})
        return
    }

    const defaultFile = path.join('storage', 'default-casparcg.ccg')
    fs.writeFile(defaultFile, data, 'utf8', (error: any) => {
        if (error) {
            logger.error(
                'Error setting default CasparCG setting' + String(error),
                {}
            )
        } else {
            logger.info(
                'CasparCG' + fileName + ' Saved as default CasparCG',
                {}
            )
        }
    })
}

export const getCustomPages = (): ICustomPages[] => {
    try {
        return JSON.parse(
            fs.readFileSync(path.resolve('storage', 'pages.json'))
        )
    } catch (error) {
        logger.error('Couldn´t read pages.json file', {})
        return []
    }
}

export const saveCustomPages = (
    stateCustomPages: any,
    fileName: string = 'pages.json'
) => {
    let json = JSON.stringify(stateCustomPages)
    fs.writeFile(path.join('storage', fileName), json, 'utf8', (error: any) => {
        if (error) {
            logger.error('Error saving pages file' + String(error), {})
        } else {
            logger.info('Pages ' + fileName + ' Saved to storage folder', {})
        }
    })
}
