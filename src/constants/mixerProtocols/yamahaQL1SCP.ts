import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const YamahaQL1SCP: IMixerProtocol = {
    protocol: 'SCP',
    label: 'Yamaha QL1 SCP',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,
    pingCommand: [emptyMixerMessage()],
    pingTime: 0,
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],        //PgmChange 0 - ignores this command
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'NOTIFY set MIXER:Current/InCh/Fader/Level', value: 0, type: '', min: -130, max: 10, zero: 1}],            //PgmChange 0 - ignores this command
            CHANNEL_VU: [{ mixerMessage: "0", value: 0, type: 'f', min: 0, max: 127, zero: 100}],                   //PgmChange 0 - ignores this command
            CHANNEL_NAME: [emptyMixerMessage()],
            PFL: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{ mixerMessage: "set MIXER:Current/InCh/Fader/Level", value: 0, type: '', min: -130, max: 10, zero: 1}],
            CHANNEL_NAME: [emptyMixerMessage()],
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            AUX_SEND: [emptyMixerMessage()],
        },
    }],
    fader: {
        min: -130,
        max: 10,
        zero: 100,
        step: 1,
    },
    meter: {
        min: -130,
        max: 10,
        zero: 100,
        test: 80,
    },
}
