import * as React from 'react';
import { connect } from "react-redux";
import { IStore } from '../../server/reducers/indexReducer';


import '../assets/css/App.css';
import Channels from './Channels';
import Settings from './Settings';
import Storage from './RoutingStorage'

export interface IAppProps {
    store: IStore
}

class App extends React.Component<IAppProps> {

    constructor(props: IAppProps) {
        super(props)
    }

    componentWillMount() {
        window.socketIoClient.emit('get-mixerprotocol', 'get selected mixerprotocol')
        window.socketIoClient.emit('get-store', 'update local store');
        window.socketIoClient.emit('get-settings', 'update local settings');        
    }

    public shouldComponentUpdate(nextProps: IAppProps) {
        return (
            nextProps.store.settings[0].showSettings != this.props.store.settings[0].showSettings
            || nextProps.store.settings[0].showStorage != this.props.store.settings[0].showStorage
        )
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
