'use strict';
var execall = require('execall');
var splitAt = require('split-at');
var escapeStringRegexp = require('escape-string-regexp');
var repeating = require('repeating');

/*
Algorithm:
Find separators that are on the same index on each line, remove consecutive ones, then split on those indexes. It's important to check each line as you don't want to split in the middle of a column row just because it contains the separator.
*/

function Table (lines, opts) {
	this.lines = lines;
	this.opts = opts || {};
}
Table.prototype.countSeps = function () {
	var counts = [];
	var separator = this.opts.separator || ' ';
	var reSeparator = new RegExp(escapeStringRegexp(separator), 'g');
	var headerLength = (this.lines[0] || '').length;
	for (var i = 0, line; i < this.lines.length; i++) {
		line = this.lines[i];
		// ensure lines are as long as the header
		var padAmount = Math.ceil(Math.max(headerLength - line.length, 0) / separator.length);
		line += repeating(separator, padAmount);

		var matches = execall(reSeparator, line);
		for (var j = 0, col; j < matches.length; j++) {
			col = matches[j].index;
			counts[col] = typeof counts[col] === 'number' ? counts[col] + 1 : 1;
		}
	}

	return counts;
};
Table.prototype.getSplits = function () {
	var counts = this.countSeps();

	var splits = [];
	var consecutive = false;
	for (var col = 0, count; col < counts.length; col++) {
		count = counts[col];
		if (count !== this.lines.length) {
			consecutive = false;
		} else {
			if (col !== 0 && !consecutive) splits.push(col);
			consecutive = true;
		}
	}

	return splits;
};
Table.prototype.parseColumns = function () {
	var splits = this.getSplits();

	var rows = [];
	var headers = this.opts.headers;
	var transform = this.opts.transform;
	for (var i = 0, els; i < this.lines.length; i++) {
		els = splitAt(this.lines[i], splits, {remove: true});
		if (i !== 0) {
			var row = {};
			for (var j = 0, el, header; j < headers.length; j++) {
				el = (els[j] || '').trim();
				header = headers[j];
				row[header] = transform ? transform(el, header, j, i) : el;
			}
			rows.push(row);
		} else if (!headers) {
			headers = [];
			for (var j = 0; j < els.length; j++) headers.push(els[j].trim());
		}
	}

	return rows;
};

module.exports = function parseColumns (str, opts) {
	var lines = str.replace(/^\s*\n|\s+$/g, '').split('\n');
	return new Table(lines, opts).parseColumns();
};
module.exports.Table = Table;
