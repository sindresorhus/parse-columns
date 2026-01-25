export type Options<Value = string> = {
	/**
	Separator to split columns on.

	@default ' '

	@example
	```
	// String separator (default behavior)
	parseColumns(data, {separator: ' '});

	// Regex separator for flexible matching
	parseColumns(data, {separator: /\s+/});

	// Multiple separators using regex alternation
	parseColumns(data, {separator: /[ \t]/});
	```
	*/
	readonly separator?: string | RegExp;

	/**
	Headers to use instead of the existing ones.
	*/
	readonly headers?: readonly string[];

	/**
	Transform elements.

	Useful for being able to cleanup or change the type of elements.
	*/
	readonly transform?: (
		element: string,
		header: string,
		columnIndex: number,
		rowIndex: number
	) => Value;
};

/**
Parse text columns, like the output of Unix commands.

Fixed-width parsing needs every row to line up with the header's column boundaries. A cell that is wider than its column cannot be detected, because it looks the same as two merged columns. The columns then merge and the resulting keys are wrong. Pass `headers` to spot it, or pad the output at the source.

@param textColumns - Text columns to parse.

@example
```
import {promisify} from 'node:util';
import childProcess from 'node:child_process';
import parseColumns from 'parse-columns';

const execFileP = promisify(childProcess.execFile);

const {stdout} = await execFileP('df', ['-kP']);

console.log(parseColumns(stdout, {
	transform: (item, header, columnIndex) => {
		// Coerce elements in column index 1 to 3 to a number
		if (columnIndex >= 1 && columnIndex <= 3) {
			return Number(item);
		}

		return item;
	}
}));
// [
// 	{
// 		Filesystem: '/dev/disk1',
// 		'1024-blocks': 487350400,
// 		Used: 467528020,
// 		Available: 19566380,
// 		Capacity: '96%',
// 		'Mounted on': '/'
// 	},
// 	…
// ]
```
*/
export default function parseColumns<Value = string>(
	textColumns: string,
	options?: Options<Value>
): Array<Record<string, Value>>;
