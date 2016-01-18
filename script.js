'use strict';

var conf = [];
var checkedList = {};
var $pageContent = $('.page-content');
var prefix = 'rth-';
var checkedButtonStyle = 'mdl-button--primary';

function getRandomId() {
	return crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

function saveState() {
	localStorage.setItem(prefix + 'checked', JSON.stringify(checkedList, (key, value) => value === Infinity ? '∞' : value));
}

function saveConf() {
	localStorage.setItem(prefix + 'tables', JSON.stringify(conf));
}

function getExpirationDate(tableId, lineIndex) {
	let table = conf.filter(table => table.id === tableId)[0];
	let lineOptions = table.lines[lineIndex];
	if (lineOptions.date) {
		let diff = lineOptions.date ? Date.now() - lineOptions.date : 0;
		let timeToNext = lineOptions.freq * 1000 - diff % (lineOptions.freq * 1000);
		return Date.now() + timeToNext;
	}
	if (lineOptions.freq) {
		return Date.now() + lineOptions.freq * 1000;
	}
	return Infinity;
}

function checkCallback(event) {
	let $button = $(event.currentTarget);
	let $td = $button.closest('td');
	let id = $td.prop('id');
	if (checkedList[id]) {
		delete checkedList[id];
		$button.removeClass(checkedButtonStyle);
	} else {
		let expirationDate = getExpirationDate.apply(null, id.split('|'));
		checkedList[id] = expirationDate;
		$button.addClass(checkedButtonStyle);
	}
	saveState();
}

function load() {
	conf = JSON.parse(localStorage.getItem(prefix + 'tables') || '[]');
	checkedList = JSON.parse(localStorage.getItem(prefix + 'checked') || '{}', (key, value) => value === '∞' ? Infinity : value);
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
	let $line = $(`<tr><td class="mdl-data-table__cell--non-numeric"><label>${line.name}</label></td></tr>`);
	let html = `<td class="mdl-data-table__cell--non-numeric">
		<button class="mdl-button mdl-js-button mdl-js-ripple-effect"></button>
	</td>`;
	for (let i = 0; i < tableConf.columns.length; ++i) {
		let $html = $(html);
		let id = tableConf.id + '|' + index + '|' + i;
		$html.prop('id', id);
		var $button = $html.find('button');
		$button.text(tableConf.columns[i]);
		if (checkedList[id]) {
			$button.addClass(checkedButtonStyle);
		}
		$html.appendTo($line);
	}
	$line.appendTo($table);
}
function render() {
	$pageContent.find('table').remove();

	conf.forEach(tableConf => {
		let additionalHeadCells = tableConf.columns.map(columnName => `<th>${columnName}</th>`);
		let $table = $(`<table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
			<thead><tr>
				<th class="mdl-data-table__cell--non-numeric">
					<button id="menu-${tableConf.id}" class="mdl-button mdl-js-button mdl-button--icon">
						<i class="material-icons">more_vert</i>
					</button>
					<ul class="mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect" for="menu-${tableConf.id}">
						<li class="mdl-menu__item addLine">Ajouter une ligne</li>
						<li class="mdl-menu__item addColumn">Ajouter une colonne</li>
						<li class="mdl-menu__item deleteTable">Supprimer le tableau</li>
					</ul>
				</th>
				${additionalHeadCells.join('') }
			</tr></thead>
			<tbody></tbody>
		</table>`);
		$table.data('id', tableConf.id);

		if (tableConf.columns && tableConf.lines) {
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
	saveConf();
	render();
}

function init() {
	$(document).on('click', 'table td > button', checkCallback);
	load();
	render();
	uncheck();
}

init();
