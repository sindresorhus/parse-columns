'use strict';
var execall = require('execall');
var splitAt = require('split-at');
var escapeStringRegexp = require('escape-string-regexp');

/*
Algorithm:
Find separators that are on the same index on each line, remove consecutive ones, then split on those indexes. It's important to check each line as you don't want to split in the middle of a column row just because it contains the separator.
*/

module.exports = function (str, opts) {
	opts = opts || {};

	var lines = str.replace(/^\s*\n|\s+$/g, '').split('\n');
	var stats = [];
	var separator = opts.separator || ' ';
	var reSeparator = new RegExp(escapeStringRegexp(separator), 'g');

	lines.forEach(function (el) {
		execall(reSeparator, el).forEach(function (el) {
			var i = el.index;
			stats[i] = typeof stats[i] === 'number' ? stats[i] + 1 : 1;
		});
	});

	var splits = [];

	for (var i = 0; i < stats.length; i++) {
		// found the separator on the same index on all lines
		if (stats[i] === lines.length) {
			splits.push(i);
		}
	}

	// remove #0 and consecutive splits
	splits = splits.filter(function (el, i, arr) {
		return el !== 0 && el - 1 !== arr[i - 1];
	});

	// split columns
	lines = lines.map(function (line) {
		return splitAt(line, splits, {remove: true}).map(function (el) {
			return el.trim();
		});
	});

	var headers = lines.shift();

	if (opts.headers) {
		headers = opts.headers;
	}

	var ret = lines.map(function (line, lineIndex) {
		var ret = {};

		line.forEach(function (el, elIndex) {
			var header = headers[elIndex];
			ret[header] = opts.transform ? opts.transform(el, header, elIndex, lineIndex) : el;
		});

		return ret;
	});

	return ret;
};
