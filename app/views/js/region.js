var region = localStorage.getItem('region');
$('#set-' + region).children('i').text('my_location');

$('#set-eu').on('click', function() {
	localStorage.setItem('region', 'eu');

	$(this).children('i').text('my_location');
	$('#set-us').children('i').text('location_searching');
	$('#set-jp').children('i').text('location_searching');
});
$('#set-us').on('click', function() {
	localStorage.setItem('region', 'us');

	$(this).children('i').text('my_location');
	$('#set-eu').children('i').text('location_searching');
	$('#set-jp').children('i').text('location_searching');
});
$('#set-jp').on('click', function() {
	localStorage.setItem('region', 'jp');

	$(this).children('i').text('my_location');
	$('#set-eu').children('i').text('location_searching');
	$('#set-us').children('i').text('location_searching');
});