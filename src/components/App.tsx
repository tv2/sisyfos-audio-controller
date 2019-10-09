import * as React from 'react';
import { connect } from "react-redux";
import { IStore } from '../reducers/indexReducer';

import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';
import Storage from './Storage'

//Utils:
import { loadSnapshotState, saveSnapshotState, saveSnapshotChannelState } from '../utils/SettingsStorage';
import { MixerGenericConnection } from '../utils/MixerConnection';
import { AutomationConnection } from '../utils/AutomationConnection';
import { HuiMidiRemoteConnection } from '../utils/HuiMidiRemoteConnection';
import { MixerProtocolPresets } from '../constants/MixerProtocolPresets';

export interface IAppProps {
    store: IStore
}

class App extends React.Component<IAppProps> {

    constructor(props: IAppProps) {
        super(props)
    }

    componentWillMount() {
        (window as any).mixerGenericConnection = new MixerGenericConnection();
        (window as any).automationConnection = new AutomationConnection();
        if (this.props.store.settings[0].enableRemoteFader){
            (window as any).huiRemoteConnection = new HuiMidiRemoteConnection();
        }
        this.snapShopStoreTimer();
        let selectedProtocol = MixerProtocolPresets[this.props.store.settings[0].mixerProtocol];
        let numberOfChannels: Array<number> = [];
        selectedProtocol.channelTypes.forEach((item, index) => {
            numberOfChannels.push(this.props.store.settings[0].numberOfChannelsInType[index]);
        });
        loadSnapshotState(
            this.props.store.faders[0],
            this.props.store.channels[0],
            numberOfChannels,
            this.props.store.settings[0].numberOfFaders,
            'default'
        );
    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return (
            nextProps.store.settings[0].showSettings != this.props.store.settings[0].showSettings
            || nextProps.store.settings[0].showStorage != this.props.store.settings[0].showStorage
        )
    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                saveSnapshotState(this.props.store.faders[0], 'default');
                saveSnapshotChannelState(this.props.store.channels[0], 'default');
            },
            2000);
    }

    render() {
        return (
        <div>
            <Channels />
            {this.props.store.settings[0].showStorage ? <Storage/> : null}
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
