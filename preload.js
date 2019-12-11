console.log('preloading')

const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote
const { getPath } = require('electron').remote.app

global.dialog = dialog
global.getPath = getPath
global.ipcRenderer = ipcRenderer

//global.SettingsStorage = './utils/SettingsStorage.ts'

global.aaaa = 'PRELOAD WAS EXECUTED'
console.log('PreLoad is executed')
