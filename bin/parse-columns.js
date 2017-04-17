#!/usr/bin/env node

var parseColumns = require('..');

var chunks = [];
process.stdin.on('data', chunks.push.bind(chunks));
process.stdin.on('end', function () {
	console.log(parseColumns(Buffer.concat(chunks).toString()));
});
