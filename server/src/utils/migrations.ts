import fs from 'fs'
import path from 'path'

import { logger } from './logger'
import { ISettings } from '../../../shared/src/reducers/settingsReducer'
import { getSnapShotList, IShotStorage } from './SettingsStorage'

const version = process.env.npm_package_version
const settingsPath: string = path.resolve(process.cwd(), 'storage')

export const checkVersion = (currentSettings: ISettings): ISettings => {
    if (
        versionAsNumber(version) >
        versionAsNumber(currentSettings.sisyfosVersion)
    ) {
        currentSettings = migrateVersion(currentSettings)
    }
    return currentSettings
}

const migrateVersion = (currentSettings: ISettings): ISettings => {
    logger.info(
        `Migrating VERSION from ${currentSettings.sisyfosVersion} to ${version}`
    )
    let newSettings = currentSettings
    if (versionAsNumber(version) >= versionAsNumber('4.7.0')) {
        newSettings = migrate45to47(currentSettings)
    }
    return newSettings
}

const migrate45to47 = (currentSettings: ISettings): ISettings => {
    let files: string[] = getSnapShotList()
    files.push('default.shot')

    files.forEach((fileName: string) => {
        let stateFromShot = JSON.parse(
            fs.readFileSync(path.join(settingsPath, fileName), 'utf8')
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
        try {
            fs.writeFileSync(
                path.join(settingsPath, fileName),
                JSON.stringify(migratedShot),
                'utf8'
            )
            logger.trace(`Snapshot ${fileName} Saved to storage folder`)
        } catch (error: any) {
            logger.data(error).error('Error saving Snapshot')
        }
    })
    currentSettings.sisyfosVersion = version
    delete currentSettings.customPages
    try {
        fs.writeFileSync(
            path.join(settingsPath, 'settings.json'),
            JSON.stringify(currentSettings),
            'utf8'
        )
    } catch (error: any) {
        logger
            .data(error)
            .error('Migration failed - error writing settings.json file')
    }
    return currentSettings
}

const versionAsNumber = (versionString: string): number => {
    if (!versionString) return 0
    let versionArray: string[] = versionString.split('.')
    let versionValue: number =
        parseInt(versionArray[0]) * 10000 +
        parseInt(versionArray[1]) * 100 +
        (parseInt(versionArray[2]) || 0)
    return versionValue
}
