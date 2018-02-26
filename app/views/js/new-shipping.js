var crypto = require('crypto');

var region = localStorage.getItem('region');

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