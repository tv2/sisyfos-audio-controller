import * as React from 'react';
import { connect } from "react-redux";
import { IStore } from '../reducers/indexReducer';

import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';

//Utils:
import { loadSnapshotState, saveSnapshotState } from '../utils/SettingsStorage';
import { MixerGenericConnection } from '../utils/MixerConnection';
import { AutomationConnection } from '../utils/AutomationConnection';
import { HuiMidiRemoteConnection } from '../utils/HuiMidiRemoteConnection';
import { Store, AnyAction } from 'redux';
import { ISettings } from '../reducers/settingsReducer';
import { IChannels } from '../reducers/channelsReducer';

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
        (window as any).huiRemoteConnection = new HuiMidiRemoteConnection();
        this.snapShopStoreTimer();
        loadSnapshotState(this.props.store.channels[0], this.props.store.settings[0].numberOfChannelsInType[0]);
    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return nextProps.store.settings[0].showSettings != this.props.store.settings[0].showSettings
    }

    snapShopStoreTimer() {
        const saveTimer = setInterval(() => {
                saveSnapshotState(this.props.store.channels[0]);
            },
            2000);
    }

    render() {
        return (
        <div>
            <Channels />
            {this.props.store.settings[0].showSettings ? <Settings/> : <div></div>}
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
