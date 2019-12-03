console.log('preloading')

const remote = require('electron').remote
const { dialog } = require('electron').remote
const { getPath } = require('electron').remote.app


global.aaaasper = 'IT´s preloaded'
global.fs = remote.require('fs')
global.osc = remote.require('osc')
global.net = remote.require('net')
global.emberplus = remote.require('emberplus')
global.casparcgconnection = remote.require('casparcg-connection')
global.dialog = dialog
global.getPath = getPath


console.log('PreLoad executed')

global.electron = {
  ipc: {
    invoke (channel, ...args) {
      return ipcRenderer.invoke(channel, ...args)
    },
    send (msg, arg) {
      ipcRenderer.send(msg, arg)
    },
    on (channel, cb) {
      ipcRenderer.on(channel, cb)
    },
    off (channel, cb) {
      ipcRenderer.off(channel, cb)
    }
  }
}