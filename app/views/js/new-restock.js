var crypto = require('crypto');

let tasks, editId;

$(document).ready(function() {
	var url = new URL(location.href);
	editId = url.searchParams.get('id');

	if (editId) {
		var monitors = JSON.parse(localStorage.getItem('monitors'));
		var monitor = monitors.filter(x => x.id == editId)[0];

		$('#name').val(monitor.name)
		$('#item-url').val(monitor.url);
		$('#size').val(monitor.size);
		$('#trigger-task').val(monitor.task);
		$('#interval').val(monitor.interval / 1000);
		$('#interval-text').text(monitor.interval / 1000 + ' seconds');
		$('#proxies').val(monitor.proxies.join(', '));

		$('#create-monitor').text('Update monitor')
	}

	tasks = JSON.parse(localStorage.getItem('tasks'));

	for (i in tasks) {
		$('#trigger-task').append($('<option value="' + tasks[i].id + '">').html(tasks[i].name));
	}
});

$('#interval').on('input', function() {
	$('#interval-text').text($(this).val() + ' seconds');
});

$('#create-monitor').on('click', function() {
	var count = 0;
	$.each($('input, select'), function(i, value) {
		if ($(value).val() == "" && $(value).attr('placeholder') != 'optional' && $(value).parents('.form-group').css('display') != 'none') {
			count += 1;
			$(value).css('border', '1px solid #ed1e24');
			setTimeout(function() {
				$(value).css('border', '');
			}, 2000);
		}
	});

	if (count == 0) {
		if (editId) {
			var monitors = JSON.parse(localStorage.getItem('monitors'));
			var monitor = monitors.filter(x => x.id == editId)[0];

			monitors.splice(monitors.indexOf(monitor), 1);
			localStorage.setItem('monitors', JSON.stringify(monitors));
		}

		var hash = crypto.createHash('md5');
		hash.update($('#item-url').val() + $('#trigger-task').val() + $('#size').val());

		var monitor = new Object();

		monitor.id = hash.digest('hex');
		monitor.name = $('#name').val()
		monitor.url = $('#item-url').val();
		monitor.size = $('#size').val();
		monitor.task = $('#trigger-task').val();
		monitor.interval = $('#interval').val() * 1000;
		monitor.proxies = $('#proxies').val().split(',');

		for (i in monitor.proxies) {
			monitor.proxies[i] = monitor.proxies[i].trim();

			if (monitor.proxies[i] == '') {
				monitor.proxies.splice(i, 1);
			}
		}

		var monitors = JSON.parse(localStorage.getItem('monitors'));
		monitors = monitors == null ? [] : monitors;

		var exists = monitors.find(x => x.id == monitor.id);
		if (exists == null) {
			monitors.push(monitor);
			localStorage.setItem('monitors', JSON.stringify(monitors));

			$('#create-monitor').text('Monitor created!');
			setTimeout(function() {
				$('#create-monitor').text('Create monitor');
			}, 2000);

			$('body').fadeOut(100, function() {
				location.href = 'restocks.html';
			});
		}
		else {
			$('#create-monitor').text('Monitor already exists.');
			setTimeout(function() {
				$('#create-monitor').text('Create monitor');
			}, 2000);
		}
	}
	else {
		$('#create-monitor').text('All fields must be complete.');
		setTimeout(function() {
			$('#create-monitor').text('Create monitor');
		}, 2000);
	}
});