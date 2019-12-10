console.log('preloading')

const remote = require('electron').remote
const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote
const { getPath } = require('electron').remote.app

global.fs = remote.require('fs')
global.dialog = dialog
global.getPath = getPath
global.ipcRenderer = ipcRenderer

//global.SettingsStorage = './utils/SettingsStorage.ts'

global.aaaa = 'PRELOAD WAS EXECUTED'
console.log('PreLoad executed')

/*
let listener;
const bridge = {
   send: data => ipcRenderer.send('from-renderer', data),
   onMessage: callback => listener = callback 
}

ipcRenderer.on('to-renderer', (event, arg) => {
  if (listener) {
     listener(arg);
  } else {
     console.warn('No listener');
  }
});

global.bridge = bridge;*/