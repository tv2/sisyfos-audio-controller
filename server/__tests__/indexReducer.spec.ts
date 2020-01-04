import indexReducer from  '../reducers/indexReducer'

let fs = require('fs')
const parsedInitialStoreJSON = fs.readFileSync('server/__tests__/__mocks__/parsedInitialStore.json')

describe('Test initialize store', () => {
  let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    it('should return the initial state of the whole Store', () => {
      // ** Uncomment to update initial settings state:
      // let data = indexReducer(undefined, {type: ''})
      // fs.writeFileSync('server/__tests__/__mocks__/parsedInitialStore-UPDATE.json', JSON.stringify(data))

        expect(indexReducer(undefined, {type: ''})).toEqual(parsedInitialStore)
    })
})
