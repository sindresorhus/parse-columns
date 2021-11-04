import fs from 'node:fs';
import test from 'ava';
import parseColumns from './index.js';

const fixture1 = fs.readFileSync('fixtures/ps.out', 'utf8');
const fixture2 = fs.readFileSync('fixtures/ps-2.out', 'utf8');
const fixture3 = fs.readFileSync('fixtures/lsof.out', 'utf8');
const fixture4 = fs.readFileSync('fixtures/ps-3.out', 'utf8');

test.after('benchmark', () => {
	const count = 30;
	let total = 0;

	for (let index = 0; index < count; index++) {
		const start = Date.now();
		parseColumns(fixture3);
		total += Date.now() - start;
	}

	console.log(`${count} iterations: ${total / (1000 * count)}s`);
});

test('parse', t => {
	const fixture = parseColumns(fixture1);
	t.is(fixture[0].PID, '238');
});

test('headers option', t => {
	const fixture = parseColumns(fixture1, {
		headers: [
			'pid',
			'name',
			'cmd',
		],
	});
	t.is(fixture[0].pid, '238');
	t.truthy(fixture[0].name);
	t.truthy(fixture[0].cmd);
});

test('transform option', t => {
	const fixture = parseColumns(fixture1, {
		transform: (item, header, rowIndex, columnIndex) => {
			t.is(typeof rowIndex, 'number');
			t.is(typeof columnIndex, 'number');
			return header === 'PID' ? Number(item) : item;
		},
	});
	t.is(fixture[0].PID, 238);
});

test('separator option', t => {
	const fixture = parseColumns(fixture2, {
		separator: '|',
	});
	t.is(fixture[0].PID, '238');
});

test('differing line lengths', t => {
	const fixture = parseColumns(fixture3);
	const columns = 'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME'.split(' ');

	t.true(fixture.every(row => Object.keys(row).length === columns.length && columns.every(column => Reflect.has(row, column))));
});

test('separators in values', t => {
	const fixture = parseColumns(fixture4);

	t.deepEqual(fixture, [
		{
			PID: '5971',
			CMD: 'emacs -nw',
			STARTED: 'Oct 29',
		},
		{
			PID: '22678',
			CMD: 'emacs -nw foo.js',
			STARTED: '13:10:36',
		},
		{
			PID: '28752',
			CMD: 'emacs -nw .',
			STARTED: 'Oct 28',
		},
		{
			PID: '31236',
			CMD: 'emacs -nw fixtures/ps-3.out',
			STARTED: '17:10:10',
		},
		{
			PID: '32513',
			CMD: 'emacs -nw README.md',
			STARTED: 'Oct 28',
		},
	]);
});

test('handles `df` output', t => {
	const data = parseColumns(`
	Filesystem                 Type  1024-blocks  Used    Available Capacity Mounted on
	xx.xxx.xxx.xx:/xxxxxxxxxxx nfs  198640150528 43008 198640107520       1% /run/xo-server/mounts/cbb36e4c-3353-4126-8588-18ba25697403
	`);

	t.deepEqual(data, [
		{
			Filesystem: 'xx.xxx.xxx.xx:/xxxxxxxxxxx',
			Type: 'nfs',
			'1024-blocks': '198640150528',
			Used: '43008',
			Available: '198640107520',
			Capacity: '1%',
			'Mounted on': '/run/xo-server/mounts/cbb36e4c-3353-4126-8588-18ba25697403',
		},
	]);
});

test('handles `df` output with spaces', t => {
	const data = parseColumns(`
	Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
	/dev/sda1 2 3 4 5 999                ext4   243617788 137765660 105852128      57% /media/foo1 2 3 4 5 999
	`);

	t.deepEqual(data, [
		{
			Filesystem: '/dev/sda1 2 3 4 5 999',
			Type: 'ext4',
			'1024-blocks': '243617788',
			Used: '137765660',
			Available: '105852128',
			Capacity: '57%',
			'Mounted on': '/media/foo1 2 3 4 5 999',
		},
	]);
});

test.failing('handles `df` output with spaces and `headers` option', t => {
	const data = parseColumns(`
	Filesystem                           Type 1024-blocks      Used Available Capacity Mounted on
	/dev/sda1 2 3 4 5 999                ext4   243617788 137765660 105852128      57% /media/foo1 2 3 4 5 999
	`, {
		headers: [
			'filesystem',
			'type',
			'size',
			'used',
			'available',
			'capacity',
			'mountpoint',
		],
	});

	t.deepEqual(data, [
		{
			filesystem: '/dev/sda1 2 3 4 5 999',
			type: 'ext4',
			size: '243617788',
			used: '137765660',
			available: '105852128',
			capacity: '57%',
			mountpoint: '/media/foo1 2 3 4 5 999',
		},
	]);
});
