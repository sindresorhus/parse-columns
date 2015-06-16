'use strict';
var fs = require('fs');
var test = require('ava');
var parseColumns = require('./');
var fixture = fs.readFileSync('fixture', 'utf8');
var fixture2 = fs.readFileSync('fixture2', 'utf8');

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
