//Node Modules:
const osc = require('osc')
const CasparCG = require('casparcg-connection')

//Utils:
import { ICasparCGMixerGeometry, ICasparCGChannelLayerPair } from '../constants/MixerProtocolInterface';
import { IStore } from '../reducers/indexReducer';
import { IChannel } from '../reducers/channelsReducer';
import { SET_PRIVATE } from  '../reducers/channelActions'
import { SET_VU_LEVEL, SET_CHANNEL_LABEL } from '../reducers/faderActions'

interface CommandChannelMap {
    [key: string]: number
}

interface ICasparCGChannel extends IChannel {
    producer?: string
    source?: string
}

const OSC_PATH_PRODUCER = /\/channel\/(\d+)\/stage\/layer\/(\d+)\/producer\/type/
const OSC_PATH_PRODUCER_FILE_NAME = /\/channel\/(\d+)\/stage\/layer\/(\d+)\/file\/path/
const OSC_PATH_PRODUCER_CHANNEL_LAYOUT = /\/channel\/(\d+)\/stage\/layer\/(\d+)\/producer\/channel_layout/

export class CasparCGConnection {
    store: IStore;
    mixerProtocol: ICasparCGMixerGeometry;
    connection: any;
    oscClient: any;
    oscCommandMap: { [key: string]: CommandChannelMap } = {};

    constructor(mixerProtocol: ICasparCGMixerGeometry) {
        this.store = global.storeRedux.getState() as IStore;
        const unsubscribe = global.storeRedux.subscribe(() => {
            this.store = global.storeRedux.getState() as IStore;
        });

        this.mixerProtocol = mixerProtocol

        this.connection = new CasparCG({
            autoReconnect: true,
            autoReconnectAttempts: 20,
            autoReconnectInterval: 3000,
            host: this.store.settings[0].deviceIp,
            port: parseInt(this.store.settings[0].devicePort + ''),
        })
        console.log("Trying to connect to CasparCG...")
        this.connection.onConnected = () => {
            console.log("CasparCG connected");
            this.setupMixerConnection();
        }
        this.connection.onDisconnected = () => {
            console.log("CasparCG disconnected");
        }
        this.connection.connect();

        this.oscCommandMap.CHANNEL_VU = {}
        this.mixerProtocol.fromMixer.CHANNEL_VU.forEach((paths, index) => {
            this.oscCommandMap.CHANNEL_VU[paths[0]] = index
        })
    }

    setupMixerConnection() {
        if (!this.oscClient) {
            const remotePort = parseInt(this.store.settings[0].devicePort + '') + 1000
            this.oscClient = new osc.UDPPort({
                localAddress: this.store.settings[0].localIp,
                localPort: remotePort,
                remoteAddress: this.store.settings[0].deviceIp,
                remotePort
            })
            .on('ready', () => {
                console.log("Receiving state of mixer");
            })
            .on('message', (message: any) => {
                const index = this.checkOscCommand(message.address, this.oscCommandMap.CHANNEL_VU)
                if (index !== undefined && message.args) {
                    global.storeRedux.dispatch({
                        type: SET_VU_LEVEL,
                        channel: index,
                        // CCG returns "produced" audio levels, before the Volume mixer transform
                        // We therefore want to premultiply this to show useful information about audio levels
                        level: Math.min(1, message.args[0] * this.store.faders[0].fader[index].faderLevel)
                    });
                } else if (this.mixerProtocol.sourceOptions) {
                    const m = message.address.split('/');

                    if (m[1] === 'channel' && m[6] === 'producer' && m[7] === 'type') {
                        const index = this.mixerProtocol.sourceOptions.sources.findIndex(i => i.channel === parseInt(m[2], 10) && i.layer === parseInt(m[5]))
                        if (index >= 0) {
                            global.storeRedux.dispatch({
                                type: SET_PRIVATE,
                                channel: index,
                                tag: 'producer',
                                value: message.args[0]
                            })
                        }
                    } else if (m[1] === 'channel' && m[6] === 'producer' && m[7] === 'channel_layout') {
                        const index = this.mixerProtocol.sourceOptions.sources.findIndex(i => i.channel === parseInt(m[2], 10) && i.layer === parseInt(m[5]))
                        if (index >= 0) {
                            global.storeRedux.dispatch({
                                type: SET_PRIVATE,
                                channel: index,
                                tag: 'channel_layout',
                                value: message.args[0]
                            })
                        }
                    } else if (m[1] === 'channel' && m[6] === 'file' && m[7] === 'path') {
                        const index = this.mixerProtocol.sourceOptions.sources.findIndex(i => i.channel === parseInt(m[2], 10) && i.layer === parseInt(m[5]))
                        if (index >= 0) {
                            global.storeRedux.dispatch({
                                type: SET_PRIVATE,
                                channel: index,
                                tag: 'file_path',
                                value: message.args[0].low
                            })
                        }
                    }
                }
            })
            .on('error', (error: any) => {
                console.log("Error : ", error);
                console.log("Lost OSC connection");
            });

            this.oscClient.open();
            console.log("Listening for status on CasparCG: ", this.store.settings[0].deviceIp, remotePort)
        }

        // Restore mixer values to the ones we have internally
        this.store.faders[0].fader.forEach((channel, index) => {
            this.updateFadeIOLevel(index, channel.faderLevel);
            this.updatePflState(index);
        })

        // Set source labels from geometry definition
        if (this.mixerProtocol.channelLabels) {
            this.mixerProtocol.channelLabels.forEach((label, channelIndex) => {
                global.storeRedux.dispatch({
                    type: SET_CHANNEL_LABEL,
                    channel: channelIndex,
                    label
                });
            });
        }
    }

    checkOscCommand(address: string, commandSpace: CommandChannelMap): number | undefined {
        const index = commandSpace[address]
        if (index !== undefined) {
            return index
        }
        return undefined
    }

    findChannelIndex(channel: number, layer: number, channelLayerPairs: Array<ICasparCGChannelLayerPair[]>, matchFirst?: boolean): number {
        return channelLayerPairs.findIndex((i) => {
            if (matchFirst) {
                return (i[0].channel === channel && i[0].layer === layer)
            }
            return !!i.find(j => j.channel === channel && j.layer === layer)
        })
    }

    pingMixerCommand = () => {
        //Ping OSC mixer if mixerProtocol needs it.
        /* this.mixerProtocol.pingCommand.map((command) => {
            this.sendOutMessage(
                command.mixerMessage,
                0,
                command.value
            );
        }); */
    }

    private syncCommand = Promise.resolve()
    controlVolume = (channel: number, layer: number, value: number) => {
        this.syncCommand = this.syncCommand.then(() =>
            this.connection.mixerVolume(channel, layer, value, 0, undefined).catch((e: any) => {
                console.error('Failed to send command', e);
            })
        ).then(() => { })
    }

    controlChannelSetting = (channel: number, layer: number, producer: string, file: string, setting: string, value: string) => {
        this.connection.stop(channel, layer)
        .then(() => {
            if (setting === 'CHANNEL_LAYOUT') {
                switch (producer) {
                    case 'ffmpeg':
                        return this.connection.play(
                            channel,
                            layer,
                            file,
                            true,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            value);
                    case 'decklink':
                        return this.connection.playDecklink(
                            channel,
                            layer,
                            parseInt(file, 10),
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            value);
                }
            }
            return Promise.reject('Unknown operation');
        }).then(() => {

        }).catch((e: any) => {
            console.error('Failed to change channel setting', e);
        })
    }

    setAllLayers = (pairs: ICasparCGChannelLayerPair[], value: number) => {
        pairs.forEach((i) => {
            this.controlVolume(i.channel, i.layer, value);
        })
    }

    updateChannelSetting(channelIndex: number, setting: string, value: string) {
        if (this.mixerProtocol.sourceOptions && this.store.channels[0].channel[channelIndex].private) {
            const pair = this.mixerProtocol.sourceOptions.sources[channelIndex];
            const producer = this.store.channels[0].channel[channelIndex].private!['producer'];
            let filePath = String(this.store.channels[0].channel[channelIndex].private!['file_path']);
            filePath = filePath.replace(/\.[\w\d]+$/, '')
            this.controlChannelSetting(pair.channel, pair.layer, producer, filePath, setting, value);
        }
    }

    updatePflState(channelIndex: number) {
        if (channelIndex > this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1) {
            return
        }

        if (this.store.faders[0].fader[channelIndex].pflOn === true) {
            // Enable SOLO on this channel on MONITOR
            const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[channelIndex];
            this.setAllLayers(pairs, this.store.faders[0].fader[channelIndex].faderLevel);

            // Ensure that all other non-SOLO channels are muted on MONITOR
            const others = this.store.faders[0].fader
                .map((i, index) => i.pflOn ? undefined : index)
                .filter(i => (
                    i !== undefined &&
                    i < this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL.length
                )) as number[]
            others.forEach(i => {
                const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[i];
                this.setAllLayers(pairs, this.mixerProtocol.fader.min);
            })
        } else {
            // check if any other channels are SOLO
            const others = this.store.faders[0].fader
                .map((i, index) => i.pflOn ? index : undefined)
                .filter(i => (
                    i !== undefined &&
                    i < this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL.length
                )) as number[]

            if (others.length > 0) {
                // other channels are SOLO, mute this channel on MONITOR
                const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[channelIndex];
                this.setAllLayers(pairs, this.mixerProtocol.fader.min);
            } else {
                // There are no other SOLO channels, restore MONITOR to match PGM
                this.store.channels[0].channel.forEach((i, index) => {
                    if (index > this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL.length - 1) {
                        return
                    }

                    const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[index];
                    this.setAllLayers(pairs, this.store.channels[0].channel[index].outputLevel);
                })
            }
        }
    }
    
    updateMuteState(channelIndex: number, muteOn: boolean) {
        return true
    } 

    updateNextAux(channelIndex: number, level: number) {
        return true
    } 

    updateThreshold(channelIndex: number, level: number) {
        return true
    }
    updateRatio(channelIndex: number, level: number) {        return true

    }
    updateLow(channelIndex: number, level: number) {
         return true
    }
    updateMid(channelIndex: number, level: number) {
        return true
    }
    updateHigh(channelIndex: number, level: number) {
        return true
    }
    updateAuxLevel(channelIndex: number, auxSendIndex: number, level: number) {
        return true
    }

    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        if (channelIndex > this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1) {
            return
        }

        const pgmPairs = this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL[channelIndex]
        this.setAllLayers(pgmPairs, outputLevel)

        const anyPflOn = this.store.faders[0].fader.reduce((memo, i) => memo || i.pflOn, false)
        // Check if there are no SOLO channels on MONITOR or there are, but this channel is SOLO
        if (!anyPflOn || (anyPflOn && this.store.faders[0].fader[channelIndex].pflOn)) {
            const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[channelIndex];
            if (this.store.faders[0].fader[channelIndex].pflOn) {
                this.setAllLayers(pairs, this.store.faders[0].fader[channelIndex].faderLevel);
            } else {
                this.setAllLayers(pairs, outputLevel);
            }
        }
    }

    updateChannelName(channelIndex: number) {
        //CasparCG does not need Labels.
    }
}

