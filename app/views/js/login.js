var request = require('request');

$('#login-btn').on('click', function() {
	var count = 0;
	$.each($('input'), function(i, value) {
		if ($(value).val() == "" && $(value).attr('placeholder') != 'optional' && $(value).parents('.form-group').css('display') != 'none') {
			console.log($(value))
			count += 1;
			$(value).css('border', '1px solid #ed1e24');
			setTimeout(function() {
				$(value).css('border', '');
			}, 2000);
		}
	});

	if (count == 0) {
		auth($('#input-email').val(), $('#input-password').val());
	}
	else {
		common.snackbar('All fields must be complete.')
	}
});

function auth(email, password) {
	request.post({
		url: 'https://desktop.checkmeout.pro/login', 
		form: {
			email: email,
			password: password
		} 
	},
	function(err, httpResponse, body) {
		if (err) {
			console.log(err);
		}
		else {
			if (body == new Buffer(email).toString('base64')) {
				$('body').fadeOut(100, function() {
					location.href = 'index.html';
				});

				localStorage.setItem('loggedInUser', JSON.stringify({ email: email, password: password }));
			}
			else if (body == 'Unauthorized') {
				common.snackbar('<i class="material-icons">error_outline</i>&nbsp; Could not log in. Check your details and make sure you are not logged in elsewhere.');
			}
			else {
				common.snackbar('<i class="material-icons">error_outline</i>&nbsp; An error occured.');
			}
		}
	});
}