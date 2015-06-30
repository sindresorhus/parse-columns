'use strict';
var execall = require('execall');
var splitAt = require('split-at');
var escapeStringRegexp = require('escape-string-regexp');
var repeating = require('repeating');

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
	var headerLength = (lines[0] || '').length;

	lines.forEach(function (line) {
		// ensure lines are as long as the header
		var padAmount = Math.ceil(Math.max(headerLength - line.length, 0) / separator.length);
		line += repeating(separator, padAmount);

		execall(reSeparator, line).forEach(function (el) {
			var i = el.index;
			stats[i] = typeof stats[i] === 'number' ? stats[i] + 1 : 1;
		});
	});

	var consecutive = false;
	var splits = stats.reduce(function (splits, occurrenceCount, pos) {
		if (occurrenceCount !== lines.length) consecutive = false;
		else {
			if (pos !== 0 && !consecutive) splits.push(pos);
			consecutive = true;
		}
		return splits;
	}, []);

	var headers = opts.headers;
	return lines.reduce(function (rows, line, lineNumber) {
		// split columns
		var cells = splitAt(line, splits, {remove: true}).map(function (el) {
			return el.trim();
		});

		if (lineNumber === 0) headers = headers || cells;
		else {
			rows.push(headers.reduce(function (ret, header, colIndex) {
				var el = cells[colIndex] || '';
				ret[header] = opts.transform ? opts.transform(el, header, colIndex, lineNumber) : el;
				return ret;
			}, {}));
		}

		return rows;
	}, []);
};
