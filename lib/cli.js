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
	ribs = require('ribs'),
	log = require('npmlog'),
	path = require('path');

var inPipe,
	outPipe,
	verbose;

function parseArguments() {
	// log level
	if (inPipe || outPipe)
		log.level = 'silent';
	else if (verbose)
		log.level = 'verbose';

	log.verbose('parsing', 'args');

	// source file
	var src = args._[0];
	if (!src) {
		// if process is being piped, read raw image from stdin
		if (!process.stdout.isTTY) {
			dst = process.stdout;

			// ribs needs a filename as source to deduct the input format
			// stdin does not provide this, so we output in the same format as the origin
			src.path = path.extname(src);
		}
		else {
			log.error('parsing args', 'a source file must be specified');
			process.exit(1);
		}
	}

	// destination file
	var dst = args._[1];
	if (!dst) {
		// if process is being piped, output raw image to stdout
		if (!process.stdout.isTTY) {
			dst = process.stdout;

			// ribs needs a filename as destination to deduct the output format
			// stdout does not provide this, so we output in the same format as the origin
			dst.path = path.extname(src);
		}
		else {
			log.error('parsing args', 'a destination file must be specified');
			process.exit(1);
		}
	}

	// remove _ of args for further processing
	delete args._;

	// operations mapping
	var operations = _.map(args, function(val, key) {
		var operation, params;

		// operation parsing

		// a shortcut is the first letter of an operation
		if (1 == key.length) {
			operation = _(ribs.operations).keys().find(function(opname) {
				return key == opname[0];
			});
		}
		else {
			operation = key;
		}

		log.verbose('parsing args', operation);

		// params parsing

		if ('string' == typeof val)
			params = val.split(',');
		else if ('number' == typeof val)
			params = val;
		else {
			log.error('parsing ' + operation, 'invalid value: %j', val);
			process.exit(1);
		}

		log.verbose('parsing args', '[' + params + ']');

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

function checkVerbose() {
	verbose = args.verbose || args.v;
	if (verbose) {
		delete args.verbose;
		delete args.v;
	}
}

checkPiped();
checkVerbose();

/**
 * Module exports.
 */

exports.options = parseArguments();