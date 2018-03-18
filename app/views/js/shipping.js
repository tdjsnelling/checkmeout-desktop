var savedShipping = JSON.parse(localStorage.getItem('shipping'));

if (savedShipping != null && savedShipping.length > 0) {
	$('li').remove();
}

for (i in savedShipping) {
	$('#profiles-list').append($('<li class="list-group-item" data-id="' + savedShipping[i].id + '">').html('<p>' + savedShipping[i].name + ', ' + savedShipping[i].address + ', ' + savedShipping[i].zip + '</p><div class="controls"><i class="material-icons edit">edit</i><i class="material-icons delete">close</i></div>'));
}

$('#delete-all').on('click', function() {
	localStorage.setItem('shipping', JSON.stringify([]));
	$('li').remove();
	$('#profiles-list').append($('<li class="list-group-item"><i class="material-icons">error_outline</i>&nbsp; No shipping profiles to display. Create one with the \'New\' button.</li>'));
});

$(document).on('click', '.edit', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	$('body').fadeOut(100, function() {
		location.href = 'new-shipping.html?id=' + itemId;
	});
});

$(document).on('click', '.delete', function() {
	var itemId = $(this).parents('.list-group-item').data('id');
	var itemIndex = savedShipping.findIndex(x => x.id == itemId);
	savedShipping.splice(itemIndex, 1);
	localStorage.setItem('shipping', JSON.stringify(savedShipping));

	$(this).parents('.list-group-item').remove();

	if (savedShipping.length == 0) {
		$('#profiles-list').append($('<li class="list-group-item"><i class="material-icons">error_outline</i>&nbsp; No shipping profiles to display. Create one with the \'New\' button.</li>'));
	}
});