var crypto = require('crypto');
var {ipcRenderer} = require('electron');

let editId;

var savedShipping = JSON.parse(localStorage.getItem('shipping'));
var savedPayment = JSON.parse(localStorage.getItem('payment'));

var shoppingList = [];

$(document).ready(function() {
	var url = new URL(location.href);
	editId = url.searchParams.get('id');

	if (editId) {
		var tasks = JSON.parse(localStorage.getItem('tasks'));
		var task = tasks.filter(x => x.id == editId)[0];

		if (task.shoppingList.length > 0) {
			$('#shopping-list').find('.empty').remove();
		}

		for (i in task.shoppingList) {
			item = task.shoppingList[i];

			// $('#shopping-list').append($('<li class="list-group-item item">').html('<p>' + item.category + ': ' + item.keywords + ' (' + item.negKeywords + ') - ' + item.colour + ' (' + item.size + ')</p><div class="controls"><i class="material-icons delete">close</i></div>'));
			$('#shopping-list').append($('<li class="list-group-item item">').html('<ul><li><b>Category: </b>' + item.category + '</li><li><b>Keywords: </b>' + item.keywords + ' (' + item.negKeywords + ')</li><li><b>Colour: </b>' + item.colour + '</li><li><b>Size: </b>' + item.size + '</li></ul><div class="controls"><i class="material-icons delete">close</i></div>'));
			shoppingList.push(item);
		}

		$('#task-name').val(task.name);
		$('#run-at').val(task.startTime);
		$('#proxy').val(task.proxy);
		$('#shipping-profile').val(task.shipping.id);
		$('#payment-profile').val(task.payment.id);
		$('#show-browser').prop('checked', task.showBrowser);
		$('#auto-checkout').prop('checked', task.autoCheckout);
		$('#auto-checkout-delay').val(task.autoCheckoutDelay);
		$('#retry-checkout').prop('checked', task.retryOnFail);
		$('#pp-delay').prop('checked', task.useProductPageDelay);
		$('#product-page-delay').val(task.productPageDelay);

		if (task.autoCheckout) {
			$('#auto-checkout-delay').parents('.col-h').show();
		}
		if (task.useProductPageDelay) {
			$('#product-page-delay').parents('.col-h').show();
		}

		$('#create-task').text('Update task')
	}
});

for (i in savedShipping) {
	$('#shipping-profile').append($('<option value="' + savedShipping[i].id + '">').html(savedShipping[i].address));
}
for (i in savedPayment) {
	var last4 =  savedPayment[i].number.substr(savedPayment[i].number.length - 4);
	$('#payment-profile').append($('<option value="' + savedPayment[i].id + '">').html(savedPayment[i].type + ': ' + last4));
}

$('#create-item').on('click', function() {
	var count = 0;
	$.each($('#keywords'), function(i, value) {
		if ($(value).val() == "" && $(value).attr('placeholder') != 'optional' && $(value).parents('.form-group').css('display') != 'none') {
			count += 1;
			$(value).css('border', '1px solid #ed1e24');
			setTimeout(function() {
				$(value).css('border', '');
			}, 2000);
		}
	});

	if (count == 0) {
		var item = new Object();
		item.category = $('#category').val();
		item.keywords = $('#keywords').val();
		item.negKeywords = $('#neg-keywords').val();
		item.colour = $('#colour').val();
		item.size = $('#size').val();
		item.continueNextSize = $('#continue-next-size').is(':checked');
		item.carted = false;

		$('#shopping-list').find('.empty').remove();

		// $('#shopping-list').append($('<li class="list-group-item item">').html('<p>' + item.category + ': ' + item.keywords + ' (' + item.negKeywords + ') - ' + item.colour + ' (' + item.size + ')</p><div class="controls"><i class="material-icons delete">close</i></div>'));
		$('#shopping-list').append($('<li class="list-group-item item">').html('<ul><li><b>Category: </b>' + item.category + '</li><li><b>Keywords: </b>' + item.keywords + ' (' + item.negKeywords + ')</li><li><b>Colour: </b>' + item.colour + '</li><li><b>Size: </b>' + item.size + '</li></ul><div class="controls"><i class="material-icons delete">close</i></div>'));
		shoppingList.push(item);

		$('#keywords').val('');
		$('#neg-keywords').val('');
		$('#colour').val('');
		$('#continue-next-size').prop('checked', false);
	}
	else {
		$('#create-item').text('All fields must be complete.');
		setTimeout(function() {
			$('#create-item').text('Add item');
		}, 2000);
	}
});

$(document).on('click', '.delete', function() {
	var index = $(this).parents('.list-group-item').index() - 1;
	shoppingList.splice(index, 1);
	$(this).parents('.list-group-item').remove();

	if (shoppingList.length == 0) {
		$('#shopping-list').append($('<li class="list-group-item empty">').html('Nothing here!'));
	}
});

$('#create-task').on('click', function() {
	var count = 0;
	$.each($('#task-name, #run-at, #shipping-profile, #payment-profile'), function(i, value) {
		if (($(value).val() == "" || $(value).val() == null) && $(value).attr('placeholder') != 'optional' && $(value).parents('.form-group').css('display') != 'none') {
			count += 1;
			$(value).css('border', '1px solid #ed1e24');
			setTimeout(function() {
				$(value).css('border', '');
			}, 2000);
		}
	});

	if ($('li.item').length == 0) {
		count += 1;
		$('ul > li').css('border', '1px solid #ed1e24');
		setTimeout(function() {
			$('ul > li').css('border', '');
		}, 2000);
	}

	if (count == 0) {
		if (editId) {
			var tasks = JSON.parse(localStorage.getItem('tasks'));
			var task = tasks.filter(x => x.id == editId)[0];

			tasks.splice(tasks.indexOf(task), 1);
			localStorage.setItem('tasks', JSON.stringify(tasks));
		}

		var hash = crypto.createHash('md5');
		hash.update($('#task-name').val() + $('#proxy').val() + $('#shipping-profile').val() + $('#payment-profile').val() + shoppingList + $('#run-at').val());

		var task = new Object();

		task.id = hash.digest('hex') + ':' + Date.now();
		task.name = $('#task-name').val();
		task.proxy = $('#proxy').val();
		task.shipping = savedShipping.find(x => x.id == $('#shipping-profile').val());
		task.payment = savedPayment.find(x => x.id == $('#payment-profile').val());
		task.shoppingList = shoppingList;
		task.startTime = $('#run-at').val();
		task.showBrowser = $('#show-browser').is(':checked');
		task.autoCheckout = $('#auto-checkout').is(':checked');
		task.autoCheckoutDelay = $('#auto-checkout-delay').val();
		task.retryOnFail = $('#retry-checkout').is(':checked');
		task.useProductPageDelay = $('#pp-delay').is(':checked');
		task.productPageDelay = $('#product-page-delay').val();
		task.status = 'Idle';
		task.autofilled = false;
		task.complete = false;

		var tasks = JSON.parse(localStorage.getItem('tasks'));
		tasks = tasks == null ? [] : tasks;

		var exists = tasks.find(x => x.id == task.id);
		if (exists == null) {
			tasks.push(task);
			localStorage.setItem('tasks', JSON.stringify(tasks));

			$('#create-task').text('Task created!');
			setTimeout(function() {
				$('#create-task').text('Create task');
			}, 2000);

			$('body').fadeOut(100, function() {
				location.href = 'index.html';
			});
		}
		else {
			$('#create-task').text('Task already exists.');
			setTimeout(function() {
				$('#create-task').text('Create task');
			}, 2000);
		}
	}
	else {
		$('#create-task').text('All fields must be complete.');
		setTimeout(function() {
			$('#create-task').text('Create task');
		}, 2000);
	}
});

$("#auto-checkout").on('click', function() {
	if (!$(this).is(':checked')) {
		$('#auto-checkout-delay').parents('.col-h').hide();
	}
	else {
		$('#auto-checkout-delay').parents('.col-h').show();
	}
});

$("#pp-delay").on('click', function() {
	if (!$(this).is(':checked')) {
		$('#product-page-delay').parents('.col-h').hide();
	}
	else {
		$('#product-page-delay').parents('.col-h').show();
	}
});

// keyword finder

$('#find-keywords').on('click', function(e) {
	e.preventDefault();
	ipcRenderer.send('create', 'keywordWindow');
});

ipcRenderer.on('keyword-item', (event, arg) => {
	$('#keywords').val($('#keywords').val() + ' ' + arg);
});
