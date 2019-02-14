
const fs = require('fs');
const electron = require('electron');
const folder = electron.remote.app.getPath('userData');


export const loadSettings = (storeRedux) => {
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

export const saveSettings = (settings) => {
    let json = JSON.stringify(settings);
    fs.writeFile(folder + "/settings.json", json, 'utf8', (error)=>{
        console.log(error);
    });
};


export const loadSnapshotState = (stateSnapshot) => {
    try {
        const stateFromFile = JSON.parse(fs.readFileSync(folder + "/state.json"));
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_STATE',
            allState: stateFromFile
        });
    }
    catch (error) {
        saveSnapshotState(stateSnapshot);
        window.storeRedux.dispatch({
            type:'SET_COMPLETE_STATE',
            allState: stateSnapshot
        });
    }
};

export const saveSnapshotState = (stateSnapshot) => {
    let json = JSON.stringify(stateSnapshot);
    fs.writeFile(folder + "/state.json", json, 'utf8', (error)=>{
        console.log(error);
    });
    console.log("StateStorage updated");
}


