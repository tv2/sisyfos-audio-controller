import * as React from 'react';
import { connect } from "react-redux";
import { IStore } from '../reducers/indexReducer';
import * as electron from 'electron'


import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';
import Storage from './RoutingStorage'

//Utils:
import { loadSnapshotState, saveSnapshotState } from '../utils/SettingsStorage';
import { MixerGenericConnection } from '../utils/MixerConnection';
import { AutomationConnection } from '../utils/AutomationConnection';
import { HuiMidiRemoteConnection } from '../utils/HuiMidiRemoteConnection';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';

export interface IAppProps {
    store: IStore
}

class App extends React.Component<IAppProps> {
    numberOfChannels: number[] = []
    settingsPath: string = ''

    constructor(props: IAppProps) {
        super(props)
        this.saveSnapshotSettings = this.saveSnapshotSettings.bind(this)
        this.loadSnapshotSettings = this.loadSnapshotSettings.bind(this)
    }

    componentWillMount() {
        (window as any).mixerGenericConnection = new MixerGenericConnection();
        (window as any).automationConnection = new AutomationConnection();
        if (this.props.store.settings[0].enableRemoteFader){
            (window as any).huiRemoteConnection = new HuiMidiRemoteConnection();
        }
        this.settingsPath = electron.remote.app.getPath('userData');

        this.snapShopStoreTimer();
        let selectedProtocol = MixerProtocolPresets[this.props.store.settings[0].mixerProtocol];
        selectedProtocol.channelTypes.forEach((item, index) => {
            this.numberOfChannels.push(this.props.store.settings[0].numberOfChannelsInType[index]);
        });
        this.loadSnapshotSettings(this.settingsPath + '/default.shot', true)
        // ** UNCOMMENT TO DUMP A FULL STORE:
        // const fs = require('fs')
        // fs.writeFileSync('src/components/__tests__/__mocks__/parsedFullStore-UPDATE.json', JSON.stringify(window.storeRedux.getState()))

    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return (
            nextProps.store.settings[0].showSettings != this.props.store.settings[0].showSettings
            || nextProps.store.settings[0].showStorage != this.props.store.settings[0].showStorage
        )
    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                let snapshot = {
                    faderState: this.props.store.faders[0],
                    channelState: this.props.store.channels[0]
                }
                saveSnapshotState(snapshot, this.settingsPath + '/default.shot');
            },
            2000);
    }

    loadSnapshotSettings(fileName: string, loadAll: boolean) {
        loadSnapshotState(
            this.props.store.faders[0],
            this.props.store.channels[0],
            this.numberOfChannels,
            this.props.store.settings[0].numberOfFaders,
            fileName,
            loadAll
        );
    }

    saveSnapshotSettings(fileName: string) {
        let snapshot = {
            faderState: this.props.store.faders[0],
            channelState: this.props.store.channels[0]
        }
        saveSnapshotState(snapshot, fileName);
    }

    render() {
        return (
        <div>
            <Channels />
            {this.props.store.settings[0].showStorage ? <Storage load={this.loadSnapshotSettings} save={this.saveSnapshotSettings}/> : null}
            {this.props.store.settings[0].showSettings ? <Settings/> : null}
        </div>
        )
    }
}


const mapStateToProps = (state: any): IAppProps => {
    return {
        store: state
    }
}

export default connect<any, IAppProps>(mapStateToProps)(App) as any;
