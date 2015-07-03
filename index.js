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
	var separator = opts.separator || ' ';
	var reSeparator = new RegExp(escapeStringRegexp(separator), 'g');
	var headerLength = (lines[0] || '').length;

	var counts = [];
	for (var i = 0, line; i < lines.length; i++) {
		var line = lines[i];
		// ensure lines are as long as the header
		var padAmount = Math.ceil(Math.max(headerLength - line.length, 0) / separator.length);
		line += repeating(separator, padAmount);

		var matches = execall(reSeparator, line);
		for (var j = 0, match; j < matches.length; j++) {
			var col = matches[j].index;
			counts[col] = typeof counts[col] === 'number' ? counts[col] + 1 : 1;
		}
	}

	var splits = [];
	var consecutive = false;
	for (var col = 0, count; col < counts.length; col++) {
		var count = counts[col];
		if (count !== lines.length) consecutive = false;
		else {
			if (col !== 0 && !consecutive) splits.push(col);
			consecutive = true;
		}
	}

	var rows = [];
	var headers = opts.headers;
	for (var i = 0, line; i < lines.length; i++) {
		var els = splitAt(lines[i], splits, {remove: true});
		if (i !== 0) {
			var row = {};
			for (var j = 0, el, header; j < headers.length; j++) {
				el = (els[j] || '').trim();
				header = headers[j];
				row[header] = opts.transform ? opts.transform(el, header, j, i) : el;
			}
			rows.push(row);
		} else if (!headers) {
			headers = [];
			for (var j = 0; j < els.length; j++) headers.push(els[j].trim());
		}
	}
	return rows;
};
