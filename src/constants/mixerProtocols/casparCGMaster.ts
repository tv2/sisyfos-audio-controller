import { ICasparCGMixerGeometry, ICasparCGMixerGeometryFile } from '../MixerProtocolPresets';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CONFIG_FILE_NAME = 'sisyfos-casparcg-geometry.json';
const geometryFile = path.join(os.homedir(), CONFIG_FILE_NAME);

let geometry: ICasparCGMixerGeometryFile = {
	MONITOR_CHANNEL_FADER_LEVEL: [],
	PGM_CHANNEL_FADER_LEVEL: []
}

try {
	let inputObj = JSON.parse(fs.readFileSync(geometryFile, {
		encoding: 'utf-8'
	}))
	if (inputObj.MONITOR_CHANNEL_FADER_LEVEL && inputObj.PGM_CHANNEL_FADER_LEVEL) {
		geometry = inputObj
	}
} catch (e) {
	console.error('Could not open CasparCG Audio geometry file', e)
}

export const CasparCGMaster: ICasparCGMixerGeometry = {
	protocol: 'CasparCG',
	label: geometry.label ? `CasparCG Audio Mixer (${geometry.label})` : 'CasparCG Audio Mixer',
	mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
	studio: "rk10",
	leadingZeros: false,
	pingTime: 0,
	fromMixer: {
		CHANNEL_FADER_LEVEL: "39",        //PgmChange 0 - ignores this command
		CHANNEL_OUT_GAIN: "0",            //PgmChange 0 - ignores this command
		CHANNEL_VU: "0",                  //PgmChange 0 - ignores this command
	},
	toMixer: geometry,
	fader: {
		min: 0,
		max: 1.5,
		zero: 1,
		step: 0.001,
		fadeTime: 40,
	},
	meter: {
		min: 0,
		max: 1,
		zero: 0.75,
		test: 0.6,
	}
}
