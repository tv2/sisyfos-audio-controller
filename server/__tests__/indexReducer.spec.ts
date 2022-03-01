import indexReducer from '../../shared/reducers/indexReducer'

let fs = require('fs')
const parsedEmptyStoreJSON = fs.readFileSync(
    '__tests__/__mocks__/parsedEmptyStore.json'
)

describe('Test initialize store', () => {
    let parsedInitialStore = JSON.parse(parsedEmptyStoreJSON)
    it('should return the initial state of the whole Store', () => {
        // ** Uncomment to update initial settings state:
        // let data = indexReducer(undefined, {type: ''})
        // fs.writeFileSync('__tests__/__mocks__/parsedEmptyStore-UPDATE.json', JSON.stringify(data))

        expect(
            indexReducer(JSON.parse(parsedEmptyStoreJSON), { type: '' })
        ).toEqual(parsedInitialStore)
    })
})
