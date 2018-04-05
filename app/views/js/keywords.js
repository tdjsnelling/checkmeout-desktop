var {ipcRenderer} =  require('electron');
var request = require('request');
var cheerio = require('cheerio');

$(document).ready(function() {
	request('https://supremecommunity.com/season/latest/droplists', (err, res, body) => {
		if (err) {
			console.log(err);
			$('#err').fadeIn(100);
		}
		else {
			var _$ = cheerio.load(body);

			_$('.block').each((i, el) => {
				setTimeout(() => {
					var url = _$(el).attr('href');
					$('.item-list-container').append($('<div class="drop-card animated slideInRight" data-url="' + url + '"></div>').html('<h2>' + _$(el).find('h2').text() + '</h2><h3>' + _$(el).find('h3').text() + '</h3>'));
				}, 100 * i);
			});
		}
	});
});

$(document).on('click', '.drop-card', function() {
	var url = 'https://supremecommunity.com' + $(this).data('url');

	request(url, (err, res, body) => {
		if (err) {
			console.log(err);
			$('#err').fadeIn(100);
		}
		else {
			$('.item-list-container').children().remove();

			var _$ = cheerio.load(body);

			$('#title').html('Keywords &mdash; ' + _$('h1').text() + '<button type="button" class="btn btn-header" id="back-button">Back to weeks</button>');
			$('#prices-prompt').fadeIn(100);

			_$('.card').each((i, el) => {
				setTimeout(() => {
					$('.item-list-container').append($('<div class="item-card animated slideInRight"></div>').html('<img width="200" src="https://supremecommunity.com' + _$(el).find('img').attr('src') + '"><h5>' + _$(el).find('.name').text() + '</h5><p>' + _$(el).parent().data('masonry-filter') + '</p><p>' +  _$(el).find('.label-price').text() + '</p><div class="tags"></div>'));
				}, 100 * i);
			});
		}
	});
});

$(document).on('click', '.item-card', function() {
	if ($(this).find('.tags').children().length == 0) {
		var tags = $(this).find('h5').text().split(/[\s/]/);
		for (i in tags) {
			$(this).find('.tags').append($('<p class="tag"><i class="material-icons">add</i>&nbsp;<span>' + tags[i] + '</span></p>'))
		}
	}
	else {
		$(this).find('.tags').children().remove();
	}
});

$(document).on('click', '.tag', function(e) {
	e.stopPropagation();
	ipcRenderer.send('keyword-item', $(this).find('span').text());

	$(this).find('.material-icons').text('check');
	setTimeout(() => {
		$(this).find('.material-icons').text('add');
	}, 2000);
});

$(document).on('click', '#back-button', function() {
	$('body').fadeOut(100, function() {
		location.reload();
	});
});