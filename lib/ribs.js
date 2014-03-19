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
	Pipeline = require('./pipeline'),
	curry = require('curry'),
	Stream = require('stream').Duplex;

/**
 * Ribs front-end.
 *
 * It basically proxy and simplify common usage of a pipeline by allowing implicit `open` and `save`
 * operations.
 *
 * @param {string} src - Source image filename.
 * @param {string|object} dst - Destination image filename.
 * @param {array|function} bulk
 * @param {function} callback
 */

var ribs = function(src, dst, bulk, callback) {
	var pipeline = new Pipeline();

	// arguments juggling
	if ('function' == typeof bulk) {
		callback = bulk;
		bulk = null;
	}

	if (src) {
		pipeline.open(src);

		if (dst) {
			var done = pipeline.done;
			pipeline.done = function() {
				var params;

				if ('string' == typeof dst)
					params = { dst: dst };
				else
					params = dst;

				this.save(params);

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
 * @param {string} filename - Image filename.
 */
ribs.open = function(filename) {
	var pipeline = new Pipeline();
	pipeline.open(filename);

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
module.exports.operations = operations;