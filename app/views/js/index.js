const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
var moment = require('moment');
var cheerio = require('cheerio');
var Fuse = require('fuse.js');
var request = require('request');
var path = require('path');
const isDev = require('electron-is-dev');
var fs = require('fs');

var tasks = JSON.parse(localStorage.getItem('tasks'));
tasks = tasks == null ? [] : tasks;

var ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36';

var timeNow = moment();
$('#time').text(timeNow.format('HH:mm:ss'));

let t0;

var verPrefix = 'BETA ';
var ver = remote.app.getVersion();
$('.badge-ver').text(verPrefix + ver);

$('#user-email').text(JSON.parse(localStorage.getItem('loggedInUser')).email);

var browsers = [];

function perf(browser, event) {
	var t = performance.now() - t0;
	var tObj = {
		browser: browser,
		name: tasks[browser].name, 
		event: event,
		time: `T+${t.toFixed(3)} ms`
	}

	console.log(tObj);
	fs.appendFile('log.txt', JSON.stringify(tObj) + '\n', (err) => {
		if (err) throw err;
	});
}

setInterval(() => {
	timeNow = moment();
	$('#time').text(timeNow.format('HH:mm:ss'));

	for (i in tasks) {
		if (tasks[i].status == 'Waiting') {
			var startTime = moment(tasks[i].startTime, 'HH:mm:ss')
			var diff = startTime.diff(timeNow, 'seconds') + 1;

			$($('.list-group-item:not(.list-head)')[i]).children('.status').text('Waiting: ' + diff + 's');
			$($('.list-group-item:not(.list-head)')[i]).children('.status').css('color', '#f39c12');
			
			if (diff == 0) {
				tasks[i].status = 'Running';
				localStorage.setItem('tasks', JSON.stringify(tasks));
				$($('.list-group-item:not(.list-head)')[i]).children('.status').text('Running');
				$($('.list-group-item:not(.list-head)')[i]).children('.status').css('color', '#2ecc71');

				createBrowser(tasks[i]);
			}
		}
	}
}, 100);

setInterval(() => {
	for (i in browsers) {
		if (browsers[i].isDestroyed()) {
			$($('.list-group-item').not('.list-head')[i]).children('.status').text('Ended');
			$($('.list-group-item').not('.list-head')[i]).children('.status').css('color', '');
			tasks[i].status = 'Idle';
			localStorage.setItem('tasks', JSON.stringify(tasks));

			browsers.splice(i, 1);
		}
	}
}, 250);

$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

if (tasks.length > 0) {
	$('.list-group-item').not('.list-head').remove();
	for (i in tasks) {
		var last4 =  tasks[i].payment.number.substr(tasks[i].payment.number.length - 4);
		$('#tasks').append($('<li class="list-group-item" data-id="' + tasks[i].id + '""> \
								<div class="col-icon"><i class="material-icons task-select">check_box_outline_blank</i></div> \
								<div class="col no-overflow name">' + tasks[i].name + '</div> \
								<div class="col no-overflow address">' + tasks[i].shipping.address + '</div> \
								<div class="col no-overflow payment">' + tasks[i].payment.type + ': ' + last4 + '</div> \
								<div class="col no-overflow status">' + tasks[i].status + '</div> \
								<div class="controls"><i class="material-icons edit-task">edit</i></div> \
							</li>'));
	}
}

$(document).on('click', '.task-select', function() {
	var index = $(this).parents('.list-group-item').index() - 1;
	var last4 =  tasks[index].payment.number.substr(tasks[index].payment.number.length - 4);

	if ($(this).text() == 'check_box') {
		$(this).text('check_box_outline_blank');
		$(this).parents('.list-group-item').css('height', '');

		$(this).parent().siblings('.address').html(tasks[index].shipping.address);
		$(this).parent().siblings('.payment').html(tasks[index].payment.type + ': ' + last4);
		$(this).parent().siblings('.name').html(tasks[index].name);
	}
	else {
		$(this).text('check_box');
		$(this).parents('.list-group-item').css('height', '120px');

		var shoppingListString = '';
		for (i in tasks[index].shoppingList) {
			shoppingListString += tasks[index].shoppingList[i].keywords + ', ' + tasks[index].shoppingList[i].colour + '<br>';
		}

		$(this).parent().siblings('.address').html(tasks[index].shipping.name + '<br>' + tasks[index].shipping.address + '<br>' + tasks[index].shipping.city + '<br>' + tasks[index].shipping.zip);
		$(this).parent().siblings('.payment').html(tasks[index].payment.type + '<br>' + tasks[index].payment.number + '<br>' + tasks[index].payment.expirymonth + '/' + tasks[index].payment.expiryyear + '<br>' + tasks[index].payment.cvv);
		$(this).parent().siblings('.name').html(tasks[index].name + '<br>' + shoppingListString);
	}
});

$('#delete-selected').on('click', function() {
	if (shiftClick) {
		$('.list-group-item').not('.list-head').each(function(i) {
			$(this).children('.col-icon').children('i').text('check_box');
		});
	}
	
	var selected = 0;

	$('.list-group-item').not('.list-head').each(function(i) {
		if ($(this).children('.col-icon').children('i').text() == 'check_box') {
			selected++;

			tasks[i] = null;
			$(this).remove();
		}
	});

	if (selected == 0) {
		common.snackbar('<i class="material-icons">error_outline</i>&nbsp; No tasks selected.');
	}

	tasks = tasks.filter(function(n) { return n != null }); 
	localStorage.setItem('tasks', JSON.stringify(tasks));

	if (tasks.length == 0 && $('.list-item-empty')[0] == null) {
		$('#tasks').append($('<li class="list-group-item list-item-empty"><i class="material-icons">error_outline</i>&nbsp; No tasks to display.</li>'));
	}
});

$('#run-tasks').on('click', function() {
	t0 = performance.now();

	tasks = JSON.parse(localStorage.getItem('tasks'));

	if (shiftClick) {
		$('.list-group-item').not('.list-head').each(function(i) {
			$(this).children('.col-icon').children('i').text('check_box');
		});
	}

	var selected = 0;

	$('.list-group-item').not('.list-head').each(function(i) {
		if ($(this).children('.col-icon').children('i').text() == 'check_box') {
			selected++;

			tasks[i].autofilled = false;
			tasks[i].complete = false;
			localStorage.setItem('tasks', JSON.stringify(tasks));

			if (tasks[i].startTime == 'now') {
				tasks[i].status = 'Running';
				localStorage.setItem('tasks', JSON.stringify(tasks));
				$($('.list-group-item:not(.list-head)')[i]).children('.status').text('Running');
				$($('.list-group-item:not(.list-head)')[i]).children('.status').css('color', '#2ecc71');

				createBrowser(tasks[i]);
			}
			else {
				var startTime = moment(tasks[i].startTime, 'HH:mm:ss');
				var diff = startTime.diff(timeNow, 'seconds');

				if (diff > 0) {
					tasks[i].status = 'Waiting';
					$(this).children('.status').text('Waiting');
					$(this).children('.status').css('color', '#f39c12');
				}
				else {
					var el = $(this).children('.status');
					el.text('Cannot start expired task');
					el.css('color', '#e74c3c');
					setTimeout(function() {
						el.text('Idle');
						el.css('color', '');
					}, 2000);
				}
			}
		}
	});

	if (selected == 0) {
		common.snackbar('<i class="material-icons">error_outline</i>&nbsp; No tasks selected.');
	}
	else {
		ipcRenderer.send('create', 'logWindow');
	}

	localStorage.setItem('tasks', JSON.stringify(tasks));
});

$('#pause-tasks').on('click', function() {
	if (shiftClick) {
		$('.list-group-item').not('.list-head').each(function(i) {
			$(this).children('.col-icon').children('i').text('check_box');
		});
	}

	var selected = 0;

	$('.list-group-item').not('.list-head').each(function(i) {
		if ($(this).children('.col-icon').children('i').text() == 'check_box') {
			selected++;
			
			if (tasks[i].status != 'Idle') {
				tasks[i].status = 'Idle';
				$(this).children('.status').text('Idle');
				$(this).children('.status').css('color', '');

				browsers[i].destroy();
			}
		}
	});

	if (selected == 0) {
		common.snackbar('<i class="material-icons">error_outline</i>&nbsp; No tasks selected.');
	}

	localStorage.setItem('tasks', JSON.stringify(tasks));
});

$(document).on('click', '.edit-task', function() {
	var id = $(this).parents('.list-group-item').data('id');

	$('body').fadeOut(100, function() {
		location.href = 'task.html?id=' + id;
	});
});

var shiftClick = false;

$('body').on('keydown', (e) => {
	if (e.keyCode == 16) {
		shiftClick = true;
	}
	else if (e.keyCode == 32) {
		$('#run-tasks').click();
	}
	else if (e.keyCode == 46) {
		$('#delete-selected').click();
	}
});

$('body').on('keyup', (e) => {
	if (e.key == 'Shift') {
		shiftClick = false;
	}
});

function createBrowser(task) {
	var preloadPath;

	if (isDev) {
		preloadPath = path.resolve('./views/js/preload/ipc.js');
	}
	else {
		preloadPath = path.join(__dirname, '/preload/ipc.js');
	}

	var newBrowser = new remote.BrowserWindow({
		width: 1000,
		height: 750,
		show: task.showBrowser,
		webPreferences: {
			nodeIntegration: false,
			preload: preloadPath
		}
	});

	if (task.proxy != '') {
		newBrowser.webContents.session.setProxy({ proxyRules: 'http://' + task.proxy }, () => {
			newBrowser.webContents.on('dom-ready', () => {
				handleBrowser(newBrowser.id);
			});

			browsers.push(newBrowser);

			for (i in task.shoppingList) {
				task.shoppingList[i].carted = false;
			}

			perf(browsers.indexOf(newBrowser), 'browser-created');

			gotoNextItem(browsers.indexOf(newBrowser));
			
		});
	}
	else {
		newBrowser.webContents.on('dom-ready', () => {
			handleBrowser(newBrowser.id);
		});

		browsers.push(newBrowser);

		for (i in task.shoppingList) {
			task.shoppingList[i].carted = false;
		}

		perf(browsers.indexOf(newBrowser), 'browser-created');

		gotoNextItem(browsers.indexOf(newBrowser));
	}
}

function handleBrowser(id) {
	var currentBrowser = remote.BrowserWindow.fromId(id);
	var currentBrowserIndex = browsers.indexOf(currentBrowser);

	var currentUrl = currentBrowser.webContents.getURL();
	var currentUrlSplit = currentUrl.split('/');
	
	// on item page
	if (currentUrl.includes('/shop/') && /^([a-zA-Z0-9]{9})$/.test(currentUrlSplit[currentUrlSplit.length - 1])) {
		// select size
		// add to cart
		// if items remain goto next item
		// else goto checkout

		var currentProduct = tasks[currentBrowserIndex].shoppingList.filter(x => x.carted == false)[0];

		console.log('at-product: ' + currentBrowserIndex + ':' + id);
		perf(currentBrowserIndex, 'at-product');

		ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'found product keyword &rarr; ' + currentProduct.keywords + ', ' + currentProduct.colour);

		currentBrowser.webContents.executeJavaScript(`
			ipcSend("productPageSource", [` + currentBrowserIndex + `, document.body.innerHTML]);
		`);

		ipcRenderer.on('productPageSource', (event, arg) => {
			console.log('received-product-source: ' + currentBrowserIndex + ':' + id);
			perf(currentBrowserIndex, 'received-product-source');

			currentProduct = tasks[arg[0]].shoppingList.filter(x => x.carted == false)[0];

			var $ = cheerio.load(arg[1]);

			var availableSizes = $('#size option, #s option').map((i, el) => {
				return $(el).text();
			}).get();

			console.log(availableSizes)

			if (availableSizes.indexOf(currentProduct.size) == -1 && currentProduct.size != 'One size') {
				ipcRenderer.send('status', tasks[arg[0]].name, currentProduct.keywords + ' &rarr; size ' + currentProduct.size + ' out of stock, skipping');
			}
			else {
				if (currentProduct.size == 'One size') {
					if ($('.sold-out').text() == '') {
						browsers[arg[0]].webContents.executeJavaScript('document.getElementsByName("commit")[0].click()');
						ipcRenderer.send('status', tasks[arg[0]].name, 'added to basket &rarr; ' + currentProduct.keywords + ', ' + currentProduct.size);
					}
					else {
						ipcRenderer.send('status', tasks[arg[0]].name, currentProduct.keywords + ' &rarr; out of stock, skipping');
					}
				}
				else {
					$('#size').children().each((i, el) => {
						if ($(el).text() == currentProduct.size) {
							browsers[arg[0]].webContents.executeJavaScript('document.getElementById("size").value=' + $(el).val());
							perf(currentBrowserIndex, 'selected-size');
							ipcRenderer.send('status', tasks[arg[0]].name, currentProduct.keywords + ' &rarr; selected size &rarr; ' + currentProduct.size);
						}
					});

					browsers[arg[0]].webContents.executeJavaScript('document.getElementsByName("commit")[0].click()');
					perf(currentBrowserIndex, 'added-to-cart');
					ipcRenderer.send('status', tasks[arg[0]].name, 'added to basket &rarr; ' + currentProduct.keywords + ', ' + currentProduct.size);
				}
			}

			currentProduct.carted = true;
			
			if (tasks[arg[0]].shoppingList.filter(x => x.carted == false).length > 0) {
				var nextItem = tasks[arg[0]].shoppingList.filter(x => x.carted == false)[0];

				gotoNextItem(arg[0]);
			}
			else {
				setTimeout(() => {
					ipcRenderer.send('status', tasks[arg[0]].name, 'going to checkout...');
					perf(currentBrowserIndex, 'going-to-checkout');
					browsers[arg[0]].webContents.executeJavaScript('document.getElementsByClassName("checkout")[0].click()');
				}, 250);
			}
		});
	}

	// on checkout page or confirmation page
	else if (currentUrl.indexOf('/checkout') != -1) {
		// autofill details
		// show the browser if not visible already
		// notify user of success or failure

		perf(currentBrowserIndex, 'at-checkout');

		currentBrowser.webContents.executeJavaScript(`
			ipcSend("checkoutPageSource", [` + currentBrowserIndex + `, document.body.innerHTML]);
		`);

		ipcRenderer.on('checkoutPageSource', (event, arg) => {
			var task = tasks[arg[0]];
			var _$ = cheerio.load(arg[1]);
			
			if (_$('.tab-payment').hasClass('selected') && !task.autofilled) {
				console.log('at-checkout: ' + arg[0] + ':' + id);

				ipcRenderer.send('status', tasks[arg[0]].name, 'at checkout, autofilling...');

				tasks[arg[0]].status = 'At checkout';
				var listEntry = $('.list-group-item').not('.list-head')[arg[0]];
				console.log(listEntry, $('.list-group-item').not('.list-head'), arg[0])
				$(listEntry).children('.status').text('At checkout');
				$(listEntry).children('.status').css('color', '#2ecc71');

				browsers[arg[0]].webContents.executeJavaScript(`
					// most labels are <label> elements
					$('label').each(function(i) {

						// shipping info

						if ($(this).text() == "full name" || $(this).text() == "name") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.name + `';
						}
						if ($(this).text() == "名前") {
							var a = $(this).attr('for');
							var b = document.getElementById(a).parentNode;
							b.childNodes[1].value = '` + task.shipping.name.split("\\s+")[0] + `';
							b.childNodes[2].value = '` + task.shipping.name.split("\\s+")[1] + `';
						}
						if ($(this).text() == "email" || $(this).text() == "Eメール") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.email + `';
						}
						if ($(this).text() == "tel" || $(this).text() == "電話番号") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.phone + `';
						}
						if ($(this).text() == "address" || $(this).text() == "住所") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.address + `';
						}
						if ($(this).text() == "address 2") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.address2 + `';
						}
						if ($(this).text() == "address 3") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.address3 + `';
						}
						if ($(this).text() == "city" || $(this).text() == "区市町村") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.city + `';
						}
						if ($(this).text() == "postcode" || $(this).text() == "zip" || $(this).text() == "郵便番号") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.zip + `';
						}
						if ($(this).text() == "country") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.country + `';
							// trigger a change event to update the page
							document.getElementById($(this).attr('for')).dispatchEvent(new Event('change'));
						}
						if ($(this).text() == "都道府県") {
							document.getElementById($(this).attr('for')).value = '` + task.shipping.prefecture + `';
						}

						// payment info

						if ($(this).text() == "type" || $(this).text() == "支払い方法") {
							document.getElementById($(this).attr('for')).value = '` + task.payment.type + `';
							document.getElementById($(this).attr('for')).dispatchEvent(new Event('change'));
						}
						if ($(this).text() == "number" || $(this).text() == "カード番号") {
							var a = $(this).attr('for');
							if (a != undefined) {
								document.getElementById(a).value = '` + task.payment.number + `';
							}
						}
						if ($(this).text() == "exp. date" || $(this).text() == "有効期限") {
							var a = $(this).attr('for');
							var b = document.getElementById(a).parentNode;
							b.childNodes[1].value = '` + task.payment.expirymonth + `';
							b.childNodes[2].value = '` + task.payment.expiryyear + `';
						}
						if ($(this).text() == "CVV" || $(this).text() == "CVV番号") {
							var a = $(this).attr('for');
							if (a != undefined) {
								document.getElementById(a).value = '` + task.payment.cvv + `';
							}
						}
					});

					// some labels are <div> elements
					$('div').each(function(i) {
						if ($(this).text() == "number" || $(this).text() == "カード番号") {
							var a = $(this).attr('for');
							if (a != undefined) {
								document.getElementById(a).value = '` + task.payment.number + `';
							}
						}
						if ($(this).text() == "CVV" || $(this).text() == "CVV番号") {
							var a = $(this).attr('for');
							if (a != undefined) {
								document.getElementById(a).value = '` + task.payment.cvv + `';
							}
						}
					});

					// tick the t&c box
					document.getElementsByName("order[terms]")[1].parentElement.className = "icheckbox_minimal checked";
					document.getElementsByName("order[terms]")[0].checked = true;
					document.getElementsByName("order[terms]")[1].checked = true;
				`);

				perf(currentBrowserIndex, 'autofilled');
				tasks[arg[0]].autofilled = true;
				tasks[arg[0]].complete = false;
				localStorage.setItem('tasks', JSON.stringify(tasks));

				if (task.autoCheckout) {
					setTimeout(() => {
						perf(currentBrowserIndex, 'clicked-checkout');
						browsers[arg[0]].webContents.executeJavaScript('$(".checkout").click();');
					}, task.autoCheckoutDelay * 1000);
				}

				ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'showing browser...');
				browsers[arg[0]].show();

				setInterval(() => {
					currentBrowser.webContents.executeJavaScript(`
						ipcSend("checkoutPageSource", [` + currentBrowserIndex + `, document.body.innerHTML]);
					`);
				}, 1000);
			}

			else if (_$('.tab-confirmation').hasClass('selected') && !task.complete) {
				console.log('at-confirmation: ' + arg[0] + ':' + id);

				ipcRenderer.send('status', tasks[arg[0]].name, 'at confirmation screen');
				perf(currentBrowserIndex, 'at-confirmation');

				tasks[arg[0]].autofilled = false;
				tasks[arg[0]].complete = true;
				localStorage.setItem('tasks', JSON.stringify(tasks));

				if (_$('.failed').length) {
					ipcRenderer.send('status', tasks[arg[0]].name, 'checkout failed');

					var listEntry = $('.list-group-item').not('.list-head')[arg[0]];
					$(listEntry).children('.status').text('Checkout failed');
					$(listEntry).children('.status').css('color', '#e74c3c');
				}
				else {
					ipcRenderer.send('status', tasks[arg[0]].name, 'checkout success');

					var listEntry = $('.list-group-item').not('.list-head')[arg[0]];
					$(listEntry).children('.status').text('Checkout success');
					$(listEntry).children('.status').css('color', '#2ecc71');
				}
			}
		});
	}

	// don't know where we are
	else {
		console.log('unknown-url: ' + currentBrowserIndex + ':' + id);
	}
}

function gotoNextItem(taskIndex) {
	var nextItem = tasks[taskIndex].shoppingList.filter(x => x.carted == false)[0];

	if (nextItem) {
		perf(taskIndex, 'searching-for-product');

		var proxy = tasks[taskIndex].proxy;

		if (proxy == '') {
			proxy = null;
		}

		searchForItem(nextItem, proxy, (item, err) => {
			if (typeof item !== 'undefined') {
				if (err) {
					ipcRenderer.send('status', tasks[taskIndex].name, 'error connecting to the Supreme store');

					$($('.list-group-item').not('.list-head')[i]).children('.status').text('Error');
					$($('.list-group-item').not('.list-head')[i]).children('.status').css('color', '#e74c3c');

					setTimeout(() => {
						browsers[taskIndex].destroy();
					}, 10000);
				}
				else {
					perf(taskIndex, 'found-product');

					browsers[taskIndex].loadURL('http://supremenewyork.com/' + item.href, {
						userAgent: ua
					});
				}
			}
			else {
				if (nextItem) {
					ipcRenderer.send('status', tasks[taskIndex].name, 'couldn\'t find item &rarr; ' + nextItem.keywords + ', ' + nextItem.colour);
					nextItem.carted = true;
					gotoNextItem(taskIndex);
				}
				else {
					ipcRenderer.send('status', tasks[arg[0]].name, 'going to checkout...');
					browsers[taskIndex].loadURL('https://supremenewyork.com/checkout');
				}
			}
		});
	}
}

var headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
	'Cache-Control': 'max-age=0',
	'Connection': 'keep-alive',
	'Host': 'www.supremenewyork.com',
	'User-Agent': ua
}

function searchForItem(searchItem, proxy, cb) {
	if (proxy) {
		proxy = 'http://' + proxy;
	}

	request('http://supremenewyork.com/shop/all/' + searchItem.category, { headers: headers, timeout: 3000, proxy: proxy }, (err, res, body) => {
		if (err) {
			console.log(err);
			return cb(null, err);
		}
		else {
			var items = [];
			var $ = cheerio.load(body);

			$('article').each((i, el) => {
				var item = {};

				$(el).contents().contents().each((j, el2) => {
					if (el2.name == 'h1') {
						item.name = $(el2).children().text();
						item.href = $(el2).children().attr('href');
					}
					else if (el2.name == 'p') {
						item.colour = $(el2).children().text();
					}
				});
				items.push(item);
			});

			var keywordOptions = {
				shouldSort: true,
				tokenize: true,
				threshold: 0.6,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					"name"
				]
			};

			var fuse = new Fuse(items, keywordOptions);
			var itemRes = fuse.search(searchItem.keywords);

			var colourOptions = {
				shouldSort: true,
				tokenize: true,
				threshold: 0.6,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					"colour"
				]
			};

			fuse = new Fuse(itemRes, colourOptions);
			var res = fuse.search(searchItem.colour);

			return cb(res[0], null);
		}
	});
}