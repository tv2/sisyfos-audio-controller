
const fs = require('fs');
const electron = require('electron');
const folder = electron.remote.app.getPath('userData');
import { SET_COMPLETE_CH_STATE } from '../reducers/channelActions'
import { SET_COMPLETE_FADER_STATE } from  '../reducers/faderActions'


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
                    channel.assignedFader = stateFromFile.channelState.channel[index].assignedFader
                } else {
                    channel.assignedFader = -1
                }
                return channel
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

