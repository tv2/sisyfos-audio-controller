# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.8.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.7.1...v2.8.0) (2020-02-11)


### Features

* implement Sofie iFrame support ([a96215a](https://github.com/olzzon/sisyfos-audio-controller/commit/a96215a9675de754296f07d3b0bb06378e2fc6e3))
* Sisyfos inside iFrame. Use window.top !== window.self to chech if it´s running inside something ([76ceca9](https://github.com/olzzon/sisyfos-audio-controller/commit/76ceca9a193ae2025b649bef83a669879eac952e))
* Sisyfos running in iFrame. Use frameElement instead of checking parent. ([bcc3633](https://github.com/olzzon/sisyfos-audio-controller/commit/bcc3633e016b6b9ea7afaaf702500b92ae4b0ea6))

### [2.7.1](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.7.0...v2.7.1) (2020-02-07)

## [2.7.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.6.0...v2.7.0) (2020-02-05)


### Features

* Channelstrip Delay Time generic implementation ([0a5a88c](https://github.com/olzzon/sisyfos-audio-controller/commit/0a5a88ccc3dd3ebbb413d364b084153d7b4cdaf8))
* chanStrip delaybuttons to fineadjust delay value ([7ee1418](https://github.com/olzzon/sisyfos-audio-controller/commit/7ee1418aa5782999daee8f8dcf95880d436a7de7))
* chanStrip slide in-out fdrom left ([983cefb](https://github.com/olzzon/sisyfos-audio-controller/commit/983cefb1fd2f3a0906c2d7ab737864ec9900e057))
* disable label transfer to Midas so Sofie can set userlabels in Sisyfos without interfering with the mixer labels ([0e139eb](https://github.com/olzzon/sisyfos-audio-controller/commit/0e139ebba17c651f5ef7bccd6b7d8e7b84dfc347))
* Midas receive delayTime state ([de94606](https://github.com/olzzon/sisyfos-audio-controller/commit/de94606eb90d26b74da8160b5a9a3bb2fc5a3a1d))
* Midas/X32 MUTE button support ([e922d5f](https://github.com/olzzon/sisyfos-audio-controller/commit/e922d5f36c385f81536091649a28ed5f4fab5633))
* offtube mode, make channelstrip area persistent. ([aebb505](https://github.com/olzzon/sisyfos-audio-controller/commit/aebb505457d7ad58bf510157fd8230b4b341077f))
* wider chanstrip for support of more aux sends ([f6872db](https://github.com/olzzon/sisyfos-audio-controller/commit/f6872dbcd5eeb5196a41f311fdb7b54b7cfee4b7))


### Bug Fixes

* chan strip - GUI compressor - delay header was 3 lines ([de6a733](https://github.com/olzzon/sisyfos-audio-controller/commit/de6a73317ef9eec8c140f3a61f09b34dd7dcc105))
* loading storage with more channels than faders. (e.g. a fader controlling a 5.1 setup) ([93e10ec](https://github.com/olzzon/sisyfos-audio-controller/commit/93e10ec36cc98f3592b6fb10674ab2e8ee64544d))
* Midas Delay param is between 0 and 1 not ms time ([e535722](https://github.com/olzzon/sisyfos-audio-controller/commit/e53572212d2e80de350e87c375d74fa2b9b61c70))
* midas protocol missing DELAY_TIME ([12ac11c](https://github.com/olzzon/sisyfos-audio-controller/commit/12ac11c916096b7e7df3726f3319c04642aab018))
* Type - Midas - fromMixer didn´t have the correct params ([87540f3](https://github.com/olzzon/sisyfos-audio-controller/commit/87540f3515305ad5c2f84349aa8f2df17cecbe2c))

## [2.6.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.5.0...v2.6.0) (2020-01-30)


### Features

* QL1 receive fader state working ([d434dd3](https://github.com/olzzon/sisyfos-audio-controller/commit/d434dd32ed89a05ef351f5ac5a2ae0ed7bcf5f8c))
* QlCl - added mute support FROM Sisyfos ([8793170](https://github.com/olzzon/sisyfos-audio-controller/commit/8793170bba09cec80376531d5b13525fe7f39383))
* yamaha QL - gain out command moved to protocol instead of hardwired in qlclconnection.ts ([e96f902](https://github.com/olzzon/sisyfos-audio-controller/commit/e96f9026dafb14df48caa2ce1deb8d825d23d14a))
* Yamaha QL - use Winston logging instead of console.log ([d856e26](https://github.com/olzzon/sisyfos-audio-controller/commit/d856e26432e5ca9289e7fab448ef0d0cb3be9499))
* yamaha QL1 - get MUTE state (on-off) from mixer ([ce021e9](https://github.com/olzzon/sisyfos-audio-controller/commit/ce021e9e3b5dce95e1eaba6ab2a50fb071705932))
* yamaha qlcl - inital req of fader levels. - split buffers - 2 byte channel message ([f462841](https://github.com/olzzon/sisyfos-audio-controller/commit/f4628411784c9fb47d3c7349db8d43afe436c65a))

## [2.5.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.4.0...v2.5.0) (2020-01-29)


### Features

* CasparCGconnection.ts winston logger support ([4e0a7f0](https://github.com/olzzon/sisyfos-audio-controller/commit/4e0a7f055c3645eead11e567e28cc1c1e30f0858))
* CCG channelsettings emit action for selecting new channel inputs. ([6f807cd](https://github.com/olzzon/sisyfos-audio-controller/commit/6f807cdda018513fd20418e55e587a4e844140e1))
* CCG v2 show- PFL in settings replaces CUE NEXT ([9a24def](https://github.com/olzzon/sisyfos-audio-controller/commit/9a24defa5060853656ac46e54d992945bd32d9d8))
* ccg-v2 - move config files to storage folder. ([53bd70e](https://github.com/olzzon/sisyfos-audio-controller/commit/53bd70e06d76d292cf84c94ff78165cbad25e055))
* check geometry file for undefined ([b15fbb1](https://github.com/olzzon/sisyfos-audio-controller/commit/b15fbb15f2e02cea8a9ff5896b56ea43db16e151))
* disable settings in browser by adding localhost:1176/?settings=0 ([f2dc03f](https://github.com/olzzon/sisyfos-audio-controller/commit/f2dc03f77ece5d2522ce54a4f7bb0370153fff8b))
* load CasparCG settings from Storage menu ([c4e55e6](https://github.com/olzzon/sisyfos-audio-controller/commit/c4e55e6744d33a927b57f2c0e197f2dbe9c7f858))
* move CasparCG input settings into channelstrip on left side ([7d20317](https://github.com/olzzon/sisyfos-audio-controller/commit/7d20317614a5bb508e29ebf8cd5ab8287f32803b))
* only show Load CasparCG in Storage menu if there are any .ccg files ([6cda7c0](https://github.com/olzzon/sisyfos-audio-controller/commit/6cda7c0c8c51dda597542c586f6860e0daa92bf7))
* Preparing CCG - /inject command so it´s possible pass a command directly from Sofie to Audiomixer. ([cb53eb5](https://github.com/olzzon/sisyfos-audio-controller/commit/cb53eb57ac2a322779b3bdecd95be040ea8e1b1e))
* remove close button in CCG input settings window ([d61dab7](https://github.com/olzzon/sisyfos-audio-controller/commit/d61dab73f52a522e6edd60106f8f714c0db2d50b))
* remove filehandling from mixerprotocol, include default example ([7918b05](https://github.com/olzzon/sisyfos-audio-controller/commit/7918b0573dd500c858f5e598fb50e373976f4d8e))
* rename Storage menu to "STORAGE" ([ee917a2](https://github.com/olzzon/sisyfos-audio-controller/commit/ee917a2f9e50a62dba862aa00b609a480df95d7e))
* set new CasparCG config from Storage Menu is working. ([7eab0b9](https://github.com/olzzon/sisyfos-audio-controller/commit/7eab0b90cc218636a41ffa2c7598661076cebc48))
* set seperate loglevel for console with loggerConsoleLevel='verbose' updated in Readme.md ([beba900](https://github.com/olzzon/sisyfos-audio-controller/commit/beba90053efcf5c6efe8144ba07f1e7e1e66c17c))


### Bug Fixes

* GUI crash for reference to fader label, on fader thats not defined. ([9bc4df7](https://github.com/olzzon/sisyfos-audio-controller/commit/9bc4df7f6f4c2753cb0c3933245a1aec9025ba21))
* zero indicator on faders was off after new design ([78f48b5](https://github.com/olzzon/sisyfos-audio-controller/commit/78f48b5942a47a4393e490d6fadd0fa1fb558471))

## [2.4.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.3.3...v2.4.0) (2020-01-23)


### Features

* added Low-mid to get 4-band eq instead of 3-band eq ([59542a8](https://github.com/olzzon/sisyfos-audio-controller/commit/59542a83c1ca889696efe29fb4bc0d958567e77b))
* chan strip zero indicators on eq, comp and monitor mix ([b9ec40e](https://github.com/olzzon/sisyfos-audio-controller/commit/b9ec40e16a2d6ff4c23fd457ff5a6ec4a9f73b87))
* channel name in header of monitor mix minus ([99c0207](https://github.com/olzzon/sisyfos-audio-controller/commit/99c020743b641209423b924f042c6619c170321e))
* get eq & comp state from Midas/Behringer X32 - both inital and realtime ([86bd216](https://github.com/olzzon/sisyfos-audio-controller/commit/86bd216d3e2cf4c15e241cdee6445e191f872d7a))
* individual runtime args for setting log level of kibana and of local log file. ([e978093](https://github.com/olzzon/sisyfos-audio-controller/commit/e978093cae71699393493426b28d5aac450741ae))
* Midas/Behringer OSC get inital Aux state from mixer ([7bb0741](https://github.com/olzzon/sisyfos-audio-controller/commit/7bb0741c2833274081d6f110d2b56876bcf5c33b))
* move ch strip to left side ([89756b9](https://github.com/olzzon/sisyfos-audio-controller/commit/89756b9f39d9ec6715a8eac284690d977fa9e31a))


### Bug Fixes

* Ardour ping mixewr command didn´t have osc data type ([b84e965](https://github.com/olzzon/sisyfos-audio-controller/commit/b84e965abf679d512eb7333543555485ec84123c))
* channel-body css didn´t set heigth ([653def0](https://github.com/olzzon/sisyfos-audio-controller/commit/653def0d90f25210a61830aa0ef5f7b517bf0b2f))
* delay initial state commands to avoid overload of OSC commands to Midas ([443325f](https://github.com/olzzon/sisyfos-audio-controller/commit/443325fc2179b6053271c92548ad64270b61f044))
* Recived Midas Ratio has value from 0 to 11 and not 0 to 1 ([40afcc5](https://github.com/olzzon/sisyfos-audio-controller/commit/40afcc55d826c0f731f4c64e1f5698b167f0b4aa))
* typo - dispatch obj with level: instead of label: ([e84abaa](https://github.com/olzzon/sisyfos-audio-controller/commit/e84abaa71671e8d77f0b47a7d6a459fa682717ab))
* typo - don´t revert dispatch label from level: to label: ([974bec2](https://github.com/olzzon/sisyfos-audio-controller/commit/974bec262d84179a2c3893f979e2ebcdb9f1b715))
* use .loMid value when updating loMid ([9c61686](https://github.com/olzzon/sisyfos-audio-controller/commit/9c61686a00385076a5764ff20249db50007e3a6d))

### [2.3.3](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.3.2...v2.3.3) (2020-01-15)


### Bug Fixes

* rename Label Monitor Mix to: "{FaderName} Monitor Mix Minus" ([d99a67b](https://github.com/olzzon/sisyfos-audio-controller/commit/d99a67b8499f3d21c14047a5ff612b684287ad0e))
* update Auxlevel on mixer on changes ([08b832e](https://github.com/olzzon/sisyfos-audio-controller/commit/08b832eba9ac81c1a74e2de9b354103d05247b52))

### [2.3.2](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.3.1...v2.3.2) (2020-01-04)

### [2.3.1](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.3.0...v2.3.1) (2020-01-01)


### Bug Fixes

* CI build errors ([d98475f](https://github.com/olzzon/sisyfos-audio-controller/commit/d98475f6b07381504c626f24394b4dbdacffd668))
* create storage folder if not exists when trying to store settings for the first time ([41dcb09](https://github.com/olzzon/sisyfos-audio-controller/commit/41dcb09236e3768daa19fe64ce70499e769a0e1e))
* do not use winston logger in contants files as they´re also used on client side ([fb2d847](https://github.com/olzzon/sisyfos-audio-controller/commit/fb2d84756d7330dfdf799f1269793d012ed0a195))
* remove settings and default.shot from storage folder ([1c63eb2](https://github.com/olzzon/sisyfos-audio-controller/commit/1c63eb21933ce7414a405393b4c0564c80aace6f))
* remove settings.json from server folder ([3229936](https://github.com/olzzon/sisyfos-audio-controller/commit/3229936a48c39765103204235a40935d92cb07e1))

## [2.3.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.2.0...v2.3.0) (2019-12-21)


### Features

* Ignore Automation implemented. A "MANUAL" button added in GUI so a fader can ignore commands from Automation ([1399711](https://github.com/olzzon/sisyfos-audio-controller/commit/1399711d9b1558702c5c305dc45b09fe82b2ea48))


### Bug Fixes

* assign aux to fader use auxIndex instead of channel ([a9e3232](https://github.com/olzzon/sisyfos-audio-controller/commit/a9e3232b6a3fdeed9a3729aa7b09a1628931010d))
* avoid clearing meters when setting full state of faders ([cce69f5](https://github.com/olzzon/sisyfos-audio-controller/commit/cce69f5c6da2b8b946f76f49b1f60ec9dbe0a501))
* double code in AutomationConnection (had double check for X_MIX, Fade_to_black and visible) ([ff8af54](https://github.com/olzzon/sisyfos-audio-controller/commit/ff8af54c81bc4cff3ad8a8c04364e2d76a01ce52))
* OscMixerConnection - compare whole command length ([876b367](https://github.com/olzzon/sisyfos-audio-controller/commit/876b3679ae772d6f3ebc2ddff608220c48beeeee))
* Update GUI when state of muteOn and voOn is changed ([52bf3da](https://github.com/olzzon/sisyfos-audio-controller/commit/52bf3da1aa2ad2aa63ec2b03cc7fc6a4a0c97642))

## [2.2.0](https://github.com/olzzon/sisyfos-audio-controller/compare/v2.1.0...v2.2.0) (2019-12-18)


### Features

* mixer online - will restart server. ([fea6b24](https://github.com/olzzon/sisyfos-audio-controller/commit/fea6b24f897ee4a9e0e101fc45b5d1b92ed4227d))


### Bug Fixes

* move storage to "storage" folder, to avoid docker conflicts ([7323ed9](https://github.com/olzzon/sisyfos-audio-controller/commit/7323ed9675b57dbff528a54dad93271099bda14d))

## 2.1.0 (2019-12-18)


### Features

* add channel settings UI ([8351cb0](https://github.com/olzzon/sisyfos-audio-controller/commit/8351cb05ffebf6aa2aa491023e3a5d2bd9b11287))
* added protocol latency in settings. So setting "fadeActive" to false waits until last response from protocol. ([6d949ed](https://github.com/olzzon/sisyfos-audio-controller/commit/6d949edb988f741d63e91c0a34241c3eb8ab4cee))
* Ardour adding meter support ([1864e3e](https://github.com/olzzon/sisyfos-audio-controller/commit/1864e3e88da2cfaa4db2d0c8e7332baef05591be))
* Ardour meter support meter not meters ([9802ff5](https://github.com/olzzon/sisyfos-audio-controller/commit/9802ff5314b872fe6e5539ecdd78fe6fc9096128))
* Ardour support - added channel name from mixer ([d767318](https://github.com/olzzon/sisyfos-audio-controller/commit/d76731868de78220070f70348cffc065083856dc))
* Ardour support meter calimbration (loosely set) ([eb01418](https://github.com/olzzon/sisyfos-audio-controller/commit/eb014183fdf8bc3ab3bd66bf390fbf4959e66dcc))
* CasparCG support as audio mixer ([#35](https://github.com/olzzon/sisyfos-audio-controller/issues/35)) ([d47cf5b](https://github.com/olzzon/sisyfos-audio-controller/commit/d47cf5bb018d6f7cab8b6d6b806a84d1c60511a5))
* change VU meter rendering to canvas-based ([ee829d7](https://github.com/olzzon/sisyfos-audio-controller/commit/ee829d7960a0849826c2e90b459fcd760836b5a0))
* Channel labels - protocol now support setting labels on mixer ([751b812](https://github.com/olzzon/sisyfos-audio-controller/commit/751b812d407d622b4fbd4d38f07ad167e3e2daac))
* ChannelType added to IChannel in channelsReducer so each channel can reference to a channel type ([995b99e](https://github.com/olzzon/sisyfos-audio-controller/commit/995b99e26da34a20a5bf1663a504f14554cc2e51))
* ChannelTypes  - Channel color and label injected from mixerprotocol ([9552320](https://github.com/olzzon/sisyfos-audio-controller/commit/9552320e068008184cfb029fa8f5e226ebfa7ed3))
* channelTypes - Ember+ level and gain implemented ([5f2752f](https://github.com/olzzon/sisyfos-audio-controller/commit/5f2752fe0f7aa0eda7ce7f98fe32a32f0bc63dc4))
* ChannelTypes - mixerProtocol actions is changed from  string to Array<string> ([5448e7a](https://github.com/olzzon/sisyfos-audio-controller/commit/5448e7ab273c0ad5f5b11e5f6326c77058e3fb7d))
* ChannelTypes - preparing settings for numberOfChannelTypes ([ef1a9ba](https://github.com/olzzon/sisyfos-audio-controller/commit/ef1a9baa9f6e98255ab95fec560b70b0dd1c230d))
* channeltypes- OscMixerConnection send level to the different channelTypes ([fd6d9ef](https://github.com/olzzon/sisyfos-audio-controller/commit/fd6d9ef7f62e40aa9bdd383dad56d4efe3479c41))
* ChannelTypes: Changed numberOfChannels to numberOfChannelsInType (current ussage is [0]) ([114538d](https://github.com/olzzon/sisyfos-audio-controller/commit/114538d4800b47150e86078dbf8d2e74767d6850))
* DMXIS - set label from Automation to DMXIS ([ac4038f](https://github.com/olzzon/sisyfos-audio-controller/commit/ac4038f8c831f59eb2fd58f3a730b5d9ccdb8fef))
* Ember - trying to figure out invokeFunction ([0210ed1](https://github.com/olzzon/sisyfos-audio-controller/commit/0210ed1052c988418e0ce6eeeb35caf6b19c96d6))
* Ember - trying to figure out setValue (right now it only resets the value) ([1e27c53](https://github.com/olzzon/sisyfos-audio-controller/commit/1e27c53b2a3f637230079d9156c632791226cee6))
* Ember Protocol - Subscribe label changes ([5b83282](https://github.com/olzzon/sisyfos-audio-controller/commit/5b83282f9d4ae7a30e68f5474ce52d1fedf3bde3))
* Ember Studer support - Added Vista 1 - Vista 5 - Vista 9 ([d602daa](https://github.com/olzzon/sisyfos-audio-controller/commit/d602daac47c9ff01f656de47cff8986fa1cdc1d2))
* fader -> channel routing. implementing faders reducer in channel component ([85a1705](https://github.com/olzzon/sisyfos-audio-controller/commit/85a1705bb6f0179ca49120305c06c194edfd8b33))
* Fader-Channel routing - initial datastructure for abstration of fader - channel ([93af7b1](https://github.com/olzzon/sisyfos-audio-controller/commit/93af7b14404b4d4ee812c4572f7bb89d16969d97))
* Hui Remote - change of fader from Sisyfos to HUI working. ([c6f07a9](https://github.com/olzzon/sisyfos-audio-controller/commit/c6f07a92425f93cd3347e8f242309c5e820d4210))
* Hui remote - Remote solo button toggles Sisyfos PFL on/off ([2587ff8](https://github.com/olzzon/sisyfos-audio-controller/commit/2587ff80263e4e842142b790171c61c5638e5d91))
* hui remote - Select button togles sisyfos PGM on/off ([3ad29b5](https://github.com/olzzon/sisyfos-audio-controller/commit/3ad29b59024a7bf243d50f22837578663e817712))
* HUI remote - Status of SELECT and SOLO button led updates when button is pressed ([bd40f81](https://github.com/olzzon/sisyfos-audio-controller/commit/bd40f812a0c7ba41b78a98e8e5f965bfac99018a))
* hui remote - update hui if mixer faders are changed by mixer ([8bb116a](https://github.com/olzzon/sisyfos-audio-controller/commit/8bb116a9a28d0e080e8b7fb1869066f571b9c1e8))
* HUI-remote - Button led reflects Sisyfos state ([df620b9](https://github.com/olzzon/sisyfos-audio-controller/commit/df620b93e36f136a6332f2efb7c7b80238d2a853))
* implement aux configuration in Storage load/save ([7e01f2a](https://github.com/olzzon/sisyfos-audio-controller/commit/7e01f2a153a1d2e7e76db9c00f3c067718a62928))
* Implemented "zero" indicator on Faders ([6ee7029](https://github.com/olzzon/sisyfos-audio-controller/commit/6ee702921f55484f021dcd7330b6caff46f70b10))
* Initial support for Ardour ([4512985](https://github.com/olzzon/sisyfos-audio-controller/commit/4512985b01af5b8be70fc5a344e668a2ed0b83dd))
* Lawo R3LAYVRX4 - NOT WORKING YET ([ffccf79](https://github.com/olzzon/sisyfos-audio-controller/commit/ffccf792c37d3d0604205787c3898e2f08abd0ce))
* Let an automation system ping sisyfos, to verify connectivity status. ([b3a1a46](https://github.com/olzzon/sisyfos-audio-controller/commit/b3a1a4665076958aacc6004c2d35b648d66a1784))
* Midi Mixer Protocol - settings select Midi input and output port, when a MIDI mixer protocol is selected ([3dd2567](https://github.com/olzzon/sisyfos-audio-controller/commit/3dd2567660e2254bb6ad9a7dddd9dcdc1dd2c194))
* MidiMixerConnection - using type from protocol ([96576f4](https://github.com/olzzon/sisyfos-audio-controller/commit/96576f4a18dfb1c054e48778be1a06d87839659d))
* MixerProtocol prepared ChannelType based structure. ([bd05bb5](https://github.com/olzzon/sisyfos-audio-controller/commit/bd05bb5492e10e834a3e2e6560dbae2e6a735fe4))
* New ChannelType - channelType and channelIndexType implemented in  channelReducer and snapShot state ([4082795](https://github.com/olzzon/sisyfos-audio-controller/commit/4082795b834ab71cd0fac940e0b4e5b495840531))
* new ChannelTypes - settings number of each channeltypes ([b733529](https://github.com/olzzon/sisyfos-audio-controller/commit/b73352959b48bcaed5337b68f2b8fa88261d22e7))
* Protocol for DMXIS lightcontrol ([0c9cb1f](https://github.com/olzzon/sisyfos-audio-controller/commit/0c9cb1f41ec029535c501a82e5cb3d967852482e))
* Reaper Master Protocol DCA support ([f301dcd](https://github.com/olzzon/sisyfos-audio-controller/commit/f301dcd05828b82b4f805744dde13f9c1e72a4ad))
* remote midi connetion - prefare PFL ([ffbde02](https://github.com/olzzon/sisyfos-audio-controller/commit/ffbde02ca822cbca644fc4096333a7a5ed8b8ab3))
* Remote midi controÃller - update mixer when recieving level change from remote ([ccf95b3](https://github.com/olzzon/sisyfos-audio-controller/commit/ccf95b3b490988e6eff8f600286ac92b85f08ab4))
* Remote Midi Control - working on datastructure ([b15542f](https://github.com/olzzon/sisyfos-audio-controller/commit/b15542f7ae08b1422fd22576acc8ba78958a2127))
* Remote midi controller - change generic midi remote contrioller to a dedicated HUI controller ([73e4372](https://github.com/olzzon/sisyfos-audio-controller/commit/73e4372a1bdb0de9204aee41edd0c053df3f61ec))
* Remote Midi Controller - connect to selected midiports from settings ([1eb4500](https://github.com/olzzon/sisyfos-audio-controller/commit/1eb45001f43579060341120bee29740da48c5423))
* Remote midi controller - Convert Midi controller levels to audio mixer levels ([ddde5fc](https://github.com/olzzon/sisyfos-audio-controller/commit/ddde5fcd109583caa7b255a8fd6cabd600295945))
* Remote Midi controller Adding support for play, stop, pitch bend types in remote protocol. instead of just ctrl-change ([f043c97](https://github.com/olzzon/sisyfos-audio-controller/commit/f043c974a1d4cfc6387d926cfbf7a5b4fe847eac))
* Remote MidiControl - Added Faderlevel ([20a9548](https://github.com/olzzon/sisyfos-audio-controller/commit/20a954834eb05c6f1f401500cae7af805f095f10))
* Remote MidiController - mixerConnection to be used for updating mixer status ([8f404a5](https://github.com/olzzon/sisyfos-audio-controller/commit/8f404a50f6821d41faeead94e5774ab3bab9d3fa))
* Remote MidiController - preparing value conversion from mixer min-max to remote min-max ([e4764b9](https://github.com/olzzon/sisyfos-audio-controller/commit/e4764b97a252d5990849a1dc2f6b7b1a13028cb0))
* Remote midicontroller - Recieve messages working ([d60ad72](https://github.com/olzzon/sisyfos-audio-controller/commit/d60ad72cc2d71354ad1712afbc9a82309d53477c))
* Remote Midicontroller - Settings added pull down menus for selecting midiports in and out for controller ([6e754cd](https://github.com/olzzon/sisyfos-audio-controller/commit/6e754cd93332413873f43593f739594bfb54789a))
* remote-hui fader from hui to sisyfos working ([97e6faa](https://github.com/olzzon/sisyfos-audio-controller/commit/97e6faa18d001c588cb7b35f899a3affb2f90794))
* RemoteFader support - preparing support ([5ed8364](https://github.com/olzzon/sisyfos-audio-controller/commit/5ed83643e250f544cbf8c5323a746d0516ea6b31))
* Set channel label on mixer from Sisyfos and from Automation ([35fbc34](https://github.com/olzzon/sisyfos-audio-controller/commit/35fbc3485c521d92796bcfe5016b7c3081ad0eae))
* Studer Vista - initial support ([ea054e3](https://github.com/olzzon/sisyfos-audio-controller/commit/ea054e3c05225b50deb5cb841082de7b168e83ff))
* Studer Vista Label support ([fbaf105](https://github.com/olzzon/sisyfos-audio-controller/commit/fbaf10514a9ac2f7d72293a83f7ad578566c54cf))
* support restarting source producer to change source properties ([ad9c560](https://github.com/olzzon/sisyfos-audio-controller/commit/ad9c560eb3fe848c5031caa079a8914ef2ca23a9))
* Yamaha QL1 midi support - basic funtionality working ([e7460e2](https://github.com/olzzon/sisyfos-audio-controller/commit/e7460e274a921d67ba0c449b53b931aa8873f2dc))
* Yamaha QL1 support - created protocol (not functioning yet) ([497db09](https://github.com/olzzon/sisyfos-audio-controller/commit/497db09ed654cb661ade12899a25887305ba22a6))
* **casparcg:** support VU meters on CCG mixer ([f6a5c4d](https://github.com/olzzon/sisyfos-audio-controller/commit/f6a5c4d59a92d5604715a343dc73cdfbb5228a53))


### Bug Fixes

* /state/full should include showFader status ([c0be854](https://github.com/olzzon/sisyfos-audio-controller/commit/c0be854eafbdb6529f895fa214a8aba339d70e75))
* as new react-slider module has a z-index of 1, settings pages are changed to a z-index of 2 ([af5a46c](https://github.com/olzzon/sisyfos-audio-controller/commit/af5a46c5c83a03b9ece3d11880b9a50e8fe9a5aa))
* Automation PST command must update NextAux ([f635362](https://github.com/olzzon/sisyfos-audio-controller/commit/f63536225983f1f8c88550c9c7cb637aebf66e23))
* Automationprotocol - return address data structure is to.address not to.ip ([75ceb9a](https://github.com/olzzon/sisyfos-audio-controller/commit/75ceb9aacdeda699d72108b7a9109ee5b5a24371))
* CasparCG protocol min and zero values are used in channelTypes, so they are adjusted accoringly ([be6a5eb](https://github.com/olzzon/sisyfos-audio-controller/commit/be6a5eb814dad27f130ee9caf1d80378e0f669b5))
* channel - fader abstractions was not correct ([5145b43](https://github.com/olzzon/sisyfos-audio-controller/commit/5145b43d69bd16ad86ab78977d21b0d1ad97b457))
* Channel had faderChannel as reference instead of ch ([ea877dd](https://github.com/olzzon/sisyfos-audio-controller/commit/ea877dd495bf8c1f9e7b9b0fb9fd5db04fcb146b))
* checkOscCommand - returned always true ([d502820](https://github.com/olzzon/sisyfos-audio-controller/commit/d50282082340bd53ca82386f8115c8f97038a332))
* ClassNames in Sttings was there by accident ([c6d29b6](https://github.com/olzzon/sisyfos-audio-controller/commit/c6d29b6c01a77cded8507b232ab78c29842c51f4))
* Clear protocolDelay timer when aborting old fade ([7801638](https://github.com/olzzon/sisyfos-audio-controller/commit/78016382f7430d723c59128f17dde6257e4562cb))
* Colors for active faders was missing after converting to react-slider based faders ([15e34f3](https://github.com/olzzon/sisyfos-audio-controller/commit/15e34f3202e6356b5489261f96747a9363b6105a))
* don´t send faderLeel to mixer, as itÂ reference to multiple channels now. ([a2a1240](https://github.com/olzzon/sisyfos-audio-controller/commit/a2a124037099c83a1b88acf0afff8d6aa8b09a48))
* Electron nodeIntegration: false - added preload.js - prepare for moving hw related stuff to server side ([2ec903d](https://github.com/olzzon/sisyfos-audio-controller/commit/2ec903d56c133c963a412b8683b1641fd8d99eae))
* Fade I/O - use channelType min and zero for setting target gain ([6a935c6](https://github.com/olzzon/sisyfos-audio-controller/commit/6a935c6e58344bbe0c473bcb451d1bf7bcf32a65))
* fadeToBlack - only send commands for channels that are open ([48ed2ae](https://github.com/olzzon/sisyfos-audio-controller/commit/48ed2aef0792fe506fad401ccc8b8f531df4aa88))
* ipaddress of return message is not to.id but to.address ([b5f3871](https://github.com/olzzon/sisyfos-audio-controller/commit/b5f387167cfb7ea8c61b34b7575ca77d8e4b1f04))
* Meter align with "zero" ([48f662a](https://github.com/olzzon/sisyfos-audio-controller/commit/48f662a80f7f474c5f27ae82c2e595d356985ae0))
* Midi - addListener should have channel number and not controlchange number ([aec6ea8](https://github.com/olzzon/sisyfos-audio-controller/commit/aec6ea8b8f030cd2310449e982c23ac1302f4668))
* Midi HUI remote controller, update new structure fader instead of channel ([c4c9c3b](https://github.com/olzzon/sisyfos-audio-controller/commit/c4c9c3be98915d7a6c2f05afa8e8cfb472445cd5))
* Midi protocol - update faders when multiple faders are changed ([a8c6da8](https://github.com/olzzon/sisyfos-audio-controller/commit/a8c6da8b121f405ca76633f8facf68f77da7e886))
* More fader steps in Yamaha QlCl protocol (before it only had 10 steps from 0 to 1) ([a9d81a8](https://github.com/olzzon/sisyfos-audio-controller/commit/a9d81a8ac1ce7b9d20d674bd4da1786236fb9bca))
* new channelType - emberMixerConnection, subscription used ch instead og channelTypeIndex ([0d630bb](https://github.com/olzzon/sisyfos-audio-controller/commit/0d630bb9bd70b5ef2a27f1a8e1d58469fc1d8a1e))
* new forked osc.js dependcy, to allow use without rebuilding ([bf8797b](https://github.com/olzzon/sisyfos-audio-controller/commit/bf8797bafdfa6193154b290eb4aeaf17e25cd9fb))
* numberOfChannels pr. type instead of totalNumberOfChannels ([139b4c1](https://github.com/olzzon/sisyfos-audio-controller/commit/139b4c1a296cea71b3e0565b6c9c80af661f5f2a))
* only channels of first channelttype was set after reload ([f50296e](https://github.com/olzzon/sisyfos-audio-controller/commit/f50296e57773a8020d63699ee0fad24f8aa27ef8))
* OSC command had wrong fader Index ([bef73e4](https://github.com/olzzon/sisyfos-audio-controller/commit/bef73e4af204b3cfa86919e13a0300e4bf8766be))
* OSC protocol - All faders follows when changed on mixer ([b5d9515](https://github.com/olzzon/sisyfos-audio-controller/commit/b5d9515601d55bc963f672360fda6381704a6642))
* Package.json --asar does not take any arguments ([dcfa901](https://github.com/olzzon/sisyfos-audio-controller/commit/dcfa9011b8926766e6e96f950a101795447bb62b))
* pass auxIndex to aux level reducer ([a41b987](https://github.com/olzzon/sisyfos-audio-controller/commit/a41b9878e87a1c044548aea049c880be3cdda819))
* PFL should not mute channel ([3c66960](https://github.com/olzzon/sisyfos-audio-controller/commit/3c669601c848230bd086afcdbe36c1746c297779))
* pgm off didn´t get a prober fadetime ([1cbf98b](https://github.com/olzzon/sisyfos-audio-controller/commit/1cbf98b4b5cd9b8f77011b11248cf6112c10891f))
* problem with CCG interface incorrectly understanding decklink device ID ([8889acd](https://github.com/olzzon/sisyfos-audio-controller/commit/8889acd6493f2bd0a37933168ba3ab8a72a74564))
* QlClMixerConnection bug re huiRemoteConnection ([892bc27](https://github.com/olzzon/sisyfos-audio-controller/commit/892bc27a97956b35def27bb008e250e67df8db94))
* QlClMixerConnection called hui with wrong argument ([8fbdd1b](https://github.com/olzzon/sisyfos-audio-controller/commit/8fbdd1b3635c8d0f40debb4c2dbd2b73c834fa88))
* Reaper protocol. Wrong handling of feedback from mixer ([51bd2fb](https://github.com/olzzon/sisyfos-audio-controller/commit/51bd2fb638715670066a17275b17ca3e424cadc7))
* send state commands back to right ip and expose full state ([3a6f257](https://github.com/olzzon/sisyfos-audio-controller/commit/3a6f257de1de1557e802e2572c4c4bbd64e48b3e))
* setting menu, added cancel button to reload without saving ([931ddbe](https://github.com/olzzon/sisyfos-audio-controller/commit/931ddbefbe89d42bb3226f2ad913917f9aa77d55))
* settings - Protocol specific options displayed when protocol is changed (e.g. midi ports when a MIDI based protocol is selected) ([25167d2](https://github.com/olzzon/sisyfos-audio-controller/commit/25167d2bf0cd8a65477eeec2d937e62e5d4c8202))
* settings and routing menus position: fixed instead of absolute ([591877e](https://github.com/olzzon/sisyfos-audio-controller/commit/591877e73338e36be2c4c957dd0a79b13a2040f3))
* showMessageBoxSync parsed a null to an optional argument. Now removed ([3f4561f](https://github.com/olzzon/sisyfos-audio-controller/commit/3f4561febd6c1157d0980d3e177445296798e3c1))
* slider scroll - check for touchscreen ([7331216](https://github.com/olzzon/sisyfos-audio-controller/commit/73312166258c3afd8b4249cc11957bb1968a302b))
* SSL adjust fader all way to zero ([894a406](https://github.com/olzzon/sisyfos-audio-controller/commit/894a4065894c6b49136294d5b9d999f38b3474f6))
* SSL check for negative value before converting to Uint8Array ([54edfa3](https://github.com/olzzon/sisyfos-audio-controller/commit/54edfa33c1f6e2697aad15993c073c1bd3bc7192))
* SSL protocol did not receive initial state from desk. ([9009d46](https://github.com/olzzon/sisyfos-audio-controller/commit/9009d46314c4da6acbe96308b2d3a2e81815a50d))
* StuderVistaEmber file added ([bc4dcb3](https://github.com/olzzon/sisyfos-audio-controller/commit/bc4dcb39aa863577dbc7db05cf4d45aac33335af))
* toggleShowChannelStrip toggle between channels ([22abc5f](https://github.com/olzzon/sisyfos-audio-controller/commit/22abc5faaa51cac5adc6be378ab05f3b8c61d607))
* typeof declarationas ([d627950](https://github.com/olzzon/sisyfos-audio-controller/commit/d62795067bd29d7af98602291ff035569e19eda0))
* undo emptMiserMessage() as it didnt work inside object ([5da0bea](https://github.com/olzzon/sisyfos-audio-controller/commit/5da0bea9433e78e0f909f37ae5bb4b6296d1832f))
* update HUI remote fader, when level are changed from the mixer ([b762d5f](https://github.com/olzzon/sisyfos-audio-controller/commit/b762d5f6c9c3e85409be17fd0b580d76322a6b06))
* upload preload.js file after it was moved ([b87c859](https://github.com/olzzon/sisyfos-audio-controller/commit/b87c859525ee22c7215857e829786dd10b2d6d47))
* Webpack build - removed Babili and css mini extract plugins ([8ebd664](https://github.com/olzzon/sisyfos-audio-controller/commit/8ebd6649503c6626129c7c362545e06080fe64b3))
* when receiving fader update from mixer, responded level should be faderlevel not outgain ([0fd1bd5](https://github.com/olzzon/sisyfos-audio-controller/commit/0fd1bd53b0291ab7546c1cb228d52c5f9d339783))
* z-index was added to settings.css (as module react-slider has a z-index=1) ([b666157](https://github.com/olzzon/sisyfos-audio-controller/commit/b666157b68479dba46a74dcf9cd8de2082fb1d9c))
* **casparCG:** ensure that the filePath is a string ([248f863](https://github.com/olzzon/sisyfos-audio-controller/commit/248f86374a2b4aafef5cd41f7dc3291f00b3322e))
* **casparcg:** resolve an issue with PFL ([caf4946](https://github.com/olzzon/sisyfos-audio-controller/commit/caf494634876fc51ce895a377f2d8a735b3c3641))
* added file for last commit ([6197f2b](https://github.com/olzzon/sisyfos-audio-controller/commit/6197f2b35113ae9b8886f1a27ff04a2e1131fcee))
* added midiReceiveType variable ([abc1c2a](https://github.com/olzzon/sisyfos-audio-controller/commit/abc1c2a0ec00fa0476ac744f877a063614d2ff28))
* adding .ts files for last commit ([85cb336](https://github.com/olzzon/sisyfos-audio-controller/commit/85cb33641578aae5a8f3d5c523b4816ba2df2ee4))
* App -> passed an unused argument to MidiRemoteConnection ([386d496](https://github.com/olzzon/sisyfos-audio-controller/commit/386d4967c42cf8146c3bea1b267050192f6a2e16))
* AutomationConnection, OSC server could only receive local connections. IP changed to 0.0.0.0 ([ceb4d2f](https://github.com/olzzon/sisyfos-audio-controller/commit/ceb4d2f523f1173941d1172c6a847ab49a7e0031))
* Background on the whole mixer should be black ([e3e1583](https://github.com/olzzon/sisyfos-audio-controller/commit/e3e1583577e7cfbd9e7a4c16ac73e3961b212706))
* behringer and midas vu-meter import was removed ([d557479](https://github.com/olzzon/sisyfos-audio-controller/commit/d55747927f75e1c687d8be8634629a2b7471a68d))
* bouldn´ build app. Babel didn´t have preset-env installed ([58c573b](https://github.com/olzzon/sisyfos-audio-controller/commit/58c573b224d96f6c4b18451d63fbd6bba20768f5))
* changed value var to any as it can be a string or a number ([cb975a9](https://github.com/olzzon/sisyfos-audio-controller/commit/cb975a9dbbbe6d7328076a45b0b456bf179effe5))
* check for placement of {channel} in OSC commands ([67bab5b](https://github.com/olzzon/sisyfos-audio-controller/commit/67bab5b63316c4e93ed810a6665dadd2befd8a19))
* checkOSC command, if {channel} was last parameter in command it returned false ([c959bf0](https://github.com/olzzon/sisyfos-audio-controller/commit/c959bf0d3337357bab0f14b5e6dedde593529e79))
* CI added environment in test ([11ce0ee](https://github.com/olzzon/sisyfos-audio-controller/commit/11ce0ee8680600164ad08856c6b2ce9560263f23))
* CI comment out whole test ([f3eb9f2](https://github.com/olzzon/sisyfos-audio-controller/commit/f3eb9f26a84ae0da465cfc12e6c5b48c29c47391))
* CI only test build ([7905a6b](https://github.com/olzzon/sisyfos-audio-controller/commit/7905a6bccd13bd72b3ccb53621484a8472a56371))
* CI only test build ([0c178b5](https://github.com/olzzon/sisyfos-audio-controller/commit/0c178b5fe5f91da24a420d92dd34b02416cbf8a5))
* defaultChannelReducerState pushed to undefined array. ([f829191](https://github.com/olzzon/sisyfos-audio-controller/commit/f8291913aae5f156f2608632d5096654279a1419))
* enable/disable HuiRemoteController in settings ([39e0824](https://github.com/olzzon/sisyfos-audio-controller/commit/39e08249152790a1ba4b1635acdf9775c36db29a))
* Fade to excact target val (and not nearby) ([feafa5e](https://github.com/olzzon/sisyfos-audio-controller/commit/feafa5eacba96008f755199f1f719c187ed70882))
* fadeOut didn´t end if fader was exactly === min ([2868a62](https://github.com/olzzon/sisyfos-audio-controller/commit/2868a629f7df645e0953440b81353cb0b9e8f7ca))
* Fadi In/out when "master" mode didn´t turn down when PGM was on. ([2313f0d](https://github.com/olzzon/sisyfos-audio-controller/commit/2313f0d12bd9ca5628ce4567afab41a684babd33))
* forgot to add new files in new location on last commit. ([b6e24ab](https://github.com/olzzon/sisyfos-audio-controller/commit/b6e24abf4a873023cd1ff03ea1270cefc7c529e4))
* GrpFader.css - grpFader-pst-button.on show inactive color and off show active ([f8b3dc9](https://github.com/olzzon/sisyfos-audio-controller/commit/f8b3dc9a3e5bd8a9f66747c0654094fc090fc9a1))
* GrpFader.tsx should not be a PurComponent when using shouldCompenentUpdate ([77ca0e3](https://github.com/olzzon/sisyfos-audio-controller/commit/77ca0e3ed9afa44e5692dbc380bfa566ecba30ce))
* HUI remote - change test order of midi message so it checks for fader change before test for button ([38a71f7](https://github.com/olzzon/sisyfos-audio-controller/commit/38a71f7ea357b0355eae79c06434bf607a4f39b8))
* HUI remote - only update HUI if connected ([ed855c0](https://github.com/olzzon/sisyfos-audio-controller/commit/ed855c0510885a2bf47b76177377bd8c2feea4f8))
* Index offset when calling snap from automation ([28906d2](https://github.com/olzzon/sisyfos-audio-controller/commit/28906d273ce143b9a48f200401ded7d375f2b472))
* Individual fadetime, use fadeTime var instead of default value in Fades ([dbf1f9b](https://github.com/olzzon/sisyfos-audio-controller/commit/dbf1f9bd81b00cd2e819dc7047288a1693f8fc09))
* linux and win builds, no icon ([512b361](https://github.com/olzzon/sisyfos-audio-controller/commit/512b361e2894ce2193170086a5014eb9f57b126c))
* Meters didn´t work on behringer and midas after renaming. ([b090182](https://github.com/olzzon/sisyfos-audio-controller/commit/b0901829b08f59d3466cceddfe75d85419c3e6e5))
* missing /ch/1/visible ([f16674a](https://github.com/olzzon/sisyfos-audio-controller/commit/f16674ac4245313a1fb0d577f31ef3ac7e810ec8))
* MixerConnection - Fade dispatch resolution didn´t iterate ([4cf207f](https://github.com/olzzon/sisyfos-audio-controller/commit/4cf207f70d7f108e82829620eebfcc6bd57dfcbc))
* moved channelTypes to IMixerProtocolGeneric as it´s need when initialising the App for total number of channels ([33400f3](https://github.com/olzzon/sisyfos-audio-controller/commit/33400f36899e95ab9d5f96dbc43f49269f2be369))
* offset between channel and array ([8e0fe91](https://github.com/olzzon/sisyfos-audio-controller/commit/8e0fe91e2b0d2f10713795ba0ea98743651717e8))
* Only rerender when new state in store. Bug: snapOn is an array and forces a re-render everytime the redux runs it´s reducer ([98e48a1](https://github.com/olzzon/sisyfos-audio-controller/commit/98e48a164eadb878127a8b1e1574ddae416125b9))
* PFL pass complete OSC command for turning on and of PFL ([acb3108](https://github.com/olzzon/sisyfos-audio-controller/commit/acb3108c89ca713ff55d92b8bca33d0f716f80e8))
* Protocol cleanup - removed references to deleted protocols ([d01d3ca](https://github.com/olzzon/sisyfos-audio-controller/commit/d01d3ca792b5a6cf5f88c8a2ea7f1141fa2d941f))
* Protocol cleanup, removed protocols deleted in import ([9afeded](https://github.com/olzzon/sisyfos-audio-controller/commit/9afeded2e30a03326d2b73c96a8344a09887c8d2))
* re-render grp fader ([738895c](https://github.com/olzzon/sisyfos-audio-controller/commit/738895c6077dbe821126a947d427316348e9b411))
* refered to props store instead of windows store ([f022d79](https://github.com/olzzon/sisyfos-audio-controller/commit/f022d79cac9b9e3b7a0c1406ae424328335f2c0a))
* removed double background-color assignment in Channel.css ([9213f50](https://github.com/olzzon/sisyfos-audio-controller/commit/9213f50a9527e4dd9097f53311e3b9ce5b65c2e3))
* Rerender when clicking on a snap button. props state is now each elements value and not the object of the element ([fbe8dcd](https://github.com/olzzon/sisyfos-audio-controller/commit/fbe8dcd837b81523e74093443aec4c955b9173c3))
* SET_OUTPUT_LEVEL didn´t have a return so VU was set. ([0d14869](https://github.com/olzzon/sisyfos-audio-controller/commit/0d14869bd7ffea5541c2abc09ed0548714fd22e6))
* slow crossfade when take 32channels. dispatchTrigger added, so store only updates every 5 times the OSC fader is updated. ([f70061d](https://github.com/olzzon/sisyfos-audio-controller/commit/f70061dc8052675121abefe3f6c2ee0f60dce7ef))
* small type fixes ([d6d673f](https://github.com/olzzon/sisyfos-audio-controller/commit/d6d673ff208ee9a5ef2a428c1a1da16623bc3c58))
* toggling a snap on a channel didn´t update the gui. its now checked in shouldComponentUpdate ([face0e3](https://github.com/olzzon/sisyfos-audio-controller/commit/face0e3288f1028031041112d242191b4ebbaa4c))
* turned on channel instead of GrpFader ([56868af](https://github.com/olzzon/sisyfos-audio-controller/commit/56868af2840a6e7c19cf95c7fedc6104f4ddced8))
* type - assigned true to pflOn instead of comparing in if ( = instead of === ) ([83e0cba](https://github.com/olzzon/sisyfos-audio-controller/commit/83e0cbac1e4c950777e28468a579b8ea8a77485f))
* type used = instead of === ([c350927](https://github.com/olzzon/sisyfos-audio-controller/commit/c35092755abbde9ea6e586ca67b42bca9860417e))
* TYPO ([e2f761a](https://github.com/olzzon/sisyfos-audio-controller/commit/e2f761a9db7e9b1bb1224f6ab5e41db949987133))
* Update gain level in redux store so a change of volume while fading doesn´t jump back to gain from before last fade start ([68ae069](https://github.com/olzzon/sisyfos-audio-controller/commit/68ae0698bfd9c817286dfd158f4be8d5ecf4f87a))
* Update webpack.build for ts with babel. ([70e2437](https://github.com/olzzon/sisyfos-audio-controller/commit/70e2437d870f699e03e79191119de4e4e6314a3c))
* When an channelsetting is on and new protocol are selected that haven´t implementee channelsettings, the settings wouldn´t go away after reload. ([82373dd](https://github.com/olzzon/sisyfos-audio-controller/commit/82373dd0600e2fc21438f59af4b5461264dd048e))
* When running as "master" volume did not lower when pgm on. ([069b4b0](https://github.com/olzzon/sisyfos-audio-controller/commit/069b4b0ab7cf81ffb73618b2a1bdd26830b28057))
* window size on open, element types in Settings ([cdb2430](https://github.com/olzzon/sisyfos-audio-controller/commit/cdb2430b018db720f829c8c702dcdb5e1c07cbb6))
* yarn build - did not build as || was used instead of && ([48930e8](https://github.com/olzzon/sisyfos-audio-controller/commit/48930e8d64bea302d8bdf40413faed675c3bbeb6))
