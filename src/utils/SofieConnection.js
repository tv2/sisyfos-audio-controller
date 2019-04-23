import { CoreConnection, PeripheralDeviceAPI } from 'tv-automation-server-core-integration'

export class SofieConnection {
    constructor() {
        // Set up our basic credentials:
        this.core = new CoreConnection({
            deviceId: 'fademix01', 			// Unique id
            deviceToken: 'fademixtoken01',	// secret token, used to authenticate this device
            deviceType: PeripheralDeviceAPI.DeviceType.OTHER,
            deviceName: 'FadeMixerControl'
        });
        this.core.on('error', console.log);
        // Initiate connection to Core:
        this.core.init({
            host: '127.0.0.1',
            port: 3000
        }).then(() => {
            // Connection has been established
            console.log('Connected!');
            // Set device status:
            return this.core.setStatus({
                statusCode: PeripheralDeviceAPI.StatusCode.GOOD,
                messages: ['Producers Audio Mixer is connected']
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    listenCommands() {
        this.core.subscribe('getPeripheralDevice', {
            _id: this.core.deviceId
        })
        .then(() => {
            console.log('sub OK!');
        })


    }
}
