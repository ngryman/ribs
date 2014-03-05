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
 */

var ribs = function(src, dst) {
	var pipeline = new Pipeline();

	if (src) {
		pipeline.open(src);

		if (dst) {
			var done = pipeline.done;
			pipeline.done = function() {
				var params;

				if ('string' == typeof dst)
					params = { filename: dst };
				else
					params = dst;

				this.save(params);

				done.apply(this, arguments);
			};
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
 * Export.
 */

module.exports = ribs;
module.exports.Image = require('./image');
module.exports.Pipeline = Pipeline;
module.exports.operations = operations;