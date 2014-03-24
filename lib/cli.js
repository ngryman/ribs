/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash'),
	args = require('minimist')(process.argv.slice(2)),
	ribs = require('..'),
	utils = ribs.utils,
	inspect = ribs.utils.inspect,
	log = require('npmlog'),
	path = require('path');

var inPipe,
	outPipe;

function parseArguments() {
	var src = args._[0],
		dst = args._[1],
		operations;

	log.verbose('parsing');

	// source file
	if (inPipe) {
		dst = src;
		src = process.stdin;
	}
	else if (!src) {
		log.error('parsing', 'from', 'a source file must be specified');
		process.exit(1);
	}

	// destination file
	if (outPipe) {
		dst = process.stdout;

		// ribs needs a filename as destination to deduct the output format
		// stdout does not provide this, so we output in the same format as the origin
		dst.path = path.extname(src);
	}
	else if (!dst) {
		log.error('parsing', 'to', 'a destination file must be specified');
		process.exit(1);
	}

	// remove _ of args for further processing
	delete args._;

	// operations mapping
	operations = _.map(args, function(val, key) {
		var operation, params;

		/** operation parsing */

		// a shortcut is the first letter of an operation
		if (1 == key.length) {
			operation = _(ribs.operations).keys().find(function(opname) {
				return key == opname[0];
			});
		}
		else {
			operation = key;
		}

		log.verbose('parsing operation', operation);

		/** params parsing */

		if ('string' == typeof val)
			params = val.split(',');
		else if ('number' == typeof val)
			params = val;
		else {
			log.error('parsing params', 'invalid value: ' + inspect(val));
			process.exit(1);
		}

		log.verbose('parsing params', inspect(params));

		return {
			operation: operation,
			params: params
		};
	});

	return {
		src: src,
		dst: dst,
		operations: operations
	};
}

function checkPiped() {
	inPipe = !process.stdin.isTTY;
	outPipe = !process.stdout.isTTY;
}

function checkLogLevel() {
	if (!outPipe && (args.verbose || args.v)) {
		log.level = 'verbose';
		delete args.verbose;
		delete args.v;
	}
	else if (outPipe || args.silent || args.s) {
		log.level = 'silent';
		delete args.silent;
		delete args.s;
	}
}

checkPiped();
checkLogLevel();

/**
 * Module exports.
 */

exports.options = parseArguments();