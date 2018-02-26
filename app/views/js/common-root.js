const { remote, ipcRenderer } = require('electron');

// titlebar

$('html').append($('<div class="titlebar"> \
						<div class="titlebuttons"> \
							<i class="material-icons title-minimize">remove</i> \
							<i class="material-icons title-maximise">crop_square</i> \
							<i class="material-icons title-close">close</i> \
						</div> \
					</div>'));

$(document).ready(function() {
	if (remote.BrowserWindow.getFocusedWindow()) {
		if (remote.BrowserWindow.getFocusedWindow().isMaximized()) {
			$('.title-maximise').text('fullscreen_exit');
		}
		else {
			$('.title-maximise').text('crop_square');
		}
	}
});

$('.title-minimize').on('click', function() {
	remote.BrowserWindow.getFocusedWindow().minimize();
});
$('.title-maximise').on('click', function() {
	if (!remote.BrowserWindow.getFocusedWindow().isMaximized()) {
		remote.BrowserWindow.getFocusedWindow().maximize();
		$('.title-maximise').text('fullscreen_exit');
	}
	else {
		remote.BrowserWindow.getFocusedWindow().unmaximize();
		$('.title-maximise').text('crop_square');
	}
});
$('.title-close').on('click', function() {
	remote.BrowserWindow.getFocusedWindow().close();
});

remote.getCurrentWindow().on('maximize', function() {
	$('.title-maximise').text('fullscreen_exit');
});
remote.getCurrentWindow().on('unmaximize', function() {
	$('.title-maximise').text('crop_square');
});

// snackbar - PROD ONLY

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

// messages from main process - PROD ONLY

ipcRenderer.on('message', function(event, message) {
	if (message == 'update-available') {
		console.log('update-available');
	}
	else if (message == 'update-downloaded') {
		snackbar('<p><i class="material-icons">file_download</i>&nbsp; Update downloaded. <a href="#" id="restart-link">Relaunch</a> to get the latest changes.</p>', false);
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