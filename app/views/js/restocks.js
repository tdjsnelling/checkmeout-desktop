var ipcRenderer = require('electron').ipcRenderer;

let monitors;

$(document).ready(function() {
	monitors = JSON.parse(localStorage.getItem('monitors'));
	monitors = monitors == null ? [] : monitors;

	if (monitors.length > 0) {
		$('li').remove();
	}

	for (i in monitors) {
		$('#monitors').append($('<li class="list-group-item" data-id="' + monitors[i].id + '">').html('<b>' + monitors[i].name + '</b>&nbsp;' + monitors[i].url + '<div class="controls"><i class="material-icons start">play_arrow</i><i class="material-icons edit">edit</i><i class="material-icons delete">close</i></div></li>'));
	}

	ipcRenderer.send('get-monitors');
	ipcRenderer.on('get-monitors', (event, monitors) => {
		console.log(monitors)
		for (i in monitors) {
			$('li').each((j, el) => {
				if ($(el).data('id') == monitors[i].id) {
					$(el).find('.start').text('stop');
					$(el).find('.start').addClass('stop');
					$(el).find('.start').removeClass('start');
				}
			})
		}
	});
});

$(document).on('click', '.start', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	var item = monitors.filter(x => x.id == itemId)[0];
	
	ipcRenderer.send('start-monitor', item);

	$(this).text('stop');
	$(this).removeClass('start');
	$(this).addClass('stop');
});

$(document).on('click', '.stop', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	var item = monitors.filter(x => x.id == itemId)[0];
	
	ipcRenderer.send('stop-monitor', item);

	$(this).text('play_arrow');
	$(this).removeClass('stop');
	$(this).addClass('start');
});

$(document).on('click', '.edit', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	
	$('body').fadeOut(100, function() {
		location.href = 'new-restock.html?id=' + itemId;
	});
});

$(document).on('click', '.delete', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	var itemIndex = monitors.findIndex(x => x.id == itemId);
	monitors.splice(itemIndex, 1);
	localStorage.setItem('monitors', JSON.stringify(monitors));

	$(this).parents('.list-group-item').remove();

	if (monitors.length == 0) {
		$('#monitors').append($('<li class="list-group-item list-item-empty"><i class="material-icons">error_outline</i>&nbsp; You have not created any restock monitors.</li>'));
	}
});

ipcRenderer.on('stock-found', (event, monitor, product) => {
	ipcRenderer.send('stop-monitor', monitor);
});