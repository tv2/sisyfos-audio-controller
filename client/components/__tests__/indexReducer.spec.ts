import indexReducer from  '../../../server/reducers/indexReducer'

let fs = require('fs')
const parsedInitialStoreJSON = fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialStore.json')

describe('Test initialize store', () => {
  let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    it('should return the initial state of the whoæe Store', () => {
      // ** Uncomment to update initial settings state:
      // let data = indexReducer(undefined, {type: ''})
      // fs.writeFileSync('src/components/__tests__/__mocks__/parsedInitialStore-UPDATE.json', JSON.stringify(data))

        expect(indexReducer(undefined, {type: ''})).toEqual(parsedInitialStore)
    })
})
