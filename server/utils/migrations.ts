const fs = require('fs')
const path = require('path')

import { logger } from './logger'
import { ISettings } from '../reducers/settingsReducer'
import { getSnapShotList, IShotStorage, saveSettings } from './SettingsStorage'

const version = process.env.npm_package_version

export const checkVersion = (currentSettings: ISettings): ISettings => {
    if (version > (currentSettings.sisyfosVersion || '0')) {
        currentSettings = migrateVersion(currentSettings)
    }
    return currentSettings
}

const migrateVersion = (currentSettings: ISettings): ISettings => {
    console.log(
        'Migrating VERSION from',
        currentSettings.sisyfosVersion,
        ' to ',
        version
    )
    let newSettings = currentSettings
    if (version === '4.6.0') {
        newSettings = migrate45to46(currentSettings)
    }
    return newSettings
}

const migrate45to46 = (currentSettings: ISettings): ISettings => {
    let files: string[] = getSnapShotList()
    files.push('default.shot')

    files.forEach((fileName: string) => {
        let stateFromShot = JSON.parse(
            fs.readFileSync(path.resolve('storage', fileName))
        )
        // As this is the first implemented migration it also looks .shot files from ealier versions than 4.xx
        if (stateFromShot.channelState.chConnection) {
            // From Version 4.xx
            stateFromShot.channelState.chMixerConnection =
                stateFromShot.channelState?.chConnection
            delete stateFromShot.channelState.chConnection
        } else if (stateFromShot.channelState.channel) {
            // Version lower than 4.0
            stateFromShot.channelState.chMixerConnection = [
                { channel: stateFromShot.channelState.channel },
            ]
            delete stateFromShot.channelState.channel
        }
        let migratedShot: IShotStorage = stateFromShot
        fs.writeFileSync(
            path.resolve('storage', fileName),
            JSON.stringify(migratedShot),
            'utf8',
            (error: any) => {
                if (error) {
                    logger.error('Error saving Snapshot' + String(error), {})
                } else {
                    logger.verbose(
                        'Snapshot ' + fileName + ' Saved to storage folder',
                        {}
                    )
                }
            }
        )
    })
    currentSettings.sisyfosVersion = version
    saveSettings(currentSettings)
    return currentSettings
}
