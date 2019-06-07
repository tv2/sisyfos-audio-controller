//Node Modules:
import * as os from 'os'; // Used to display (log) network addresses on local machine
import { CasparCG } from 'casparcg-connection';
import * as osc from 'osc';

//Utils:
import { IMixerProtocol, MixerProtocolPresets, ICasparCGMixerGeometry, ChannelLayerPair } from '../constants/MixerProtocolPresets';
import { IStore } from '../reducers/indexReducer';
import { IChannel } from '../reducers/channelsReducer';

export class CasparCGConnection {
    store: IStore;
    mixerProtocol: ICasparCGMixerGeometry;
    connection: CasparCG;
    oscClient: osc.UDPPort | undefined;

    constructor(mixerProtocol: ICasparCGMixerGeometry) {
        this.store = window.storeRedux.getState() as IStore;
        const unsubscribe = window.storeRedux.subscribe(() => {
            this.store = window.storeRedux.getState() as IStore;
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
    }

    setupMixerConnection() {
        if (!this.oscClient) {
            this.oscClient = new osc.UDPPort({
                localAddress: this.store.settings[0].localIp,
                localPort: parseInt(this.store.settings[0].localOscPort + ''),
                remoteAddress: this.store.settings[0].deviceIp,
                remotePort: parseInt(this.store.settings[0].devicePort + '') + 1000
            })
            .on('ready', () => {
    
            })
            .on('error', (error: any) => {
                console.log("Error : ", error);
                console.log("Lost OSC connection");
            });
        }

        // Restore mixer values to the ones we have internally
        this.store.channels[0].channel.forEach((channel, index) => {
            this.updateOutLevel(index);
            this.updatePflState(index);
        })

        // Set source labels from geometry definition
        if (this.mixerProtocol.channelLabels) {
            this.mixerProtocol.channelLabels.forEach((label, channelIndex) => {
                window.storeRedux.dispatch({
                    type: 'SET_CHANNEL_LABEL',
                    channel: channelIndex,
                    label
                });
            });
        }
    }

    pingMixerCommand = () => {
        //Ping OSC mixer if mixerProtocol needs it.
        /* this.mixerProtocol.pingCommand.map((command) => {
            this.sendOutMessage(
                command.oscMessage,
                0,
                command.value
            );
        }); */
    }

    controlVolume = (channel: number, layer: number, value: number) => {
        this.connection.mixerVolume(channel, layer, value, 0, undefined).catch((e) => {
            console.error('Failed to send command', e);
        })
    }

    setAllLayers = (pairs: ChannelLayerPair[], value: number) => {
        pairs.forEach((i) => {
            this.controlVolume(i.channel, i.layer, value);
        })
    }

    updateOutLevel(channelIndex: number) {
        if (channelIndex > this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1) {
            return
        }

        if (this.mixerProtocol.mode === "master" && this.store.channels[0].channel[channelIndex].pgmOn) {
            window.storeRedux.dispatch({
                type:'SET_OUTPUT_LEVEL',
                channel: channelIndex,
                level: this.store.channels[0].channel[channelIndex].faderLevel
            });
        }
        const pairs = this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL[channelIndex];
        this.setAllLayers(pairs, this.store.channels[0].channel[channelIndex].outputLevel);

        const anyPflOn = this.store.channels[0].channel.reduce((memo, i) => memo || i.pflOn, false)
        // Check if there are no SOLO channels on MONITOR or there are, but this channel is SOLO
        if (!anyPflOn || (anyPflOn && this.store.channels[0].channel[channelIndex].pflOn)) {
            const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[channelIndex];
            if (this.store.channels[0].channel[channelIndex].pflOn) {
                this.setAllLayers(pairs, this.store.channels[0].channel[channelIndex].faderLevel);
            } else {
                this.setAllLayers(pairs, this.store.channels[0].channel[channelIndex].outputLevel);
            }
        }
    }

    updatePflState(channelIndex: number) {
        if (channelIndex > this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1) {
            return
        }

        if (this.store.channels[0].channel[channelIndex].pflOn === true) {
            // Enable SOLO on this channel on MONITOR
            const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[channelIndex];
            this.setAllLayers(pairs, this.store.channels[0].channel[channelIndex].faderLevel);

            // Ensure that all other non-SOLO channels are muted on MONITOR
            const others = this.store.channels[0].channel
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
            const others = this.store.channels[0].channel
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


    updateFadeIOLevel(channelIndex: number, outputLevel: number) {
        if (channelIndex > this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL.length - 1) {
            return
        }

        const pgmPairs = this.mixerProtocol.toMixer.PGM_CHANNEL_FADER_LEVEL[channelIndex]
        this.setAllLayers(pgmPairs, outputLevel)

        const anyPflOn = this.store.channels[0].channel.reduce((memo, i) => memo || i.pflOn, false)
        // Check if there are no SOLO channels on MONITOR or there are, but this channel is SOLO
        if (!anyPflOn || (anyPflOn && this.store.channels[0].channel[channelIndex].pflOn)) {
            const pairs = this.mixerProtocol.toMixer.MONITOR_CHANNEL_FADER_LEVEL[channelIndex];
            if (this.store.channels[0].channel[channelIndex].pflOn) {
                this.setAllLayers(pairs, this.store.channels[0].channel[channelIndex].faderLevel);
            } else {
                this.setAllLayers(pairs, this.store.channels[0].channel[channelIndex].outputLevel);
            }
        }
    }

    updateGrpOutLevel(channelIndex: number) {
        // CasparCG does not support Groups
    }

    updateGrpFadeIOLevel(channelIndex: number, outputLevel: number) {
        
    }

}

