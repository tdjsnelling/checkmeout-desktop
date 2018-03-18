var savedPayment = JSON.parse(localStorage.getItem('payment'));

if (savedPayment != null && savedPayment.length > 0) {
	$('li').remove();
}

for (i in savedPayment) {
	var last4 =  savedPayment[i].number.substr(savedPayment[i].number.length - 4);
	$('#profiles-list').append($('<li class="list-group-item" data-id="' + savedPayment[i].id + '">').html('<p>' + savedPayment[i].type + ': ****************' + last4 + '</p><div class="controls"><i class="material-icons edit">edit</i><i class="material-icons delete">close</i></div>'));
}

$('#delete-all').on('click', function() {
	localStorage.setItem('payment', JSON.stringify([]));
	$('li').remove();
	$('#profiles-list').append($('<li class="list-group-item"><i class="material-icons">error_outline</i>&nbsp; No payment profiles to display. Create one with the \'New\' button.</li>'));
});

$(document).on('click', '.edit', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	$('body').fadeOut(100, function() {
		location.href = 'new-payment.html?id=' + itemId;
	});
});

$(document).on('click', '.delete', function() {
	var itemId = $(this).parents('.list-group-item').attr('data-id');
	var itemIndex = savedPayment.findIndex(x => x.id == itemId);
	savedPayment.splice(itemIndex, 1);
	localStorage.setItem('payment', JSON.stringify(savedPayment));

	$(this).parents('.list-group-item').remove();

	if (savedPayment.length == 0) {
		$('#profiles-list').append($('<li class="list-group-item"><i class="material-icons">error_outline</i>&nbsp; No payment profiles to display. Create one with the \'New\' button.</li>'));
	}
});