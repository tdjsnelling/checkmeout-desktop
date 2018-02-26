var crypto = require('crypto');

$('#save-payment').on('click', function() {
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
		hash.update($('#cardtype').val() + $('#cardno').val() + $('#expirymonth').val() + $('#expiryyear').val() + $('#cvv').val());

		var payment = new Object();

		payment.id = hash.digest('hex');
		payment.type = $('#cardtype').val();
		payment.number = $('#cardno').val();
		payment.expirymonth = $('#expirymonth').val();
		payment.expiryyear = $('#expiryyear').val();
		payment.cvv = $('#cvv').val();

		var savedPayment = JSON.parse(localStorage.getItem('payment'));
		savedPayment = savedPayment == null ? [] : savedPayment;

		var exists = savedPayment.find(x => x.id == payment.id);
		if (exists == null) {
			savedPayment.push(payment);
			localStorage.setItem('payment', JSON.stringify(savedPayment));

			$('#save-payment').text('Save successful!');
			setTimeout(function() {
				$('#save-payment').text('Save');
			}, 2000);

			$('body').fadeOut(100, function() {
				location.href = 'payment.html';
			});
		}
		else {
			$('#save-payment').text('Profile already exists.');
			setTimeout(function() {
				$('#save-payment').text('Save');
			}, 2000);
		}
	}
	else {
		$('#save-payment').text('All fields must be complete.');
		setTimeout(function() {
			$('#save-payment').text('Save');
		}, 2000);
	}
});