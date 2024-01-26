import { FaderActionTypes } from '../../shared/src/actions/faderActions'
import { SettingsActionTypes } from '../../shared/src/actions/settingsActions'
import indexReducer from '../../shared/src/reducers/indexReducer'

import fs from 'fs'
const parsedEmptyStoreJSON = fs.readFileSync(
    '__tests__/__mocks__/parsedEmptyStore.json',
    'utf-8'
)

describe('Test initialize store', () => {
    let parsedInitialStore = JSON.parse(parsedEmptyStoreJSON)
    it('should return the initial state of the whole Store', () => {
        // ** Uncomment to update initial settings state:
        // let data = indexReducer(undefined, {type: ''})
        // fs.writeFileSync('__tests__/__mocks__/parsedEmptyStore-UPDATE.json', JSON.stringify(data))
   
        expect(
            indexReducer(JSON.parse(parsedEmptyStoreJSON), {
                type: SettingsActionTypes.UPDATE_SETTINGS,
                settings: parsedInitialStore.settings,
            })
        ).toEqual(parsedInitialStore)

        expect(
            indexReducer(undefined, {
                type: FaderActionTypes.SET_COMPLETE_FADER_STATE,
                allState: parsedInitialStore.faderState,
                numberOfFaders: parsedInitialStore.settings[0].numberOfFaders,
            })
        ).toEqual(parsedInitialStore)
    })
})
