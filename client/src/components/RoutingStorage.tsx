import React from 'react'

import '../assets/css/RoutingStorage.css'
import { Store } from 'redux'
import { connect } from 'react-redux'
import { SettingsActionTypes } from '../../../shared/src/actions/settingsActions'
import {
    SOCKET_GET_SNAPSHOT_LIST,
    SOCKET_LOAD_SNAPSHOT,
    SOCKET_SAVE_SNAPSHOT,
    SOCKET_GET_CCG_LIST,
    SOCKET_SAVE_CCG_FILE,
    SOCKET_GET_MIXER_PRESET_LIST,
    SOCKET_LOAD_MIXER_PRESET,
} from '../../../shared/src/constants/SOCKET_IO_DISPATCHERS'

interface StorageProps {
    load: any
    save: any
}
class Storage extends React.PureComponent<StorageProps & Store> {
    fileList: string[] = []
    loadSnapshot: any
    saveSnapshot: any

    constructor(props: any) {
        super(props)
        this.loadSnapshot = this.props.load
        this.saveSnapshot = this.props.save

        //Bindings:
        this.ListSnapshotFiles = this.ListSnapshotFiles.bind(this)
        this.ListCcgFiles = this.ListCcgFiles.bind(this)
        this.ListPresetFiles = this.ListPresetFiles.bind(this)
        this.loadMixerPreset = this.loadMixerPreset.bind(this)
        this.loadFile = this.loadFile.bind(this)
        this.saveFile = this.saveFile.bind(this)
    }

    handleClose = () => {
        this.props.dispatch({
            type: SettingsActionTypes.TOGGLE_SHOW_STORAGE,
        })
    }

    saveFile() {
        let fileName = window.prompt('Enter filename :', 'newfile')
        if (
            window.confirm(
                'Are you sure you will save ' +
                    fileName +
                    ' as new routing setup?'
            )
        ) {
            console.log('Saving file')
            window.socketIoClient.emit(SOCKET_SAVE_SNAPSHOT, fileName + '.shot')
        }
        this.handleClose()
    }

    loadFile(event: any) {
        if (window.confirm('Are you sure you will load a new routing setup?')) {
            console.log('Loading files')
            window.socketIoClient.emit(
                SOCKET_LOAD_SNAPSHOT,
                event.target.textContent
            )
        }
        this.handleClose()
    }

    loadCcgFile(event: any) {
        if (window.confirm('Are you sure you will load a CasparCG setup?')) {
            console.log('Setting default CasparCG file')
            window.socketIoClient.emit(
                SOCKET_SAVE_CCG_FILE,
                event.target.textContent
            )
        }
        this.handleClose()
    }

    loadMixerPreset(event: any) {
        if (window.confirm('Are you sure you will load a full Mixer setup?')) {
            console.log('Loading Mixer preset')
            window.socketIoClient.emit(
                SOCKET_LOAD_MIXER_PRESET,
                event.target.textContent
            )
        }
        this.handleClose()
    }

    ListSnapshotFiles() {
        window.socketIoClient.emit(SOCKET_GET_SNAPSHOT_LIST)
        const listItems = window.snapshotFileList.map(
            (file: string, index: number) => {
                return (
                    <li key={index} onClick={this.loadFile} className="item">
                        {file}
                    </li>
                )
            }
        )
        return <ul className="storage-list">{listItems}</ul>
    }

    ListCcgFiles() {
        window.socketIoClient.emit(SOCKET_GET_CCG_LIST)
        const listItems = window.ccgFileList.map(
            (file: string, index: number) => {
                return (
                    <li key={index} onClick={this.loadCcgFile} className="item">
                        {file}
                    </li>
                )
            }
        )
        return <ul className="storage-list">{listItems}</ul>
    }

    ListPresetFiles() {
        window.socketIoClient.emit(SOCKET_GET_MIXER_PRESET_LIST)
        const listItems = window.mixerPresetList.map(
            (file: string, index: number) => {
                return (
                    <li
                        key={index}
                        onClick={this.loadMixerPreset}
                        className="item"
                    >
                        {file}
                    </li>
                )
            }
        )
        return <ul className="storage-list">{listItems}</ul>
    }

    render() {
        return (
            <div className="channel-storage-body">
                <button className="close" onClick={() => this.handleClose()}>
                    X
                </button>
                <h2>STORAGE</h2>
                <br />
                {window.location.search.includes('settings=1') ? (
                    <React.Fragment>
                        <h3>SAVE ROUTING :</h3>
                        <button onClick={this.saveFile} className="button">
                            SAVE
                        </button>
                        <hr />
                        <h3>LOAD ROUTING :</h3>
                        <this.ListSnapshotFiles />
                    </React.Fragment>
                ) : null}
                {window.mixerPresetList.length > 0 ? (
                    <React.Fragment>
                        <br />
                        <hr />
                        <h3>LOAD MIXER PRESET :</h3>
                        <this.ListPresetFiles />
                    </React.Fragment>
                ) : null}
                {window.ccgFileList.length > 0 ? (
                    <React.Fragment>
                        <br />
                        <hr />
                        <h3>LOAD CASPARCG :</h3>
                        <this.ListCcgFiles />
                    </React.Fragment>
                ) : null}
            </div>
        )
    }
}

const mapStateToProps = (state: any, props: any): any => {
    return {
        load: props.load,
        save: props.save,
    }
}

export default connect<any>(mapStateToProps)(Storage) as any
