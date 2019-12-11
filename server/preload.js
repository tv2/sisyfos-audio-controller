console.log('Preloading')

const { dialog } = require('electron').remote

global.dialog = dialog

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

global.aaaasper = 'IT´s preloaded'
console.log('PreLoad executed')
