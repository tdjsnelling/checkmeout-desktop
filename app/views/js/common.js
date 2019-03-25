const { remote, ipcRenderer, shell } = require('electron');
const isDev = require('electron-is-dev');

// fade in / out

$(document).ready(function() {
	$('body').fadeIn(200);
});

$('i, div, button').on('click', function() {
	var href = $(this).attr('href');
	if (href != null) {
		$('body').fadeOut(100, function() {
			location.href = href;
		});
	}
});

// snackbar - DEV ONLY

function snackbar(message, expires = true) {
	if ($('.snackbar')[0] != null) {
		$('.snackbar').remove();
	}

	$('body').append($('<div class="snackbar in"></div>').html(message));

	if (expires) {
		setTimeout(function() {
			$('.snackbar').removeClass('in');
			$('.snackbar').addClass('out');
			setTimeout(function() {
				$('.snackbar').remove();
			}, 490);
		}, 3500);
	}
	else {
		$('.snackbar').append($('<i class="material-icons snackbar-close">close</i>'))
	}
}

module.exports.snackbar = snackbar;

$(document).on('click', '.snackbar-close', function() {
	$('.snackbar').addClass('out');
	setTimeout(function() {
		$('.snackbar').remove();
	}, 490);
});

// messages from main process - DEV ONLY

ipcRenderer.on('message', function(event, message) {
	if (message == 'checking-for-updates') {
		snackbar('<p><i class="material-icons">file_download</i>&nbsp; Checking for updates...</p>');
	}
	else if (message == 'update-available') {
		console.log('update-available');
	}
	else if (message == 'mac-update-available') {
		console.log('mac-update-available');
		shell.openExternal('https://checkmeout.pro/desktop/update');
	}
	else if (message == 'update-not-available') {
		snackbar('<p><i class="material-icons">check</i>&nbsp; You\'re up to date!</p>');
	}
	else if (message == 'update-downloaded') {
		snackbar('<p><i class="material-icons">file_download</i>&nbsp; Update downloaded. Go to other settings and relaunch to get the latest changes.</p>', false);
	}
	else if (message == 'update-error') {
		console.log('update-error');
	}
	else if (message == 'download-progress') {
		console.log('download-progress');
	}
});

$(document).on('click', '#restart-link', function() {
	remote.app.relaunch();
	remote.app.exit(0);
});
