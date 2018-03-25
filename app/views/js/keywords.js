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
			var url = 'https://supremecommunity.com' + _$('.block').first().attr('href');
			
			if (url) {
				request(url, (err, res, body) => {
					if (err) {
						console.log(err);
						$('#err').fadeIn(100);
					}
					else {
						var _$ = cheerio.load(body);

						$('#title').html('Keywords &mdash; ' + _$('h1').text());

						_$('.card').each((i, el) => {
							$('.item-list-container').append($('<div class="item-card"></div>').html('<img width="200" src="https://supremecommunity.com' + _$(el).find('img').attr('src') + '"><h5>' + _$(el).find('.name').text() + '</h5><p>' + _$(el).parent().data('masonry-filter') + '</p><p>' +  _$(el).find('.label-price').text() + '</p><div class="tags"></div>'));
						});
					}
				});
			}
			else {
				$('#err').fadeIn(100);
			}
		}
	});
});

$(document).on('click', '.item-card', function() {
	if ($(this).find('.tags').children().length == 0) {
		var tags = $(this).find('h5').text().split(' ');
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
});