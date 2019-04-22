# parse-columns [![Build Status](https://travis-ci.org/sindresorhus/parse-columns.svg?branch=master)](https://travis-ci.org/sindresorhus/parse-columns)

> Parse text columns, like the output of Unix commands


## Install

```
$ npm install parse-columns
```


## Usage

```
$ df -kP
Filesystem 1024-blocks      Used Available Capacity  Mounted on
/dev/disk1   487350400 467871060  19223340    97%    /
devfs              185       185         0   100%    /dev
map -hosts           0         0         0   100%    /net
```

```js
const {promisify} = require('util');
const childProcess = require('child_process');
const parseColumns = require('parse-columns');

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
	/*
	[
		{
			Filesystem: '/dev/disk1',
			'1024-blocks': 487350400,
			Used: 467528020,
			Available: 19566380,
			Capacity: '96%',
			'Mounted on': '/'
		},
		…
	]
	*/
})();
```


## API

### parseColumns(input, [options])

#### input

Type: `string`

Text columns to parse.

#### options

Type: `object`

##### separator

Type: `string`
Default: `' '`

Separator to split columns on.

##### headers

Type: `string[]`

Headers to use instead of the existing ones.

##### transform

Type: `Function`

Transform elements.

Useful for being able to cleanup or change the type of elements.

The supplied function gets the following arguments and is expected to return the element:

- `element` *(string)*
- `header` *(string)*
- `columnIndex` *(number)*
- `rowIndex` *(number)*


## Related

- [parse-columns-cli](https://github.com/sindresorhus/parse-columns-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
