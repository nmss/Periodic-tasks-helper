'use strict';

function save() {
	let data = {};
	$('input[type=checkbox]').toArray().forEach(checkbox => {
		if (checkbox.checked) {
			data[checkbox.getAttribute('id')] = checkbox.checked;
		}
	});
	console.log(data);
	localStorage.setItem('checked', JSON.stringify(data));
}

function load() {
	let data = JSON.parse(localStorage.getItem('checked') || '{}');
	for (let checkboxID in data) {
		document.getElementById(checkboxID).checked = data[checkboxID];
	}
}

function init() {
	$('table').toArray().forEach(table => {
		let tableId = table.getAttribute('id');
		let $table = $(table);
		let columns = $table.find('thead th').toArray().slice(1);
		let characters = columns.map(col => col.textContent);
		$table.find('tbody tr').toArray().forEach(line => {
			let $line = $(line);
			let lineName = $line.find('td')[0].textContent;
			let checkboxes = $line.find('td input[type=checkbox]').toArray();
			checkboxes.forEach((checkbox, index) => {
				let id = tableId + '|' + lineName + '|' + characters[index];
				checkbox.setAttribute('id', id);

			})
		});
	});
}

function addTable(id) {
	let $table = $('<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp"><thead><tr><th class="mdl-data-table__cell--non-numeric"></th></tr></thead><tbody></tbody></table>');
	$table.attr('id', id);
	$table.appendTo(document.body);
}
function addLines(tableId, names) {
	names.forEach(name => addLine(tableId, name));
}
function addLine(tableId, name) {
	let $table = $('#' + tableId);
	let columns = $table.find('thead th').toArray().slice(1);

	let $line = $('<tr><td class="mdl-data-table__cell--non-numeric"></td></tr>');
	$line.find('>').text(name);
	let html = '<td class="mdl-data-table__cell--non-numeric"><label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect"><input type="checkbox" class="mdl-checkbox__input"></label></td>';
	columns.forEach(() => $(html).appendTo($line))
	$line.appendTo($table);
}
function addColumns(tableId, names) {
	names.forEach(name => addColumn(tableId, name));
}
function addColumn(tableId, name) {
	let $table = $('#' + tableId);

	let $head = $table.find('thead > tr');
	let $column = $('<th class="mdl-data-table__cell--non-numeric"></th>');
	$column.text(name);
	$column.appendTo($head);

	let html = '<td class="mdl-data-table__cell--non-numeric"><label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect"><input type="checkbox" class="mdl-checkbox__input"></label></td>';
	$table.find('tbody > tr').toArray().forEach(line => {
		$(html).appendTo(line);
	});
}

// addXXXX ....

init();
$('input[type=checkbox]').change(event => save());
load();
