var request = require('request');

let email;

$(document).ready(function() {
	var regionIsSet = localStorage.getItem('region') != null;

	if (!regionIsSet) {
		$('#card-shipping, #card-payment').addClass('disabled');
	}

	email = JSON.parse(localStorage.getItem('loggedInUser')).email;
	$('#user-email').html(email + ' &nbsp;<i class="material-icons">account_circle</i>');
});

$('#log-out').on('click', function() {
	localStorage.removeItem('loggedInUser');

	request.post({
		url: 'https://desktop.checkmeout.pro/logout', 
		form: {
			email: email,
		} 
	},
	function(err, httpResponse, body) {
		if (err) {
			console.log(err);
		}
	});

	$('body').fadeOut(100, function() {
		location.href = 'login.html';
	});
});