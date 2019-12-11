import React from 'react';

import '../assets/css/RoutingStorage.css';
import { Store } from 'redux';
import { connect } from 'react-redux';
import { TOGGLE_SHOW_STORAGE } from '../../server/reducers/settingsActions'

// Node modules:
const fs = window.fs

interface IStorageProps {
    load: any
    save: any
}
class Storage extends React.PureComponent<IStorageProps & Store> {
    path: string
    fileList: string[] = []
    load: any
    save: any

    constructor(props: any) {
        super(props);
        this.load = this.props.load
        this.save = this.props.save

        this.path = window.getPath('userData');

        this.updateFilelist()

        //Bindings:
        this.ListFiles = this.ListFiles.bind(this)
        this.updateFilelist = this.updateFilelist.bind(this)
        this.loadFile = this.loadFile.bind(this)
        this.saveFile = this.saveFile.bind(this)
    }

    updateFilelist() {
        this.fileList = fs.readdirSync(this.path)
    }

	handleClose = () => {
		this.props.dispatch({
			type: TOGGLE_SHOW_STORAGE
		});
    }
    
    saveFile() {
        const options = {
            type: 'saveFile',
            defaultPath: this.path,
            filters: [
                { name: 'Settings', extensions: ['shot'] }
              ],
            title: 'Save Current Setup',
            message: 'Stores the current state of Sisyfos - including Fader-Channel Routing',
        };
        let response = window.dialog.showSaveDialogSync(options)
        if (response) {
            console.log('SAVING THIS FILE :', response)
            this.save(response)
        }
        this.handleClose()
    }

    loadFile(event: any) {
        const options = {
            type: 'question',
            buttons: ['Yes', 'Cancel'],
            defaultId: 1,
            title: 'Load Routing',
            message: 'Load "' + event.target.textContent + '" Routing',
        };
        let response = window.dialog.showMessageBoxSync(options)
        if (!response) {
            console.log('Loading files')
            this.load(this.path + '/' + event.target.textContent, false)
        }
        this.handleClose()
    }

    ListFiles(props: any) {
        const files = props.files.filter((file: string) => { 
            return file.includes('.shot')
        })
        const listItems = files.map((file: string, index: number) => {
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
