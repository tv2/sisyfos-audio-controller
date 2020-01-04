import indexReducer from  '../../../server/reducers/indexReducer'
import { 
    FADE_ACTIVE,
    SET_ASSIGNED_FADER,
    SET_COMPLETE_CH_STATE,
    SET_OUTPUT_LEVEL,
    SET_PRIVATE,
 } from '../../../server/reducers/channelActions'
import { IChannel } from '../../../server/reducers/channelsReducer'

 let fs = require('fs')
const parsedFullStoreJSON = fs.readFileSync('src/components/__tests__/__mocks__/parsedFullStore.json')

describe('Test redux channelReducer actions', () => {
    /**
     * TEST SET_OUTPUT_LEVEL:
     */  
    it('should return the new output_level state on channels', () => {
      let parsedFullStore = JSON.parse(parsedFullStoreJSON)
      let nextState = JSON.parse(parsedFullStoreJSON)
      nextState.channels[0].channel[10].outputLevel = 0.5
      expect(indexReducer(parsedFullStore, {
        type: SET_OUTPUT_LEVEL,
        channel: 10,
        level: '0.5'
      })).toEqual(nextState)
    })

    /**
     * TEST SET_ASSIGNED_FADER:
     */  
    it('should return the new assignedFader state on channels', () => {
        let parsedFullStore = JSON.parse(parsedFullStoreJSON)
        let nextState = JSON.parse(parsedFullStoreJSON)
        nextState.channels[0].channel[10].assignedFader = 2
        expect(indexReducer(parsedFullStore, {
          type: SET_ASSIGNED_FADER,
          channel: 10,
          faderNumber: 2
        })).toEqual(nextState)
      })

    /**
     * TEST FADE_ACTIVE:
     */  
    it('should return the new FADE_ACTIVE state on channels', () => {
        let parsedFullStore = JSON.parse(parsedFullStoreJSON)
        let nextState = JSON.parse(parsedFullStoreJSON)
        nextState.channels[0].channel[10].fadeActive = true
        expect(indexReducer(parsedFullStore, {
          type: FADE_ACTIVE,
          channel: 10,
          active: true
        })).toEqual(nextState)
      })

    /**
     * TEST SET_COMPLETE_CHANNEL_STATE:
     */  
    it('should return the new COMPLETE_CHANNEL_STATE on channels', () => {
        let parsedFullStore = JSON.parse(parsedFullStoreJSON)
        let nextState = JSON.parse(parsedFullStoreJSON)
        let channels: IChannel[] = []
        for (let i=0; i<24; i++) {
            channels.push({
                channelType: 0,
                channelTypeIndex: i,
                assignedFader: i,
                auxLevel: [],
                fadeActive: false,
                outputLevel: 0.75
            })
            nextState.channels[0].channel[i].outputLevel = 0.75
          }
        expect(indexReducer(parsedFullStore, {
          type: SET_COMPLETE_CH_STATE,
          allState: {channel: channels},
          numberOfTypeChannels: [24]
        })).toEqual(nextState)
      })
})
