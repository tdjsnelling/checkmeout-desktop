var crypto = require('crypto');

let editId;

var region = localStorage.getItem('region');
var savedShipping = JSON.parse(localStorage.getItem('shipping'));

$(document).ready(function() {
	var url = new URL(location.href);
	editId = url.searchParams.get('id');

	if (editId) {
		var profile = savedShipping.filter(x => x.id == editId)[0];

		$('#name').val(profile.name);
		$('#email').val(profile.email);
		$('#phone').val(profile.phone);
		$('#address').val(profile.address);
		$('#address2').val(profile.address2);
		$('#address3').val(profile.address3);
		$('#city').val(profile.city);
		$('#zip').val(profile.zip);
		$('#country').val(profile.country);
		$('#us-state').val(profile.state);
		$('#jp-prefecture').val(profile.prefecture);

		$('#save-shipping').text('Update');
	}
});

if (region == 'us') {
	$('#us-state').show();

	$('#country > option').remove();
	$('#country').append($('<option value="USA">USA</option>'));
	$('#country').append($('<option value="CANADA">CANADA</option>'));
}
else if (region == 'jp') {
	$('#jp-prefecture').show();

	$('#country > option').remove();
	$('#country').append($('<option value="JP">JAPAN</option>'));
}

$('#save-shipping').on('click', function() {
	var count = 0;
	$.each($('input'), function(i, value) {
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
			var savedShipping = JSON.parse(localStorage.getItem('shipping'));
			var profile = savedShipping.filter(x => x.id == editId)[0];

			savedShipping.splice(savedShipping.indexOf(profile), 1);
			localStorage.setItem('shipping', JSON.stringify(savedShipping));
		}

		var hash = crypto.createHash('md5');
		hash.update($('#name').val() + $('#email').val() + $('#phone').val() + $('#address').val() + $('#address2').val() + $('#address3').val() + $('#city').val() + $('#zip').val() + $('#country').val());

		var shipping = new Object();

		shipping.id = hash.digest('hex');
		shipping.name = $('#name').val();
		shipping.email = $('#email').val();
		shipping.phone = $('#phone').val();
		shipping.address = $('#address').val();
		shipping.address2 = $('#address2').val();
		shipping.address3 = $('#address3').val();
		shipping.city = $('#city').val();
		shipping.zip = $('#zip').val();
		shipping.country = $('#country').val();
		shipping.state = $('#us-state').val();
		shipping.prefecture = $('#jp-prefecture').val();

		var savedShipping = JSON.parse(localStorage.getItem('shipping'));
		savedShipping = savedShipping == null ? [] : savedShipping;

		var exists = savedShipping.find(x => x.id == shipping.id);
		if (exists == null) {
			savedShipping.push(shipping);
			localStorage.setItem('shipping', JSON.stringify(savedShipping));

			$('#save-shipping').text('Save successful!');
			setTimeout(function() {
				$('#save-shipping').text('Save');
			}, 2000);

			$('body').fadeOut(100, function() {
				location.href = 'shipping.html';
			});
		}
		else {
			$('#save-shipping').text('Profile already exists.');
			setTimeout(function() {
				$('#save-shipping').text('Save');
			}, 2000);
		}
	}
	else {
		$('#save-shipping').text('All fields must be complete.');
		setTimeout(function() {
			$('#save-shipping').text('Save');
		}, 2000);
	}
});