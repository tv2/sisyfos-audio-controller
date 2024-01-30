import { FaderActionTypes } from '../../shared/src/actions/faderActions'
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
        // fs.writeFileSync('__tests__/__mocks__/parsedEmptyStore-UPDATE.json', JSON.stringify(data))

        // Call reducer with empty store
        // Test if it returns the initial state
        // Using SNAP_RECALL action as this doesn't change the state
        expect(
            indexReducer(JSON.parse(parsedEmptyStoreJSON), {
                type: FaderActionTypes.SNAP_RECALL,
                snapshotIndex: 0,
            })
        ).toEqual(parsedInitialStore)
    })
})
