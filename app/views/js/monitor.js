// name: restocks.js
// author: Tom Snelling for Check Me Out Ltd
// year: 2018
// license: MIT

var request = require('request');
var events = require('events');
var cheerio = require('cheerio');

var headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
	'Cache-Control': 'max-age=0',
	'Connection': 'keep-alive',
	'Host': 'www.supremenewyork.com',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36'
};

var RestockChecker = function(interval, proxies = null) {
	events.EventEmitter.call(this);

	this.interval = interval;
	this.proxies = proxies;

	this.start = function(url) {
		this.url = url;
		this.counter = 0;
		
		this.ticker = setInterval(() => {
			if (this.proxies) {
				this.currentProxy = proxies[this.counter % this.proxies.length];
			}
			else {
				this.currentProxy = null;
			}

			checkStock(this.url, this.interval, this.currentProxy, (err, product) => {
				if (err) {
					this.emit('error', err);
				}
				else {
					if (product) {
						this.emit('stock-found', product)
					}
					else {
						this.emit('no-stock-found');
					}
				}
			});

			this.counter++;
		}, this.interval);
	}

	this.stop = function() {
		clearInterval(this.ticker);
	}
};

var checkStock = (url, interval, proxy, cb) => {
	request(url, { headers: headers, timeout: interval, proxy: proxy }, (err, res, body) => {
		if (err) {
			return cb(err, null);
		}
		else {
			var $ = cheerio.load(body);

			if ($('.sold-out').text() == 'sold out') {
				return cb(null, null);
			}
			else {
				var product = {
					name: null,
					colour: null,
					price: null,
					url: url,
					sizes: []
				};

				product.name = $('.show #details h1').text();
				product.colour = $('.show .style').text();
				product.price = $('.show .price').text();

				$('#size option').each((i, el) => {
					product.sizes.push($(el).text());
				});

				return cb(null, product);
			}
		}
	});
};

RestockChecker.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = RestockChecker;