// Node Modules:
const fs = require('fs')
const path = require('path')
import { store, state } from '../reducers/store'


// Redux:
import { SET_COMPLETE_CH_STATE } from '../reducers/channelActions'
import { SET_COMPLETE_FADER_STATE } from  '../reducers/faderActions'
import { logger } from './logger'


export const loadSettings = (storeRedux: any) => {
    let settingsInterface = storeRedux.settings[0];
    try {
        return (JSON.parse(fs.readFileSync(path.resolve('storage', 'settings.json'))))
    }
    catch (error) {
        logger.error('Couldn´t read Settings.json file, creating af new', {})
        saveSettings(settingsInterface);
        return (settingsInterface);
    }
};

export const saveSettings = (settings: any) => {
    let json = JSON.stringify(settings);
    if (!fs.existsSync('storage')){
        fs.mkdirSync('storage');
    }
    fs.writeFile(path.resolve('storage', 'settings.json'), json, 'utf8', (error: any)=>{
        logger.error('Error writing settings.json file: ', error);
    });
};


export const loadSnapshotState = (stateSnapshot: any, stateChannelSnapshot: any, numberOfChannels: Array<number>, numberOfFaders: number, fileName: string, loadAll: boolean) => {
    try {
        const stateFromFile = JSON.parse(fs.readFileSync(fileName));
        
        if (loadAll) {
            store.dispatch({
                type: SET_COMPLETE_CH_STATE,
                allState: stateFromFile.channelState,
                numberOfTypeChannels: numberOfChannels
            });
            store.dispatch({
                type:SET_COMPLETE_FADER_STATE,
                allState: stateFromFile.faderState,
                numberOfTypeChannels: numberOfFaders
            });
        } else {
            stateChannelSnapshot.channel = stateChannelSnapshot.channel.map((channel: any, index: number) => {
                if (index < numberOfFaders) {
                    channel.auxLevel = stateFromFile.channelState.channel[index].auxLevel || []
                    channel.assignedFader = stateFromFile.channelState.channel[index].assignedFader
                } else {
                    channel.assignedFader = -1
                }
                return channel
            })

            stateSnapshot.fader = stateSnapshot.fader.map((fader: any, index: number) => {
                fader.monitor = stateFromFile.faderState.fader[index].monitor || -1
                return fader
            })
            store.dispatch({
                type:SET_COMPLETE_CH_STATE,
                allState: stateChannelSnapshot,
                numberOfTypeChannels: numberOfChannels
            });
            store.dispatch({
                type: SET_COMPLETE_FADER_STATE,
                allState: stateSnapshot,
                numberOfTypeChannels: numberOfFaders
            });

        }
        
    }
    catch (error) {
        logger.error("Error loading Snapshot" + String(error), {})
    }
};

export const saveSnapshotState = (stateSnapshot: any, fileName: string) => {
    let json = JSON.stringify(stateSnapshot);
    fs.writeFile(fileName, json, 'utf8', (error: any)=>{
        if (error) {
            logger.error("Error saving Snapshot" + String(error), {})
        } else {
            logger.verbose('Snapshot ' + fileName + ' Saved to storage folder', {})
        }
    });
}

export const getSnapShotList = () => {
    const files = fs.readdirSync(path.resolve('storage')).filter((file: string) => { 
        if (file.includes('.shot') && file !== 'default.shot') {
            return true
        }
    })
    return files
}

export const getCcgSettingsList = () => {
    const files = fs.readdirSync(path.resolve('storage')).filter((file: string) => { 
        if (file.includes('.ccg')) {
            return true
        }
    })
    return files
}
