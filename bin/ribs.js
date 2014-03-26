#!/usr/bin/env node

/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

process.title = 'ribs';

/**
 * Log configuration.
 */

var log = require('npmlog');
log.heading = 'ribs';

/**
 * Modules dependencies.
 */

var ribs = require('..'),
	inspect = ribs.utils.inspect,
	options = require('../lib/cli').options,
	_ = require('lodash');

// verbose mode?
var verbose = 'verbose' == log.level;

log.verbose('process');

/**
 * Process!
 */

var current,
	checkpoint,
	start = Date.now();

ribs(options.src, options.dst, options.operations, function(err) {
	var delta = Date.now() - start;

	if (err)
		log.error(current, err.message, verbose ? '\n' + err.stack.split('\n').slice(1).join('\n') : '');
	else
		log.info('ok', delta + 'ms');
})

.on('operation:before', function(name, params) {
	log.verbose(name, inspect(params));

	current = name;
	checkpoint = Date.now();
})

.on('operation:after', function(name, params) {
	var delta = Date.now() - checkpoint;

	// simplified output
	if ('from' == name)
		params = params.path;
	else if ('to' == name)
		params = params.dst;

	log.info(name, delta + 'ms', inspect(params));
});