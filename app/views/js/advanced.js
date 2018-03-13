const {remote, ipcRenderer} = require('electron');

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
	localStorage.clear();
	location.href = 'login.html';
});

$('#login-google').on('click', function() {

});