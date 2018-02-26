const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
var moment = require('moment');
var cheerio = require('cheerio');
var Fuse = require('fuse.js');
var request = require('request');
var path = require('path');

var tasks = JSON.parse(localStorage.getItem('tasks'));
tasks = tasks == null ? [] : tasks;

var ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36';

var timeNow = moment();
$('#time').text(timeNow.format('HH:mm:ss'));

var verPrefix = 'ALPHA ';
var ver = remote.app.getVersion();
$('.badge-ver').text(verPrefix + ver);

$('#user-email').text(JSON.parse(localStorage.getItem('loggedInUser')).email);

var browsers = [];

setInterval(function() {
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

$(function () {
	$('[data-toggle="tooltip"]').tooltip();
});

if (tasks.length > 0) {
	$('.list-group-item').not('.list-head').remove();
	for (i in tasks) {
		var last4 =  tasks[i].payment.number.substr(tasks[i].payment.number.length - 4);
		$('#tasks').append($('<li class="list-group-item data-id="' + tasks[i].id + '""> \
								<div class="col-icon"><i class="material-icons task-select">check_box_outline_blank</i></div> \
								<div class="col no-overflow">' + tasks[i].name + '</div> \
								<div class="col no-overflow">' + tasks[i].shipping.address + '</div> \
								<div class="col no-overflow">' + tasks[i].payment.type + ': ' + last4 + '</div> \
								<div class="col no-overflow status">' + tasks[i].status + '</div> \
							</li>'));
	}
}

$(document).on('click', '.task-select', function() {
	if ($(this).text() == 'check_box') {
		$(this).text('check_box_outline_blank');
		$(this).parents('.list-group-item').css('height', '');
	}
	else {
		$(this).text('check_box');
		$(this).parents('.list-group-item').css('height', '150px');
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
	if (shiftClick) {
		$('.list-group-item').not('.list-head').each(function(i) {
			$(this).children('.col-icon').children('i').text('check_box');
		});
	}

	var selected = 0;

	$('.list-group-item').not('.list-head').each(function(i) {
		if ($(this).children('.col-icon').children('i').text() == 'check_box') {
			selected++;

			if (tasks[i].startTime == 'now') {
				tasks[i].status = 'Running';
				localStorage.setItem('tasks', JSON.stringify(tasks));
				$($('.list-group-item:not(.list-head)')[i]).children('.status').text('Running');
				$($('.list-group-item:not(.list-head)')[i]).children('.status').css('color', '#2ecc71');

				for (j in tasks[i].shoppingList) {
					tasks[i].shoppingList[j].carted = false;
				}

				createBrowser(tasks[i]);
			}

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
			}
		}
	});

	if (selected == 0) {
		common.snackbar('<i class="material-icons">error_outline</i>&nbsp; No tasks selected.');
	}

	localStorage.setItem('tasks', JSON.stringify(tasks));
});

var shiftClick = false;

$('body').on('keydown', function(e) {
	if (e.key == 'Shift') {
		shiftClick = true;
	}
});

$('body').on('keyup', function(e) {
	if (e.key == 'Shift') {
		shiftClick = false;
	}
});

function createBrowser(task) {
	var newBrowser = new remote.BrowserWindow({
		width: 1000,
		height: 750,
		show: false,
		webPreferences: {
			nodeIntegration: false,
			preload: path.resolve('./views/js/preload/ipc.js'),
			paritition: browsers.length - 1
		}
	});

	searchForItem(task.shoppingList[0], (item) => {
		if (item) {
			newBrowser.loadURL('http://supremenewyork.com/' + item.href, {
				userAgent: ua
			});
		}
		else {
			ipcRenderer.send('status', task.name, 'couldn\'t find item &rarr; ' + task.shoppingList[0].keywords);
		}
	});

	newBrowser.webContents.on('dom-ready', () => {
		handleBrowser(newBrowser.id);
	});

	browsers.push(newBrowser);
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

		ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'found product keyword &rarr; ' + currentProduct.keywords);

		currentBrowser.webContents.executeJavaScript(`
			ipcSend("productPageSource", [` + currentBrowserIndex + `, document.body.innerHTML]);
		`);

		ipcRenderer.on('productPageSource', (event, arg) => {
			var $ = cheerio.load(arg[1]);

			var availableSizes = $('#size option').map((i, el) => {
				return $(el).text();
			}).get();

			if (availableSizes.indexOf(tasks[arg[0]].shoppingList.filter(x => x.carted == false)[0].size) == -1) {
				ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'couldn\'t find size &rarr; ' + currentProduct.size);
			}

			$('#size').children().each((i, el) => {
				if ($(el).text() == tasks[arg[0]].shoppingList.filter(x => x.carted == false)[0].size) {
					currentBrowser.webContents.executeJavaScript('document.getElementById("size").value=' + $(el).val());
					ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'selected size &rarr; ' + currentProduct.size);
				}
			});

			currentBrowser.webContents.executeJavaScript('document.getElementsByName("commit")[0].click()');
			ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'added to basket &rarr; ' + currentProduct.keywords);

			tasks[arg[0]].shoppingList.filter(x => x.carted == false)[0].carted = true;
			
			if (tasks[arg[0]].shoppingList.filter(x => x.carted == false).length > 0) {
				searchForItem(tasks[arg[0]].shoppingList.filter(x => x.carted == false)[0], (item) => {
					if (item) {
						currentBrowser.loadURL('http://supremenewyork.com/' + item.href, {
							userAgent: ua
						});
					}
					else {
						// item not found
						ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'could not find next item');
					}
				});
			}
			else {
				setTimeout(() => {
					ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'going to checkout...');
					currentBrowser.webContents.executeJavaScript('document.getElementsByClassName("checkout")[0].click()');
				}, 250);
			}
		});
	}

	// on checkout page or confirmation page
	else if (currentUrl.indexOf('/checkout') != -1) {
		// autofill details
		// show the browser if not visible already

		console.log('at-checkout: ' + currentBrowserIndex + ':' + id);

		ipcRenderer.send('status', tasks[currentBrowserIndex].name, 'at checkout, showing browser...');

		currentBrowser.show();
	}

	// don't know where we are
	else {
		console.log('unknown-url: ' + currentBrowserIndex + ':' + id);
	}
}

function terminateBrowser(id) {
	// kill browser and end task
}

function searchForItem(searchItem, cb) {
	request('http://supremenewyork.com/shop/all/' + searchItem.category, { headers: { 'User-Agent': ua } }, (err, res, body) => {
		if (err) {
			console.log(err);
			return false;
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

			var fuseOptions = {
				shouldSort: true,
				tokenize: true,
				threshold: 0.4,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: [
					"name",
					"colour"
				]
			};

			var fuse = new Fuse(items, fuseOptions);
			var itemRes = fuse.search(searchItem.keywords);

			fuse = new Fuse(itemRes, fuseOptions);
			var res = fuse.search(searchItem.colour);

			return cb(res[0]);
		}
	});
}