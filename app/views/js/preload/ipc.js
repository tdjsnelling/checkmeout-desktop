var ipc = require('electron').ipcRenderer;

window.ipcSend = function(channel, data) {
	ipc.send(channel, data);
}