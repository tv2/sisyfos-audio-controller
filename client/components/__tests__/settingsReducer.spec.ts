import indexReducer from  '../../../server/reducers/indexReducer'
import {
  TOGGLE_SHOW_CHAN_STRIP,
  TOGGLE_SHOW_OPTION,
  TOGGLE_SHOW_SETTINGS,
  TOGGLE_SHOW_SNAPS,
  TOGGLE_SHOW_STORAGE,
  UPDATE_SETTINGS
 } from '../../../server/reducers/settingsActions'
import { ISettings } from '../../../server/reducers/settingsReducer'

 let fs = require('fs')
const parsedFullStoreJSON = fs.readFileSync('src/components/__tests__/__mocks__/parsedFullStore.json')

describe('Test redux settingsReducer actions', () => {
    /**
     * TEST TOGGLE_SHOW_CHAN_STRIP:
     */  
    it('should return the new showChanStrip state on settings', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      nextState.settings[0].showChanStrip = 3
      expect(indexReducer(parsedFullStore, {
        type: TOGGLE_SHOW_CHAN_STRIP,
        channel: 3
      })).toEqual(nextState)

      parsedFullStore = JSON.parse(parsedFullStoreJSON)
      expect(indexReducer(nextState, {
        type: TOGGLE_SHOW_CHAN_STRIP,
        channel: -1
      })).toEqual(parsedFullStore)
    })

    /**
     * TEST TOGGLE_SHOW_OPTION:
     */  
    it('should return the new showOptions state on settings', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      nextState.settings[0].showOptions = 3
      expect(indexReducer(parsedFullStore, {
        type: TOGGLE_SHOW_OPTION,
        channel: 3
      })).toEqual(nextState)

      parsedFullStore = JSON.parse(parsedFullStoreJSON)
      expect(indexReducer(nextState, {
        type: TOGGLE_SHOW_OPTION,
        channel: false
      })).toEqual(parsedFullStore)
    })

    /**
     * TEST TOGGLE_SHOW_SETTINGS:
     */  
    it('should return the new showSettings state on settings', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      nextState.settings[0].showSettings = true
      expect(indexReducer(parsedFullStore, {
        type: TOGGLE_SHOW_SETTINGS
      })).toEqual(nextState)
    })

    /**
     * TEST TOGGLE_SHOW_SNAPS:
     */  
    it('should return the new showSnaps state on settings', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      nextState.settings[0].showSnaps = true
      expect(indexReducer(parsedFullStore, {
        type: TOGGLE_SHOW_SNAPS
      })).toEqual(nextState)
    })


    /**
     * TEST TOGGLE_SHOW_STORAGE:
     */  
    it('should return the new showStorage state on settings', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      nextState.settings[0].showStorage = true
      expect(indexReducer(parsedFullStore, {
        type: TOGGLE_SHOW_STORAGE
      })).toEqual(nextState)
    })

    /**
     * TEST UPDATE_SETTINGS:
     */  
    it('should return the new settings state on settings', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      expect(indexReducer(parsedFullStore, {
        type: UPDATE_SETTINGS,
        settings: parsedFullStore.settings[0]
      })).toEqual(nextState)
    })
})
