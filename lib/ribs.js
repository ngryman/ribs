/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var operations = require('./operations'),
	Pipeline = require('./pipeline');

/**
 * Ribs front-end.
 *
 * It basically proxy and simplify common usage of a pipeline by allowing implicit `from` and `to`
 * operations.
 *
 * @param {string|array} src - Source image filename.
 * @param {string|object|function} dst - Destination image filename.
 * @param {array|function} bulk
 * @param {function} callback
 */

var ribs = function(src, dst, bulk, callback) {
	var pipeline = new Pipeline();

	/** `(bulk, callback)` */

	if (Array.isArray(src))
		return pipeline.use(src, dst);

	/** `(src, dst, callback)` */

	if ('function' == typeof bulk) {
		callback = bulk;
		bulk = null;
	}

	/** `(src, dst, [bulk], [callback])` */

	if (src) {
		pipeline.from(src);

		if (dst) {
			var done = pipeline.done;
			pipeline.done = function() {
				this.to(dst);
				done.apply(this, arguments);
			};

			if (bulk) {
				pipeline.use(bulk);
			}

			if (callback)
				pipeline.done(callback);
		}
	}

	return pipeline;
};

/**
 * Create a pipeline and open the specified image.
 *
 * @param {string} src - Filename or readable stream of the source image.
 */
ribs.from = function(filename) {
	var pipeline = new Pipeline();
	pipeline.from(filename);

	return pipeline;
};

/**
 * Proxy some useful Pipeline's functions, variables
 */

ribs.add = Pipeline.add;
ribs.hook = Pipeline.hook;

ribs.__defineGetter__('DEBUG', function() { return Pipeline.DEBUG; });
ribs.__defineSetter__('DEBUG', function(val) { Pipeline.DEBUG = val; });

/**
 * Export.
 */

module.exports = ribs;
module.exports.Image = require('./image');
module.exports.Pipeline = Pipeline;
module.exports.Stream = require('./stream').Stream;
module.exports.createStream = require('./stream').createStream;
module.exports.operations = operations;
module.exports.middleware = require('./middleware');
module.exports.utils = require('./utils');