declare namespace parseColumns {
	interface Options<ValuesType extends unknown = string> {
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
		) => ValuesType;
	}
}

/**
Parse text columns, like the output of Unix commands.

@param input - Text columns to parse.

@example
```
import {promisify} from 'util';
import * as childProcess from 'child_process';
import parseColumns = require('parse-columns');

const execFileP = promisify(childProcess.execFile);

(async () => {
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
})();
```
*/
declare function parseColumns<ValuesType extends unknown = string>(
	input: string,
	options?: parseColumns.Options<ValuesType>
): Array<{[key: string]: ValuesType}>;

export = parseColumns;
