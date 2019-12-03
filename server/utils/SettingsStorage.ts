// Node Modules:
import { remote } from 'electron'
const fs = require('fs')
const folder = remote.app.getPath('userData');

// Redux:
import { SET_COMPLETE_CH_STATE } from '../../src/reducers/channelActions'
import { SET_COMPLETE_FADER_STATE } from  '../../src/reducers/faderActions'


export const loadSettings = (storeRedux: any) => {
    let settingsInterface = storeRedux.settings[0];
    try {
        const settingsFromFile = JSON.parse(fs.readFileSync(folder + "/settings.json"));
        return (settingsFromFile);
    }
    catch (error) {
        saveSettings(settingsInterface);
        return (settingsInterface);
    }
};

export const saveSettings = (settings: any) => {
    let json = JSON.stringify(settings);
    fs.writeFile(folder + "/settings.json", json, 'utf8', (error: any)=>{
        console.log(error);
    });
};


export const loadSnapshotState = (stateSnapshot: any, stateChannelSnapshot: any, numberOfChannels: Array<number>, numberOfFaders: number, fileName: string, loadAll: boolean) => {
    try {
        const stateFromFile = JSON.parse(fs.readFileSync(fileName));
        /*
        if (loadAll) {
            window.storeRedux.dispatch({
                type:SET_COMPLETE_FADER_STATE,
                allState: stateFromFile.faderState,
                numberOfTypeChannels: numberOfFaders
            });
            window.storeRedux.dispatch({
                type: SET_COMPLETE_CH_STATE,
                allState: stateFromFile.channelState,
                numberOfTypeChannels: numberOfChannels
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

            window.storeRedux.dispatch({
                type: SET_COMPLETE_FADER_STATE,
                allState: stateSnapshot,
                numberOfTypeChannels: numberOfFaders
            });
            window.storeRedux.dispatch({
                type:SET_COMPLETE_CH_STATE,
                allState: stateChannelSnapshot,
                numberOfTypeChannels: numberOfChannels
            });
        }
        */
    }
    catch (error) {
        console.log("Error loading Snapshot");
    }
};

export const saveSnapshotState = (stateSnapshot: any, fileName: string) => {
    let json = JSON.stringify(stateSnapshot);
    fs.writeFile(fileName, json, 'utf8', (error: any)=>{
        //console.log(error);
    });
}

