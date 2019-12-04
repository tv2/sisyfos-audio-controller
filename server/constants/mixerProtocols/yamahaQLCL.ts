import { IMixerProtocol, emptyMixerMessage } from '../MixerProtocolInterface';

export const YamahaQLCL: IMixerProtocol = {
    protocol: 'QLCL',
    label: 'Yamaha QL/CL',
    mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
                    //client (use feedback from mixers fader level)
    leadingZeros: false,
    pingCommand: [emptyMixerMessage()],
    pingResponseCommand: [emptyMixerMessage()],
    pingTime: 0,
    initializeCommands: [emptyMixerMessage()],
    channelTypes: [{
        channelTypeName: 'CH',
        channelTypeColor: '#2f2f2f',
        fromMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],        //PgmChange 0 - ignores this command
            CHANNEL_OUT_GAIN: [{ mixerMessage: 'NOTIFY set MIXER:Current/InCh/Fader/Level', value: 0, type: '', min: -130, max: 10, zero: 1}],            //PgmChange 0 - ignores this command
            CHANNEL_VU: [{ mixerMessage: "0", value: 0, type: 'f', min: 0, max: 1, zero: 0.75}],                   //PgmChange 0 - ignores this command
            CHANNEL_NAME: [emptyMixerMessage()],
            PFL: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
        toMixer: {
            CHANNEL_FADER_LEVEL: [emptyMixerMessage()],
            CHANNEL_OUT_GAIN: [{ mixerMessage: "set MIXER:Current/InCh/Fader/Level", value: 0, type: '', min: 0, max: 1, zero: 0.75}],
            CHANNEL_NAME: [emptyMixerMessage()],
            PFL_ON: [emptyMixerMessage()],
            PFL_OFF: [emptyMixerMessage()],
            NEXT_SEND: [emptyMixerMessage()],
            THRESHOLD: [emptyMixerMessage()],
            RATIO: [emptyMixerMessage()],
            LOW: [emptyMixerMessage()],
            MID: [emptyMixerMessage()],
            HIGH: [emptyMixerMessage()],
            AUX_LEVEL: [emptyMixerMessage()],
            CHANNEL_MUTE_ON: [emptyMixerMessage()],
            CHANNEL_MUTE_OFF: [emptyMixerMessage()]
        },
    }],
    fader: {
        min: 0,
        max: 1,
        zero: 0.75,
        step: 0.01,
    },
    meter: {
        min: 0,
        max: 1,
        zero: 0.75,
        test: 0.6,
    },
}
