const {remote, ipcRenderer, shell} = require('electron');
var request = require('request');
var path = require('path');
var {machineId, machineIdSync} = require('node-machine-id');

let email;

$(document).ready(function() {
	email = JSON.parse(localStorage.getItem('loggedInUser')).email;
	$('#machineId').text(machineIdSync());
});

$('#open-dev-tools').on('click', function() {
	remote.BrowserWindow.getFocusedWindow().openDevTools();
});

$('#delete-all-data').on('click', function() {
	common.snackbar('<p><i class="material-icons">delete_forever</i>&nbsp; Are you sure? This cannot be undone. <a href="#" id="confirm-delete">OK, delete</a></p>', false);
});

$('#check-updates').on('click', function() {
	ipcRenderer.send('check-for-updates');
})

$('#relaunch').on('click', function() {
	remote.app.relaunch();
	remote.app.exit(0);
});

$(document).on('click', '#confirm-delete', function() {
	request.post({
		url: 'https://desktop.checkmeout.pro/logout', 
		form: {
			email: email,
		} 
	},
	function(err, httpResponse, body) {
		if (err) {
			console.log(err);
		}
	});

	localStorage.clear();
	location.href = 'login.html';
});

$('#login-google').on('click', function() {
	ipcRenderer.send('create', 'googleWindow');
});

$('#login-paypal').on('click', function() {
	ipcRenderer.send('create', 'paypalWindow');
});

$('#recaptcha').on('click', function() {
	ipcRenderer.send('create', 'captchaWindow');
});

$('#view-logs').on('click', function() {
	if (process.platform != 'darwin') {
		shell.showItemInFolder(path.join(remote.app.getPath('home'), 'AppData/Local/Programs/checkmeout-desktop/logs/*'));
	}
	else {
		shell.showItemInFolder(path.join(remote.app.getPath('home'), 'Documents/Check Me Out/logs/*'));
	}
});

$('#view-confs').on('click', function() {
	if (process.platform != 'darwin') {
		shell.showItemInFolder(path.join(remote.app.getPath('home'), 'AppData/Local/Programs/checkmeout-desktop/confirmations/*'));
	}
	else {
		shell.showItemInFolder(path.join(remote.app.getPath('home'), 'Documents/Check Me Out/confirmations/*'));
	}
});