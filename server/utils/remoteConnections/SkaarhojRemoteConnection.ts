//Node Modules:
const net = require('net')
import { store, state } from '../../reducers/store'
import { mixerGenericConnection } from '../../mainClasses'

import {
    SET_FADER_LEVEL,
    TOGGLE_PGM,
    TOGGLE_PFL,
} from '../../reducers/faderActions'

//Utils:
import {
    IRemoteProtocol,
    RemoteFaderPresets,
    MidiReceiveTypes,
} from '../../constants/RemoteFaderPresets'
import { MixerProtocolPresets } from '../../constants/MixerProtocolPresets'
import { logger } from '../logger'

export class SkaarhojRemoteConnection {
    store: any
    remoteProtocol: IRemoteProtocol
    midiReceiveTypes = MidiReceiveTypes
    mixerProtocol: any
    midiInput: any
    midiOutput: any
    activeHuiChannel: number = 0

    constructor() {
        this.convertFromRemoteLevel = this.convertFromRemoteLevel.bind(this)
        this.convertToRemoteLevel = this.convertToRemoteLevel.bind(this)
        this.updateRemoteFaderState = this.updateRemoteFaderState.bind(this)

        this.remoteProtocol = RemoteFaderPresets.hui
        this.mixerProtocol =
            MixerProtocolPresets[state.settings[0].mixerProtocol] ||
            MixerProtocolPresets.genericMidi

        const server = net.createServer((socket: any) => {
            socket.write('Echo server\r\n')
            socket.pipe(socket)
        })

        server.listen(9923, '127.0.0.1')
        logger.info('Skaarhoj server listening at port 9923')

        server
            .on('connection', () => {
                this.setupRemoteFaderConnection()
            })
            .on('data', (data: any) => {
                console.log('Received: ' + data)
            })
            .on('close', function () {
                console.log('Connection closed')
            })
    }

    setupRemoteFaderConnection() {
        this.midiInput.addListener(
            this.midiReceiveTypes[
                this.remoteProtocol.fromRemote.CHANNEL_FADER_LEVEL.type
            ],
            undefined,
            (message: any) => {
                if (message.data[1] < 9) {
                    //Fader changed:
                    console.log(
                        'Received Fader message (' + message.data + ').'
                    )
                    store.dispatch({
                        type: SET_FADER_LEVEL,
                        channel: message.data[1],
                        level: this.convertFromRemoteLevel(message.data[2]),
                    })
                    mixerGenericConnection.updateOutLevel(message.data[1])
                    this.updateRemoteFaderState(
                        message.data[1],
                        this.convertFromRemoteLevel(message.data[2])
                    )
                } else if ((message.data[1] = 15)) {
                    console.log('Received message (' + message.data + ').')
                    if (message.data[2] < 9) {
                        //Set active channel for next midi message:
                        this.activeHuiChannel = message.data[2]
                    } else if (message.data[2] && message.data[2] === 65) {
                        //SELECT button - toggle PGM ON/OFF
                        store.dispatch({
                            type: TOGGLE_PGM,
                            channel: this.activeHuiChannel,
                        })
                        mixerGenericConnection.updateOutLevel(
                            this.activeHuiChannel
                        )
                        this.updateRemotePgmPstPfl(this.activeHuiChannel)
                    } else if (message.data[2] && message.data[2] === 67) {
                        //SOLO button - toggle PFL ON/OFF
                        store.dispatch({
                            type: TOGGLE_PFL,
                            channel: this.activeHuiChannel,
                        })
                        mixerGenericConnection.updateOutLevel(
                            this.activeHuiChannel
                        )
                        this.updateRemotePgmPstPfl(this.activeHuiChannel)
                    }
                }
            }
        )
        //for testing:
        this.midiInput.addListener('noteon', 'all', (error: any) => {
            console.log(
                "Received 'noteon' message (" +
                    error.note.name +
                    error.note.octave +
                    ').'
            )
        })
    }

    convertToRemoteLevel(level: number) {
        let oldMin = this.mixerProtocol.fader.min
        let oldMax = this.mixerProtocol.fader.max
        let newMin = this.remoteProtocol.fader.min
        let newMax = this.remoteProtocol.fader.max

        let indexLevel = (level / (oldMax - oldMin)) * (newMax - newMin)
        let newLevel = newMin + indexLevel
        return newLevel //convert from mixer min-max to remote min-max
    }

    convertFromRemoteLevel(level: number) {
        let oldMin = this.remoteProtocol.fader.min
        let oldMax = this.remoteProtocol.fader.max
        let newMin = this.mixerProtocol.fader.min
        let newMax = this.mixerProtocol.fader.max

        let indexLevel = (level / (oldMax - oldMin)) * (newMax - newMin)
        let newLevel = newMin + indexLevel

        return newLevel //convert from mixer min-max to remote min-max
    }

    updateRemoteFaderState(channelIndex: number, outputLevel: number) {
        if (!this.midiOutput) {
            return
        }
        console.log(
            'Send fader update :',
            'Channel index : ',
            channelIndex,
            'OutputLevel : ',
            this.convertToRemoteLevel(outputLevel)
        )
        this.midiOutput.sendControlChange(
            channelIndex,
            this.convertToRemoteLevel(outputLevel),
            1
        )
        this.midiOutput.sendControlChange(32 + channelIndex, 0, 1)
        this.updateRemotePgmPstPfl(channelIndex)
    }

    updateRemotePgmPstPfl(channelIndex: number) {
        if (!this.midiOutput) {
            return
        }
        //Update SELECT button:
        this.midiOutput.sendControlChange(12, channelIndex, 1)
        this.midiOutput.sendControlChange(
            44,
            1 + 64 * (state.faders[0].fader[channelIndex].pgmOn ? 1 : 0),
            1
        )

        //Update SOLO button:
        this.midiOutput.sendControlChange(12, channelIndex, 1)
        this.midiOutput.sendControlChange(
            44,
            3 + 64 * (state.faders[0].fader[channelIndex].pflOn ? 1 : 0),
            1
        )
    }
}
