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

var ribs = require('ribs'),
	options = require('../lib/cli').options;

// verbose mode?
var verbose = 'verbose' == log.level;

log.info('args', '<', options.src);
log.info('args', '>', options.dst);

// enqueue each operation
options.operations.forEach(function(operation) {
	log.info('args', operation.operation + ':', '[' + operation.params + ']');
});

// open file
var pipeline = ribs(options.src, options.dst);

log.info('run');

// enqueue operations & go!
pipeline.use(options.operations, function(err) {
	if (err)
		log.error('run', err.message, verbose ? '\n' + err.stack.split('\n').slice(1).join('\n') : '');
	else
		log.info('run ok');
});