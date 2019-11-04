import indexReducer from  '../../reducers/indexReducer'
import { 
  SET_FADER_LEVEL,
  SET_PGM
} from '../../reducers/faderActions'

let fs = require('fs')

describe('Test initialize store', () => {
  let parsedInitialStore = JSON.parse(fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialStore.json'))
    it('should return the initial state', () => {
      // ** Uncomment to update initial settings state:
      // let data = indexReducer(undefined, {type: ''})
      // fs.writeFileSync('src/components/__tests__/__mocks__/parsedInitialStore-UPDATE.json', JSON.stringify(data))

        expect(indexReducer(undefined, {type: ''})).toEqual(parsedInitialStore)
    })
})

describe('Test redux actions', () => {
  it('should return the new fader level on fader', () => {
    let parsedInitialStore = JSON.parse(fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialStore.json'))
    parsedInitialStore.faders[0].fader[0].faderLevel = 0.5
    expect(indexReducer(undefined, {
      type: SET_FADER_LEVEL,
      channel: 0,
      level: 0.5
    })).toEqual(parsedInitialStore)
  })

  it('should return the new pgmOn state on fader', () => {
    let parsedInitialStore = JSON.parse(fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialStore.json'))
    parsedInitialStore.faders[0].fader[0].pgmOn = true
    expect(indexReducer(undefined, {
      type: SET_PGM,
      channel: 0,
      pgmOn: true
    })).toEqual(parsedInitialStore)
  })
})