
const fs = require('fs');
const electron = require('electron');
const folder = electron.remote.app.getPath('userData');


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


export const loadSnapshotState = (stateSnapshot: any, stateChannelSnapshot: any, numberOfChannels: Array<number>, numberOfFaders: number, fileName: string) => {
    try {
        const stateFromFile = JSON.parse(fs.readFileSync(folder + '/fader-state-' + fileName + '.json'));
        const stateFromChFile = JSON.parse(fs.readFileSync(folder + '/channel-state-' + fileName + '.json'));
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_FADER_STATE',
            allState: stateFromFile,
            numberOfTypeChannels: numberOfFaders
        });
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_CH_STATE',
            allState: stateFromChFile,
            numberOfTypeChannels: numberOfChannels
        });
    }
    catch (error) {
        console.log("Error loading Snapshot, new snapshot created");
        saveSnapshotState(stateSnapshot, 'default');
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_FADER_STATE',
            allState: stateSnapshot,
            numberOfTypeChannels: numberOfChannels
        });
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_CH_STATE',
            allState: stateChannelSnapshot,
            numberOfTypeChannels: numberOfChannels
        });
    }
};

export const saveSnapshotState = (stateSnapshot: any, fileName: string) => {
    let json = JSON.stringify(stateSnapshot);
    fs.writeFile(folder + '/fader-state-'+ fileName + '.json', json, 'utf8', (error: any)=>{
        //console.log(error);
    });
}

export const saveSnapshotChannelState = (stateSnapshot: any, fileName: string) => {
    let json = JSON.stringify(stateSnapshot);
    fs.writeFile(folder + '/channel-state-'+ fileName + '.json', json, 'utf8', (error: any)=>{
        //console.log(error);
    });
}

