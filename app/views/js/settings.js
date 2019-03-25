var request = require('request');

let email;

$(document).ready(function() {
	var regionIsSet = localStorage.getItem('region') != null;

	if (!regionIsSet) {
		$('#card-shipping, #card-payment').addClass('disabled');
	}
});
