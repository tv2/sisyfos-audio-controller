import indexReducer from  '../../reducers/indexReducer'
import { 
  SET_FADER_LEVEL,
  SET_PGM,
  SET_VO,
  SET_PST,
  SET_PFL,
  SET_MUTE,
  SET_CHANNEL_LABEL,
  SET_PST_VO,
  TOGGLE_SNAP,
  SET_ALL_VU_LEVELS,
  SET_COMPLETE_FADER_STATE,
  TOGGLE_MUTE,
  TOGGLE_PFL,
  TOGGLE_PGM,
  TOGGLE_PST,
  TOGGLE_VO,
  CLEAR_PST,
  FADE_TO_BLACK,
  SET_VU_LEVEL,
  SHOW_CHANNEL,
  SNAP_RECALL,
  NEXT_MIX,
  X_MIX
} from '../../reducers/faderActions'

let fs = require('fs')
const parsedInitialStoreJSON = fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialStore.json')

describe('Test initialize store', () => {
  let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    it('should return the initial state', () => {
      // ** Uncomment to update initial settings state:
      // let data = indexReducer(undefined, {type: ''})
      // fs.writeFileSync('src/components/__tests__/__mocks__/parsedInitialStore-UPDATE.json', JSON.stringify(data))

        expect(indexReducer(undefined, {type: ''})).toEqual(parsedInitialStore)
    })
})

describe('Test redux actions', () => {
  it('should return the new fader level on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].faderLevel = 0.5
    expect(indexReducer(undefined, {
      type: SET_FADER_LEVEL,
      channel: 0,
      level: 0.5
    })).toEqual(parsedInitialStore)
  })

  it('should return the new pgmOn state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pgmOn = true
    expect(indexReducer(undefined, {
      type: SET_PGM,
      channel: 0,
      pgmOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new voOn state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].voOn = true
    expect(indexReducer(undefined, {
      type: SET_VO,
      channel: 0,
      voOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new PST state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pstOn = true
    expect(indexReducer(undefined, {
      type: SET_PST,
      channel: 0,
      pstOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new PFL state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pflOn = true
    expect(indexReducer(undefined, {
      type: SET_PFL,
      channel: 0,
      pflOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new MUTE state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].muteOn = true
    expect(indexReducer(undefined, {
      type: SET_MUTE,
      channel: 0,
      muteOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new Channel label state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].label = 'NEW LABEL'
    expect(indexReducer(undefined, {
      type: SET_CHANNEL_LABEL,
      channel: 0,
      label: 'NEW LABEL'
    })).toEqual(parsedInitialStore)
  })

  it('should return the new PST VO state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pstVoOn = true
    expect(indexReducer(undefined, {
      type: SET_PST_VO,
      channel: 0,
      pstVoOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new SNAP state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].snapOn[0] = true
    expect(indexReducer(undefined, {
      type: TOGGLE_SNAP,
      channel: 0,
      snapIndex: 0
    })).toEqual(parsedInitialStore)
  })
})