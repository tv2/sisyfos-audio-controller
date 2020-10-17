// Node Modules:
const fs = require('fs')
const path = require('path')
import { store } from '../reducers/store'

// Redux:
import { storeSetCompleteChState } from '../reducers/channelActions'
import { storeSetCompleteFaderState } from '../reducers/faderActions'
import { logger } from './logger'
import { InumberOfChannels } from '../reducers/channelsReducer'
import { IFaders } from '../reducers/fadersReducer'

export const loadSettings = (storeRedux: any) => {
    let settingsInterface = storeRedux.settings[0]
    try {
        return JSON.parse(
            fs.readFileSync(path.resolve('storage', 'settings.json'))
        )
    } catch (error) {
        logger.error('Couldn´t read Settings.json file, creating af new', {})
        saveSettings(settingsInterface)
        return settingsInterface
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
    stateSnapshot: any,
    stateChannelSnapshot: any,
    numberOfChannels: InumberOfChannels[],
    numberOfFaders: number,
    fileName: string,
    loadAll: boolean
) => {
    try {
        const stateFromFile = JSON.parse(fs.readFileSync(fileName))

        if (loadAll) {
            store.dispatch(
                storeSetCompleteChState(
                    stateFromFile.channelState,
                    numberOfChannels
                )
            )
            store.dispatch(
                storeSetCompleteFaderState(
                    stateFromFile.faderState as IFaders,
                    numberOfFaders
                )
            )
        } else {
            stateChannelSnapshot.channel = stateChannelSnapshot.channel.map(
                (channel: any, index: number) => {
                    if (
                        stateFromFile.channelState.channel[index]
                            .assignedFader >= 0
                    ) {
                        channel.auxLevel =
                            stateFromFile.channelState.channel[index]
                                .auxLevel || []
                        channel.assignedFader =
                            stateFromFile.channelState.channel[
                                index
                            ].assignedFader
                    } else {
                        channel.assignedFader = -1
                    }
                    return channel
                }
            )

            stateSnapshot.fader = stateSnapshot.fader.map(
                (fader: any, index: number) => {
                    fader.monitor =
                        stateFromFile.faderState.fader[index].monitor || -1
                    return fader
                }
            )
            store.dispatch(
                storeSetCompleteChState(stateChannelSnapshot, numberOfChannels)
            )
            store.dispatch(
                storeSetCompleteFaderState(stateSnapshot, numberOfFaders)
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

export const getSnapShotList = () => {
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

export const getCustomPages = (): object | undefined => {
    try {
        return JSON.parse(
            fs.readFileSync(path.resolve('storage', 'pages.json'))
        )
    } catch (error) {
        logger.error('Couldn´t read pages.json file', {})
        return
    }
}
