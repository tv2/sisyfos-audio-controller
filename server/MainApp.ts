//Utils:
import { loadSnapshotState, saveSnapshotState } from './utils/SettingsStorage';
import { MixerGenericConnection } from './utils/MixerConnection';
import { AutomationConnection } from './utils/AutomationConnection';
import { HuiMidiRemoteConnection } from './utils/HuiMidiRemoteConnection';
import { MixerProtocolPresets } from './constants/MixerProtocolPresets';
const path = require('path')
export class MainApp {
    numberOfChannels: number[] = []
    settingsPath: string = ''
    store: any

    constructor() {
        console.log('SETTINGS UP STATE')

        //Get redux store:
        this.store = global.storeRedux.getState();
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState();
        });


        global.mixerGenericConnection = new MixerGenericConnection();
        global.automationConnection = new AutomationConnection();
        if (this.store.settings[0].enableRemoteFader){
            global.huiRemoteConnection = new HuiMidiRemoteConnection();
        }

        this.snapShopStoreTimer();
        global.mixerProtocol = MixerProtocolPresets[this.store.settings[0].mixerProtocol];
        global.mixerProtocol.channelTypes.forEach((item: any, index: number) => {
            this.numberOfChannels.push(this.store.settings[0].numberOfChannelsInType[index]);
        });
        this.loadSnapshotSettings(path.resolve('storage', 'default.shot'), true)

        // ** UNCOMMENT TO DUMP A FULL STORE:
        //const fs = require('fs')
        //fs.writeFileSync('src/components/__tests__/__mocks__/parsedFullStore-UPDATE.json', JSON.stringify(global.storeRedux.getState()))

    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                let snapshot = {
                    faderState: this.store.faders[0],
                    channelState: this.store.channels[0]
                }
                saveSnapshotState(snapshot, path.resolve(this.settingsPath, 'storage', 'default.shot'))
            },
            2000);
    }

    loadSnapshotSettings(fileName: string, loadAll: boolean) {
        loadSnapshotState(
            this.store.faders[0],
            this.store.channels[0],
            this.numberOfChannels,
            this.store.settings[0].numberOfFaders,
            fileName,
            loadAll
        );
    }

    saveSnapshotSettings(fileName: string) {
        let snapshot = {
            faderState: this.store.faders[0],
            channelState: this.store.channels[0]
        }
        saveSnapshotState(snapshot, fileName);
    }
}