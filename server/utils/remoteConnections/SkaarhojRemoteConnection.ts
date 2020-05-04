//Node Modules:
const Net = require('net')
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
    RawReceiveTypes,
} from '../../constants/remoteProtocols/SkaarhojProtocol'
import { MixerProtocolPresets } from '../../constants/MixerProtocolPresets'
import { logger } from '../logger'

export class SkaarhojRemoteConnection {
    store: any
    remoteProtocol: IRemoteProtocol
    rawReceiveTypes = RawReceiveTypes
    mixerProtocol: any
    rawInput: any
    rawOutput: any
    activeRawChannel: number = 0

    constructor() {
        this.convertFromRemoteLevel = this.convertFromRemoteLevel.bind(this)
        this.convertToRemoteLevel = this.convertToRemoteLevel.bind(this)
        this.updateRemoteFaderState = this.updateRemoteFaderState.bind(this)

        this.remoteProtocol = RemoteFaderPresets.rawPanel
        this.mixerProtocol =
            MixerProtocolPresets[state.settings[0].mixerProtocol] ||
            MixerProtocolPresets.genericMidi

        const server = Net.createServer((socket: any) => {
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
        this.rawInput.addListener(
            this.rawReceiveTypes[
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
                        this.activeRawChannel = message.data[2]
                    } else if (message.data[2] && message.data[2] === 65) {
                        //SELECT button - toggle PGM ON/OFF
                        store.dispatch({
                            type: TOGGLE_PGM,
                            channel: this.activeRawChannel,
                        })
                        mixerGenericConnection.updateOutLevel(
                            this.activeRawChannel
                        )
                        this.updateRemotePgmPstPfl(this.activeRawChannel)
                    } else if (message.data[2] && message.data[2] === 67) {
                        //SOLO button - toggle PFL ON/OFF
                        store.dispatch({
                            type: TOGGLE_PFL,
                            channel: this.activeRawChannel,
                        })
                        mixerGenericConnection.updateOutLevel(
                            this.activeRawChannel
                        )
                        this.updateRemotePgmPstPfl(this.activeRawChannel)
                    }
                }
            }
        )
        //for testing:
        this.rawInput.addListener('noteon', 'all', (error: any) => {
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
        if (!this.rawOutput) {
            return
        }
        console.log(
            'Send fader update :',
            'Channel index : ',
            channelIndex,
            'OutputLevel : ',
            this.convertToRemoteLevel(outputLevel)
        )
        this.rawOutput.sendControlChange(
            channelIndex,
            this.convertToRemoteLevel(outputLevel),
            1
        )
        this.rawOutput.sendControlChange(32 + channelIndex, 0, 1)
        this.updateRemotePgmPstPfl(channelIndex)
    }

    updateRemotePgmPstPfl(channelIndex: number) {
        if (!this.rawOutput) {
            return
        }
        //Update SELECT button:
        this.rawOutput.sendControlChange(12, channelIndex, 1)
        this.rawOutput.sendControlChange(
            44,
            1 + 64 * (state.faders[0].fader[channelIndex].pgmOn ? 1 : 0),
            1
        )

        //Update SOLO button:
        this.rawOutput.sendControlChange(12, channelIndex, 1)
        this.rawOutput.sendControlChange(
            44,
            3 + 64 * (state.faders[0].fader[channelIndex].pflOn ? 1 : 0),
            1
        )
    }
}
