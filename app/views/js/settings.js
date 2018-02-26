var regionIsSet = localStorage.getItem('region') != null;

if (!regionIsSet) {
	$('#card-shipping, #card-payment').addClass('disabled');
}

$('#user-email').html(JSON.parse(localStorage.getItem('loggedInUser')).email + ' &nbsp;<i class="material-icons">account_circle</i>');

$('#log-out').on('click', function() {
	localStorage.removeItem('loggedInUser');
	$('body').fadeOut(100, function() {
		location.href = 'login.html';
	});
});