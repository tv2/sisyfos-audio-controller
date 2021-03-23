//@ts-ignore
import { version } from '../../package.json'
import { ISettings } from '../reducers/settingsReducer'

export const checkVersion = (currentSettings: ISettings) => {
    if (currentSettings.sisyfosVersion < version) {
        migrateVersion(currentSettings)
    }
}

export const getVersion = (): string => {
    return version
}

const migrateVersion = (currentSettings: ISettings) => {
    console.log(
        'Migrating VERSION from',
        currentSettings.sisyfosVersion,
        ' to ',
        version
    )
}
