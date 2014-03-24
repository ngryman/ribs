/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs'),
	Image = require('../image'),
	Pipeline = require('../pipeline'),
	utils = require('../utils'),
	check = utils.checkType;

/**
 *
 * @param {object|string|Buffer|Readable} src - Source image.
 * @param {function} next - Next function in the pipeline.
 */
function from(src, next) {
	check('next', next, false, 'function');

	try {
		check('params', src, false, 'string', 'object', 'array');

		// array to named arguments
		if (Array.isArray(src))
			src = src[0];

		// src is a path, create a readable stream
		if ('string' == typeof src) {
			src = fs.createReadStream(src);
		}

		// src is a stream, read it, then decode it
		if (utils.isReadableStream(src)) {
			var buffers = [];

			src.on('data', buffers.push.bind(buffers));
			src.on('end', function() {
				if (0 === buffers.length)
					return next(new Error('empty file: ' + src.path), null);

				Image.decode(Buffer.concat(buffers), next);
			});
			src.on('error', function(err) {
				// indirection for curry
				next(err, null);
			});
		}
		// src is a buffer, decode it directly
		else if (Buffer.isBuffer(src)) {
			Image.decode(src, next);
		}
		else
			throw new Error('invalid source image');

		return src;
	}
	catch (err) {
		return next(err, undefined);
		return src;
	}
}

/**
 * Register operation.
 */

Pipeline.add('from', from);

/**
 * Export.
 */

module.exports = from;