import indexReducer from  '../../reducers/indexReducer'
import { SET_FADER_LEVEL } from '../../reducers/faderActions'

let fs = require('fs')
let parsedInitialSettings = JSON.parse(fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialSettings.json'))


describe('Test initialize store', () => {
    it('should return the initial state', () => {
      // ** Uncomment to update initial settings state:
      // let data = indexReducer(undefined, {type: ''})
      // fs.writeFileSync('src/components/__tests__/__mocks__/parsedInitialSettings.json', JSON.stringify(data))

        expect(indexReducer(undefined, {type: ''})).toEqual(parsedInitialSettings)
    })
})