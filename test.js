'use strict';
var fs = require('fs');
var test = require('ava');
var parseColumns = require('./');
var fixture = fs.readFileSync('fixtures/ps.out', 'utf8');
var fixture2 = fs.readFileSync('fixtures/ps-2.out', 'utf8');
var fixture3 = fs.readFileSync('fixtures/lsof.out', 'utf8');
var fixture4 = fs.readFileSync('fixtures/ps-3.out', 'utf8');

test('parse', function (t) {
	var f = parseColumns(fixture);
	t.assert(f[0].PID === '238');
	t.end();
});

test('headers option', function (t) {
	var f = parseColumns(fixture, {
		headers: ['pid', 'name', 'cmd']
	});
	t.assert(f[0].pid === '238');
	t.assert(f[0].name);
	t.assert(f[0].cmd);
	t.end();
});

test('transform option', function (t) {
	var f = parseColumns(fixture, {
		transform: function (el, header, rowIndex, columnIndex) {
			t.assert(typeof rowIndex === 'number');
			t.assert(typeof columnIndex === 'number');
			return header === 'PID' ? Number(el) : el;
		}
	});
	t.assert(f[0].PID === 238);
	t.end();
});

test('separator option', function (t) {
	var f = parseColumns(fixture2, {
		separator: '|'
	});
	t.assert(f[0].PID === '238');
	t.end();
});

test('differing line lengths', function (t) {
	var f = parseColumns(fixture3);
	var cols = 'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME'.split(' ');

	t.assert(f.every(function (row) {
		return Object.keys(row).length === cols.length && cols.every(function (key) {
			return row.hasOwnProperty(key);
		});
	}));

	t.end();
});

test('separators in values', function (t) {
	var f = parseColumns(fixture4);

	t.same(f, [
		{
			PID: '5971',
			CMD: 'emacs -nw',
			STARTED: 'Oct 29'
		},
		{
			PID: '22678',
			CMD: 'emacs -nw foo.js',
			STARTED: '13:10:36'
		},
		{
			PID: '28752',
			CMD: 'emacs -nw .',
			STARTED: 'Oct 28'
		},
		{
			PID: '31236',
			CMD: 'emacs -nw fixtures/ps-3.out',
			STARTED: '17:10:10'
		},
		{
			PID: '32513',
			CMD: 'emacs -nw README.md',
			STARTED: 'Oct 28'
		}
	]);

	t.end();
});

test('benchmark', function (t) {
	var total = 0;
	var count = 30;

	for (var i = 0; i < count; i++) {
		var start = Date.now();
		parseColumns(fixture3);
		total += Date.now() - start;
	}

	console.log(count + ' iterations: ' + (total / (1000 * count)) + 's');

	t.end();
});
