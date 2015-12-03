'use strict';

var conf = [];
var checkedList = {};
var $pageContent = $('.page-content');
var prefix = 'rth-';

function getRandomId() {
	return crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

function save() {
	let checkedData = {};
	$('table').toArray().forEach(table => {
		$(table).find('tbody > tr').toArray().forEach((line, lineIndex) => {
			$(line).find('td input[type=checkbox]').toArray().forEach((checkbox, columnIndex) => {
				if (checkbox.checked) {
					checkedData[$(table).data('id') + '|' + lineIndex + '|' + columnIndex] = true;
				}
			});
		});
	});
	localStorage.setItem(prefix + 'checked', JSON.stringify(checkedData));
}

function loadConf() {
	conf = JSON.parse(localStorage.getItem(prefix + 'tables') || '[]');
	checkedList = JSON.parse(localStorage.getItem(prefix + 'checked') || '{}');
}

function renderLine($table, index, name, tableConf) {
	let $line = $('<tr><td class="mdl-data-table__cell--non-numeric"></td></tr>');
	$line.find('>td').text(name);
	let html = '<td class="mdl-data-table__cell--non-numeric"><label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect"><input type="checkbox" class="mdl-checkbox__input"></label></td>';
	for (let i = 0; i < tableConf.columns.length; ++i) {
		let $html = $(html);
		if (checkedList[tableConf.id + '|' + index + '|' + i]) {
			$html.find('input').prop('checked', true);
		}
		$html.appendTo($line);
	}
	$line.appendTo($table);
}
function renderColumn($table, index, name, tableConf) {
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
			tableConf.columns.forEach((name, index) => renderColumn($table, index, name, tableConf));
			tableConf.lines.forEach((name, index) => renderLine($table, index, name, tableConf));
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

$(document).on('change', 'table input[type=checkbox]', save);
loadConf();
render();

// addTable({ columns: ['col1', 'col2', 'col3'], lines: ['l1', 'l2'] });
