import { ICasparCGMixerGeometry } from '../MixerProtocolPresets';

export const SofieRK10Master: ICasparCGMixerGeometry = {
	protocol: 'CasparCG',
	label: 'Sofie RK10 CasparCG Mixer',
	mode: "master", //master (ignores mixers faderlevel, and use faderlevel as gain preset),
	//client (use feedback from mixers fader level)
	studio: "rk10",
	leadingZeros: false,
	pingTime: 0,
	fromMixer: {
		CHANNEL_FADER_LEVEL: "39",        //PgmChange 0 - ignores this command
		CHANNEL_OUT_GAIN: "0",            //PgmChange 0 - ignores this command
		CHANNEL_VU: "0",                   //PgmChange 0 - ignores this command
	},
	toMixer: {
		MONITOR_CHANNEL_FADER_LEVEL: [
			[ // Channel 1
				{
					channel: 2,
					layer: 51
				}
			],
			[ // Channel 2
				{
					channel: 2,
					layer: 52
				},
			],
			[ // Channel 3
				{
					channel: 2,
					layer: 53
				}
			],
			[ // Channel 4
				{
					channel: 2,
					layer: 54
				}
			]
		],
		PGM_CHANNEL_FADER_LEVEL: [
			[
				{
					channel: 1,
					layer: 51
				}
			],
			[
				{
					channel: 1,
					layer: 52
				}
			],
			[
				{
					channel: 1,
					layer: 53
				}
			],
			[
				{
					channel: 1,
					layer: 54
				}
			]
		]
	},
	fader: {
		min: 0,
		max: 1.5,
		zero: 1,
		step: 0.001,
		fadeTime: 40,
	},
	meter: {
		min: 0,
		max: 1.5,
		zero: 1,
		test: 1,
	},
}
