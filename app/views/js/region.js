var region = localStorage.getItem('region');
$('#set-' + region).children('i').text('my_location');

setTimeout(function() {
	if (region == 'eu') {
		$('[cc=gb], [cc=ie], [cc=fr], [cc=de], [cc=es], [cc=pt], [cc=it], [cc=ch], [cc=nl], [cc=be], [cc=no], [cc=se], [cc=dk], [cc=fi], [cc=lv], [cc=lt], [cc=by], [cc=pl], [cc=ee], [cc=ua], [cc=cz], [cc=sk], [cc=at], [cc=hu], [cc=si], [cc=hr], [cc=ba], [cc=md], [cc=ro], [cc=rs], [cc=bg], [cc=al], [cc=mk], [cc=gr], [cc=ru]').css('fill', '#ed1e24');
	}
	else if (region == 'us') {
		$('[cc=us], [cc=ca]').css('fill', '#ed1e24');
	}
	else if (region == 'jp') {
		$('[cc=jp]').css('fill', '#ed1e24');
	}
}, 50);

$('#set-eu').on('click', function() {
	localStorage.setItem('region', 'eu');

	$(this).children('i').text('my_location');
	$('#set-us').children('i').text('location_searching');
	$('#set-jp').children('i').text('location_searching');

	$('[cc]').css('fill', 'black');
	$('[cc=gb], [cc=ie], [cc=fr], [cc=de], [cc=es], [cc=pt], [cc=it], [cc=ch], [cc=nl], [cc=be], [cc=no], [cc=se], [cc=dk], [cc=fi], [cc=lv], [cc=lt], [cc=by], [cc=pl], [cc=ee], [cc=ua], [cc=cz], [cc=sk], [cc=at], [cc=hu], [cc=si], [cc=hr], [cc=ba], [cc=md], [cc=ro], [cc=rs], [cc=bg], [cc=al], [cc=mk], [cc=gr], [cc=ru]').css('fill', '#ed1e24');
});
$('#set-us').on('click', function() {
	localStorage.setItem('region', 'us');

	$(this).children('i').text('my_location');
	$('#set-eu').children('i').text('location_searching');
	$('#set-jp').children('i').text('location_searching');

	$('[cc]').css('fill', 'black');
	$('[cc=us], [cc=ca]').css('fill', '#ed1e24');
});
$('#set-jp').on('click', function() {
	localStorage.setItem('region', 'jp');

	$(this).children('i').text('my_location');
	$('#set-eu').children('i').text('location_searching');
	$('#set-us').children('i').text('location_searching');

	$('[cc]').css('fill', 'black');
	$('[cc=jp]').css('fill', '#ed1e24');
});

$('#set-eu').on('mouseenter', function() {
	if ($(this).find('.material-icons').text() != 'my_location') {
		$('[cc=gb], [cc=ie], [cc=fr], [cc=de], [cc=es], [cc=pt], [cc=it], [cc=ch], [cc=nl], [cc=be], [cc=no], [cc=se], [cc=dk], [cc=fi], [cc=lv], [cc=lt], [cc=by], [cc=pl], [cc=ee], [cc=ua], [cc=cz], [cc=sk], [cc=at], [cc=hu], [cc=si], [cc=hr], [cc=ba], [cc=md], [cc=ro], [cc=rs], [cc=bg], [cc=al], [cc=mk], [cc=gr], [cc=ru]').css('fill', '#cc2029');
	}
});
$('#set-eu').on('mouseleave', function() {
	if ($(this).find('.material-icons').text() != 'my_location') {
		$('[cc=gb], [cc=ie], [cc=fr], [cc=de], [cc=es], [cc=pt], [cc=it], [cc=ch], [cc=nl], [cc=be], [cc=no], [cc=se], [cc=dk], [cc=fi], [cc=lv], [cc=lt], [cc=by], [cc=pl], [cc=ee], [cc=ua], [cc=cz], [cc=sk], [cc=at], [cc=hu], [cc=si], [cc=hr], [cc=ba], [cc=md], [cc=ro], [cc=rs], [cc=bg], [cc=al], [cc=mk], [cc=gr], [cc=ru]').css('fill', 'black');
	}
});

$('#set-us').on('mouseenter', function() {
	if ($(this).find('.material-icons').text() != 'my_location') {
		$('[cc=us], [cc=ca]').css('fill', '#cc2029');
	}
});
$('#set-us').on('mouseleave', function() {
	if ($(this).find('.material-icons').text() != 'my_location') {
		$('[cc=us], [cc=ca]').css('fill', 'black');
	}
});

$('#set-jp').on('mouseenter', function() {
	if ($(this).find('.material-icons').text() != 'my_location') {
		$('[cc=jp]').css('fill', '#cc2029');
	}
});
$('#set-jp').on('mouseleave', function() {
	if ($(this).find('.material-icons').text() != 'my_location') {
		$('[cc=jp]').css('fill', 'black');
	}
});
