var crypto = require('crypto');

var savedShipping = JSON.parse(localStorage.getItem('shipping'));
var savedPayment = JSON.parse(localStorage.getItem('payment'));

var shoppingList = [];

for (i in savedShipping) {
	$('#shipping-profile').append($('<option value="' + savedShipping[i].id + '">').html(savedShipping[i].address));
}
for (i in savedPayment) {
	var last4 =  savedPayment[i].number.substr(savedPayment[i].number.length - 4);
	$('#payment-profile').append($('<option value="' + savedPayment[i].id + '">').html(savedPayment[i].type + ': ' + last4));
}

$('#create-item').on('click', function() {
	var count = 0;
	$.each($('#keywords, #colour'), function(i, value) {
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
		item.colour = $('#colour').val();
		item.size = $('#size').val();
		item.carted = false;

		$('#shopping-list').append($('<li class="list-group-item item">').html('<p>' + item.category + ': ' + item.keywords + ' - ' + item.colour + ' (' + item.size + ')</p><div class="controls"><i class="material-icons delete">close</i></div>'));
		shoppingList.push(item);

		$('#keywords').val('');
		$('#colour').val('');
	}
	else {
		$('#create-item').text('All fields must be complete.');
		setTimeout(function() {
			$('#create-item').text('Add item');
		}, 2000);
	}
});

$(document).on('click', '.delete', function() {
	var index = $(this).parents('.list-group-item').index();
	shoppingList.splice(index, 1);
	$(this).parents('.list-group-item').remove();
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
		var hash = crypto.createHash('md5');
		hash.update($('#task-name').val() + $('#proxy').val() + $('#shipping-profile').val() + $('#payment-profile').val() + shoppingList + $('#run-at').val());

		var task = new Object();

		task.id = hash.digest('hex');
		task.name = $('#task-name').val();
		task.proxy = $('#proxy').val();
		task.shipping = savedShipping.find(x => x.id == $('#shipping-profile').val());
		task.payment = savedPayment.find(x => x.id == $('#payment-profile').val());
		task.shoppingList = shoppingList;
		task.startTime = $('#run-at').val();
		task.status = 'Idle';

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