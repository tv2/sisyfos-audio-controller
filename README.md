# Producers Audio-Mixer

## Audiomixer control build with the logic from a videomixer.

You use the fader for the level, and PGM on/off for fade-in/out.
TAKE crossfades between PGM & PST:
<img src="Docs/pix/ProducersAudioMixer01.png">


### Snaps takes preset into PST:


<img src="Docs/pix/ProducersAudioMixer.png">



### Install:
```
git clone https://github.com/olzzon/producers-audio-mixer.git
cd producers-audio-mixer
yarn
yarn start
```

## Settings:
(Mixer presets are stored in MixerProtocolPresets.js)
### Following preset name are possible:
* reaper
  * OSC protocol for control Reaper (reaper.fm)
* midas
  * OSC protocol for Midas M32
  * Port should be 10023
  * Channel 1-16 should be routed to bus 1-16
  * Bus 1-16 is then used for Fadi In-Out
* behringerrx
  * OSC protocol for Behringer XR18
  * Port should be 10024
* midi
  * Generic MIDI - still preminilary
