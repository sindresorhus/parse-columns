'use strict';
const execall = require('execall');
const splitAt = require('split-at');
const escapeStringRegexp = require('escape-string-regexp');

/*
Algorithm:
Find separators that are on the same index on each line, remove consecutive ones, then split on those indexes. It's important to check each line as you don't want to split in the middle of a column row just because it contains the separator.
*/

const countSeparators = (lines, separator = ' ') => {
	const counts = [];
	const reSeparator = new RegExp(escapeStringRegexp(separator), 'g');
	const headerLength = (lines[0] || '').length;

	for (let line of lines) {
		// Ensure lines are as long as the header
		const padAmount = Math.ceil(Math.max(headerLength - line.length, 0) / separator.length);
		line += separator.repeat(padAmount);

		for (const {index: column} of execall(reSeparator, line)) {
			counts[column] = typeof counts[column] === 'number' ? counts[column] + 1 : 1;
		}
	}

	return counts;
};

const getSplits = (lines, separator) => {
	const counts = countSeparators(lines, separator);
	const splits = [];
	let consecutive = false;

	for (const [index, count] of counts.entries()) {
		if (count !== lines.length) { // eslint-disable-line no-negated-condition
			consecutive = false;
		} else {
			if (index !== 0 && !consecutive) {
				splits.push(index);
			}

			consecutive = true;
		}
	}

	return splits;
};

module.exports = (input, options = {}) => {
	const lines = input.replace(/^\s*\n|\s+$/g, '').split('\n');
	let splits = getSplits(lines, options.separator);
	const {transform} = options;
	const rows = [];
	let items;

	let {headers} = options;
	if (!headers) {
		headers = [];
		items = splitAt(lines[0], splits, {remove: true});

		for (let [index, item] of items.entries()) {
			item = item.trim();
			if (item) {
				headers.push(item);
			} else {
				splits[index - 1] = null;
			}
		}

		splits = splits.filter(Boolean);
	}

	for (const [index, line] of lines.slice(1).entries()) {
		items = splitAt(line, splits, {remove: true});

		const row = {};
		for (const [index2, header] of headers.entries()) {
			const item = (items[index2] || '').trim();
			row[header] = transform ? transform(item, header, index2, index) : item;
		}

		rows.push(row);
	}

	return rows;
};
