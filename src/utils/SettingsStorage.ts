
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


export const loadSnapshotState = (stateSnapshot: any, numberOfChannels: Array<number>) => {
    try {
        const stateFromFile = JSON.parse(fs.readFileSync(folder + "/state.json"));
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_STATE',
            allState: stateFromFile,
            numberOfTypeChannels: numberOfChannels
        });
    }
    catch (error) {
        saveSnapshotState(stateSnapshot);
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_STATE',
            allState: stateSnapshot,
            numberOfTypeChannels: numberOfChannels
        });
    }
};

export const saveSnapshotState = (stateSnapshot: any) => {
    let json = JSON.stringify(stateSnapshot);
    fs.writeFile(folder + "/state.json", json, 'utf8', (error: any)=>{
        //console.log(error);
    });
}


