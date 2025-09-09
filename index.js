import execall from 'execall';
import splitAt from 'split-at';
import escapeStringRegexp from 'escape-string-regexp';

/*
Algorithm:
Find separators that are on the same index on each line, remove consecutive ones, then split on those indexes. It's important to check each line as you don't want to split in the middle of a column row just because it contains the separator.
*/

const countSeparators = (lines, separator = ' ') => {
	const counts = [];
	let separatorRegex;
	let canPad = true;

	// Handle different separator types
	if (separator instanceof RegExp) {
		// Check for problematic zero-width patterns
		if (separator.test('') || separator.exec('test')?.shift()?.length === 0) {
			throw new TypeError('Zero-width regex patterns are not supported');
		}

		separatorRegex = separator.global ? separator : new RegExp(separator.source, separator.flags + 'g');
		canPad = false;
	} else {
		// String separator (current behavior)
		separatorRegex = new RegExp(escapeStringRegexp(separator), 'g');
	}

	const headerLength = (lines[0] || '').length;

	for (let line of lines) {
		// Only pad for string separators to maintain exact compatibility
		if (canPad) {
			const padAmount = Math.ceil(Math.max(headerLength - line.length, 0) / separator.length);
			line += separator.repeat(padAmount);
		}

		for (const match of execall(separatorRegex, line)) {
			// Skip zero-width matches to prevent issues
			if (match.match.length === 0) {
				continue;
			}

			const start = match.index;
			const end = start + match.match.length - 1;

			// Mark all positions in the match range
			for (let position = start; position <= end; position++) {
				counts[position] = (counts[position] || 0) + 1;
			}
		}
	}

	return counts;
};

const getSplits = (lines, separator) => {
	const counts = countSeparators(lines, separator);
	const splits = [];
	let consecutive = false;

	for (const [index, count] of counts.entries()) {
		if (count === lines.length) {
			if (index !== 0 && !consecutive) {
				splits.push(index);
			}

			consecutive = true;
		} else {
			consecutive = false;
		}
	}

	return splits;
};

export default function parseColumns(input, options = {}) {
	const lines = input.replaceAll(/^\s*\n|\s+$/g, '').split('\n');
	let splits = getSplits(lines, options.separator);
	const {transform} = options;
	const rows = [];
	let items;

	let {headers} = options;

	// Process the first line to clean up splits (remove empty columns)
	// This needs to happen whether headers are provided or not
	items = splitAt(lines[0], splits, {remove: true});

	for (const [index, item] of items.entries()) {
		if (item.trim() === '') {
			splits[index - 1] = null;
		}
	}

	splits = splits.filter(Boolean);

	// If headers weren't provided, extract them from the first line
	if (!headers) {
		headers = [];
		// Re-split with cleaned splits to get proper header values
		items = splitAt(lines[0], splits, {remove: true});

		for (let item of items) {
			item = item.trim();
			if (item) {
				headers.push(item);
			}
		}
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
}
