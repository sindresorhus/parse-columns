export interface Options<Value = string> {
	/**
	Separator to split columns on.

	@default ' '
	*/
	readonly separator?: string;

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
}

/**
Parse text columns, like the output of Unix commands.

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
