import { ICasparCGMixerGeometry, ICasparCGMixerGeometryFile, emptyMixerMessage } from '../MixerProtocolInterface';
const fs = require('fs')
import * as os from 'os';
import * as path from 'path';

const CONFIG_FILE_NAME = 'sisyfos-casparcg-geometry.json';
const geometryFile = path.join(os.homedir(), CONFIG_FILE_NAME);

let geometry: ICasparCGMixerGeometryFile | undefined = undefined

try {
	let inputObj = JSON.parse(fs.readFileSync(geometryFile, {
		encoding: 'utf-8'
	}))
	if (inputObj.toMixer && inputObj.toMixer.PGM_CHANNEL_FADER_LEVEL) {
		geometry = inputObj
	}
} catch (e) {
	console.log('CasparCG Audio geometry file has not been created')
}

let CasparCGMasterObject: ICasparCGMixerGeometry | undefined = undefined

if (geometry) {
	CasparCGMasterObject = {
		protocol: 'CasparCG',
		label: `CasparCG Audio Mixer (${geometry.label})`,
		mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
		studio: "rk10",
		leadingZeros: false,
		pingTime: 0,
		fromMixer: geometry.fromMixer,
		toMixer: geometry.toMixer,
		fader: {
			min: 0,
			max: 1.5,
			zero: 1,
			step: 0.001,
		},
		meter: {
			min: 0,
			max: 1,
			zero: 0.75,
			test: 0.6,
		},
		channelLabels: geometry.channelLabels,
        sourceOptions: geometry.sourceOptions,
        //CHANNELTYES ARE NOT IMPLEMENTED.
        //THIS IS JUST TO AVOID ERRORS AS
        //channelTypes are moved to IMixerProtocolGeneric
        channelTypes: [{
            channelTypeName: 'CH',
            channelTypeColor: '#2f2f2f',
            fromMixer: {
                CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
                CHANNEL_OUT_GAIN: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
                CHANNEL_VU: [emptyMixerMessage()],
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
                CHANNEL_FADER_LEVEL: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
                CHANNEL_OUT_GAIN: [{ mixerMessage: 'none', value: 0, type: 'f', min: 0, max: 1.5, zero: 1}],
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
        }]
	}
}

export const CasparCGMaster = CasparCGMasterObject
