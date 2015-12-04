'use strict';

var conf = [];
var checkedList = {};
var $pageContent = $('.page-content');
var prefix = 'rth-';

function getRandomId() {
	return crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

function save() {
	localStorage.setItem(prefix + 'checked', JSON.stringify(checkedList));
}

function getExpirationDate(tableId, lineIndex) {
	let table = conf.filter(table => table.id === tableId)[0];
	let lineOptions = table.lines[lineIndex];
	if (lineOptions.date) {
		let diff = Date.now() - lineOptions.date;
		let timeToNext = lineOptions.freq * 1000 - diff % (lineOptions.freq * 1000);
		return Date.now() + timeToNext;
	}
	if (lineOptions.freq) {
		return Date.now() + lineOptions.freq * 1000;
	}
	return Infinity;
}

function checkCallback(event) {
	let $td = $(event.target).closest('td');
	let id = $td.prop('id');
	if (event.target.checked) {
		let expirationDate = getExpirationDate.apply(null, id.split('|'));
		checkedList[id] = expirationDate;
	} else {
		delete checkedList[id];
	}
	save();
}

function loadConf() {
	conf = JSON.parse(localStorage.getItem(prefix + 'tables') || '[]');
	checkedList = JSON.parse(localStorage.getItem(prefix + 'checked') || '{}');
}

function uncheck() {
	let next = { date: Infinity };
	for (let id in checkedList) {
		let expirationDate = checkedList[id];
		if (expirationDate < Date.now()) {
			let checkbox = document.getElementById(id);
			$(checkbox).find('input[type=checkbox]').click();
		} else if (expirationDate < next.date) {
			next = {
				id,
				date: expirationDate
			};
		}
	}

	// we round the time to the next second to avoid potentialy doing multiple call in one second
	let nextCheck = next.date === Infinity ? 5 * 60 * 1000 : Math.ceil((next.date - Date.now()) / 1000) * 1000;
	setTimeout(uncheck, nextCheck);
}

function renderLine($table, index, line, tableConf) {
	let $line = $('<tr><td class="mdl-data-table__cell--non-numeric"></td></tr>');
	$line.find('>td').text(line.name);
	let html = '<td class="mdl-data-table__cell--non-numeric"><label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect"><input type="checkbox" class="mdl-checkbox__input"></label></td>';
	for (let i = 0; i < tableConf.columns.length; ++i) {
		let $html = $(html);
		let id = tableConf.id + '|' + index + '|' + i;
		$html.prop('id', id);
		if (checkedList[id]) {
			$html.find('input').prop('checked', true);
		}
		$html.appendTo($line);
	}
	$line.appendTo($table);
}
function renderColumn($table, name) {
	let $head = $table.find('thead > tr');
	let $column = $('<th class="mdl-data-table__cell--non-numeric"></th>');
	$column.text(name);
	$column.appendTo($head);
}
function render() {
	$pageContent.empty();
	conf.forEach(tableConf => {
		let $table = $('<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp"><thead><tr><th class="mdl-data-table__cell--non-numeric"></th></tr></thead><tbody></tbody></table>');
		$table.data('id', tableConf.id);

		if (tableConf.columns && tableConf.lines) {
			tableConf.columns.forEach(name => renderColumn($table, name));
			tableConf.lines.forEach((line, index) => renderLine($table, index, line, tableConf));
		}

		$table.appendTo($pageContent);
	});
}

function addTable(options) {
	conf.push({
		id: getRandomId(),
		columns: options.columns,
		lines: options.lines
	});
	localStorage.setItem(prefix + 'tables', JSON.stringify(conf));
}

$(document).on('change', 'table input[type=checkbox]', checkCallback);
loadConf();
render();
uncheck();

// addTable({ columns: ['col1', 'col2', 'col3'], lines: ['l1', 'l2'] });
