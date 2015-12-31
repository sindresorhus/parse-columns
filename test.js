import fs from 'fs';
import test from 'ava';
import fn from './';

const fixture = fs.readFileSync('fixtures/ps.out', 'utf8');
const fixture2 = fs.readFileSync('fixtures/ps-2.out', 'utf8');
const fixture3 = fs.readFileSync('fixtures/lsof.out', 'utf8');
const fixture4 = fs.readFileSync('fixtures/ps-3.out', 'utf8');

test('parse', t => {
	const f = fn(fixture);
	t.is(f[0].PID, '238');
});

test('headers option', t => {
	const f = fn(fixture, {
		headers: ['pid', 'name', 'cmd']
	});
	t.is(f[0].pid, '238');
	t.ok(f[0].name);
	t.ok(f[0].cmd);
});

test('transform option', t => {
	const f = fn(fixture, {
		transform: (el, header, rowIndex, columnIndex) => {
			t.is(typeof rowIndex, 'number');
			t.is(typeof columnIndex, 'number');
			return header === 'PID' ? Number(el) : el;
		}
	});
	t.is(f[0].PID, 238);
});

test('separator option', t => {
	const f = fn(fixture2, {
		separator: '|'
	});
	t.is(f[0].PID, '238');
});

test('differing line lengths', t => {
	const f = fn(fixture3);
	const cols = 'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME'.split(' ');

	t.true(f.every(row => {
		return Object.keys(row).length === cols.length && cols.every(x => row.hasOwnProperty(x));
	}));
});

test('separators in values', t => {
	const f = fn(fixture4);

	t.same(f, [
		{
			PID: '5971',
			CMD: 'emacs -nw',
			STARTED: 'Oct 29'
		},
		{
			PID: '22678',
			CMD: 'emacs -nw foo.js',
			STARTED: '13:10:36'
		},
		{
			PID: '28752',
			CMD: 'emacs -nw .',
			STARTED: 'Oct 28'
		},
		{
			PID: '31236',
			CMD: 'emacs -nw fixtures/ps-3.out',
			STARTED: '17:10:10'
		},
		{
			PID: '32513',
			CMD: 'emacs -nw README.md',
			STARTED: 'Oct 28'
		}
	]);
});

test.after('benchmark', () => {
	const count = 30;
	let total = 0;

	for (let i = 0; i < count; i++) {
		const start = Date.now();
		fn(fixture3);
		total += Date.now() - start;
	}

	console.log(count + ' iterations: ' + (total / (1000 * count)) + 's');
});
