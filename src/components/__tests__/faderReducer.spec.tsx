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
  X_MIX,
  SET_ALL_VU_LEVELS,
  SET_COMPLETE_FADER_STATE
} from '../../reducers/faderActions'

let fs = require('fs')
const parsedInitialStoreJSON = fs.readFileSync('src/components/__tests__/__mocks__/parsedInitialStore.json')
const parsedFullStoreJSON = fs.readFileSync('src/components/__tests__/__mocks__/parsedFullStore.json')

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
  /**
   * TEST INITIAL STORE:
   */

  it('should return the new fader level on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].faderLevel = 0.5
    expect(indexReducer(undefined, {
      type: SET_FADER_LEVEL,
      channel: 0,
      level: 0.5
    })).toEqual(parsedInitialStore)
  })

  /**
   * TEST ALL SET REDUX ACTIONS
   */
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

  /**
   * TEST ALL TOGGLE ACTIONS
   */

  it('should return the new SNAP state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].snapOn[0] = true
    expect(indexReducer(undefined, {
      type: TOGGLE_SNAP,
      channel: 0,
      snapIndex: 0
    })).toEqual(parsedInitialStore)
  })

  it('should return the new TOGGLE pgmOn state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pgmOn = true
    expect(indexReducer(undefined, {
      type: TOGGLE_PGM,
      channel: 0,
      pgmOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new TOGGLE VoOn state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].voOn = true
    expect(indexReducer(undefined, {
      type: TOGGLE_VO,
      channel: 0,
      voOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new TOGGLE_PST state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pstOn = true
    expect(indexReducer(undefined, {
      type: TOGGLE_PST,
      channel: 0,
      pstOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new TOGGLE_PFL state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].pflOn = true
    expect(indexReducer(undefined, {
      type: TOGGLE_PFL,
      channel: 0,
      pflOn: true
    })).toEqual(parsedInitialStore)
  })

  it('should return the new TOGGLE_MUTE state on fader', () => {
    let parsedInitialStore = JSON.parse(parsedInitialStoreJSON)
    parsedInitialStore.faders[0].fader[0].muteOn = true
    expect(indexReducer(undefined, {
      type: TOGGLE_MUTE,
      channel: 0,
      muteOn: true
    })).toEqual(parsedInitialStore)
  })


  /**
   * TEST CLEAR_PST:
   */
  it('should SET PST ch 10-14 and return the new CLEAR_PST state on faders', () => {
    let parsedFullStore = JSON.parse(parsedFullStoreJSON)
    let newState = JSON.parse(parsedFullStoreJSON)
    
    for (let i=10; i<14; i++) {
      newState.faders[0].fader[i].pstOn = true
      expect(indexReducer(parsedFullStore, {
        type: SET_PST,
        channel: i,
        pstOn: true
      })).toEqual(newState)
    }

    parsedFullStore = JSON.parse(parsedFullStoreJSON)
    expect(indexReducer(newState, {
      type: CLEAR_PST
    })).toEqual(parsedFullStore)
  })

  /**
   * TEST FADE_TO_BLACK:
   */
  it('should SET VO ch 10-14 and set PGM ch 6-8 and return the new FADE_TO_BLACK state on faders', () => {
    let parsedFullStore = JSON.parse(parsedFullStoreJSON)
    let newState = JSON.parse(parsedFullStoreJSON)
    
    for (let i=10; i<14; i++) {
      newState.faders[0].fader[i].voOn = true
      expect(indexReducer(parsedFullStore, {
        type: SET_VO,
        channel: i,
        voOn: true
      })).toEqual(newState)
    }

    for (let i=6; i<8; i++) {
      newState.faders[0].fader[i].pgmOn = true
      expect(indexReducer(parsedFullStore, {
        type: SET_PGM,
        channel: i,
        pgmOn: true
      })).toEqual(newState)
    }

    parsedFullStore = JSON.parse(parsedFullStoreJSON)
    expect(indexReducer(newState, {
      type: FADE_TO_BLACK
    })).toEqual(parsedFullStore)
  })
  
  /**
   * TEST NEXT_MIX:
   */
  it('should SET PST_VO ch 10-14 and set PST ch 6-8 and return the new NEXT_MIX state on faders', () => {
    let parsedFullStore = JSON.parse(parsedFullStoreJSON)
    let newState = JSON.parse(parsedFullStoreJSON)
    
    for (let i=10; i<14; i++) {
      newState.faders[0].fader[i].pstVoOn = true
      expect(indexReducer(parsedFullStore, {
        type: SET_PST_VO,
        channel: i,
        pstVoOn: true
      })).toEqual(newState)
    }

    for (let i=6; i<8; i++) {
      newState.faders[0].fader[i].pstOn = true
      expect(indexReducer(parsedFullStore, {
        type: SET_PST,
        channel: i,
        pstOn: true
      })).toEqual(newState)
    }

    parsedFullStore = JSON.parse(parsedFullStoreJSON)
    for (let i=10; i<14; i++) {
      parsedFullStore.faders[0].fader[i].voOn = true
    }
    for (let i=6; i<8; i++) {
      parsedFullStore.faders[0].fader[i].pgmOn = true
    }

    expect(indexReducer(newState, {
      type: NEXT_MIX
    })).toEqual(parsedFullStore)
  })
  

  /*
  SET_VU_LEVEL,
  SHOW_CHANNEL,
  SNAP_RECALL,
  NEXT_MIX,
  X_MIX,
  SET_ALL_VU_LEVELS,
  SET_COMPLETE_FADER_STATE
  */
})