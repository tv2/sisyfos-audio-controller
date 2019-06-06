import { ICasparCGMixerGeometry, ICasparCGMixerGeometryFile } from '../MixerProtocolPresets';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CONFIG_FILE_NAME = 'sisyfos-casparcg-geometry.json';
const geometryFile = path.join(os.homedir(), CONFIG_FILE_NAME);

let geometry: ICasparCGMixerGeometryFile | undefined = undefined

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

let CasparCGMasterObject: ICasparCGMixerGeometry | undefined = undefined

if (geometry) {
	CasparCGMasterObject = {
		protocol: 'CasparCG',
		label: `CasparCG Audio Mixer (${geometry.label})`,
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
		},
		channelLabels: geometry.channelLabels
	}
}

export const CasparCGMaster = CasparCGMasterObject
