import React from 'react';

import '../assets/css/RoutingStorage.css';
import { Store } from 'redux';
import { connect } from 'react-redux';
import Popup from 'reactjs-popup'
import { TOGGLE_SHOW_STORAGE } from '../../server/reducers/settingsActions'
import { SOCKET_GET_SNAPSHOT_LIST, SOCKET_LOAD_SNAPSHOT, SOCKET_SAVE_SNAPSHOT } from '../../server/constants/SOCKET_IO_DISPATCHERS';

interface IStorageProps {
    load: any
    save: any
}
class Storage extends React.PureComponent<IStorageProps & Store> {
    fileList: string[] = []
    load: any
    save: any

    constructor(props: any) {
        super(props);
        this.load = this.props.load
        this.save = this.props.save

        //Bindings:
        this.ListFiles = this.ListFiles.bind(this)
        this.loadFile = this.loadFile.bind(this)
        this.saveFile = this.saveFile.bind(this)
    }

	handleClose = () => {
		this.props.dispatch({
			type: TOGGLE_SHOW_STORAGE
		});
    }
    
    saveFile() {
        let fileName = window.prompt('Enter filename :', 'newfile')
        if (window.confirm('Are you sure you will save ' + fileName + ' as new routing setup?'))
        {
            console.log('Saving file')
            window.socketIoClient.emit(SOCKET_SAVE_SNAPSHOT, fileName + '.shot')
        }
        this.handleClose()
    }

    loadFile(event: any) {
        if (window.confirm('Are you sure you will load a new routing setup?'))
        {
            console.log('Loading files')
            window.socketIoClient.emit(SOCKET_LOAD_SNAPSHOT, event.target.textContent)
        }
        this.handleClose()
    }

    ListFiles(props: any) {
        window.socketIoClient.emit(SOCKET_GET_SNAPSHOT_LIST)
        const listItems = window.snapshotFileList.map((file: string, index: number) => {
        return (
            <li key={index} onClick={this.loadFile} className="item">
            {file}
       </li>)
        }
        );
        return (
          <ul className="storage-list">
            {listItems}
            </ul>
        );
    }

    render() {
        return (
            <div className="channel-storage-body">
                <button className="close" onClick={() => this.handleClose()}>X</button>
                <h2>ROUTING</h2>
                <br/>
                <h3>SAVE ROUTING :</h3>
                <button onClick={this.saveFile} className="button">
                    SAVE
                </button>
                <hr/>
                <h3>LOAD ROUTING :</h3>
                <this.ListFiles files = {this.fileList}/>
            </div>
        )
    }

}

const mapStateToProps = (state: any, props: any): any => {
    return {
        load: props.load,
        save: props.save
    }
}

export default connect<any>(mapStateToProps)(Storage) as any;
