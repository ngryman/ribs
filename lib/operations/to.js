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
	path = require('path'),
	Image = require('../image'),
	Pipeline = require('../pipeline'),
	utils = require('../utils'),
	check = utils.checkType,
	checkInstance = utils.checkInstance;

/**
 *
 * @param {string|object} params - Parameters.
 * @param {string} params.dst - Filename or stream of the destination image.
 * @param {string} params.quality - Quality (1 - 100) of the destination image, only applies to JPEG.
 * @param {boolean} params.progressive - Either the destination image is progressive or not, only applies to JPEG.
 * @param {Image} image - Image instance.
 * @param {function} next - Next function in the pipeline.
 */
function to(params, image, next) {
	// arguments type
	check('next', next, false, 'function');

	try {
		check('params', params, false, 'string', 'object', 'array');
		check('dst', params.dst, true, 'string', 'object');
		check('quality', params.quality, true, 'number');
		check('progressive', params.progressive, true, 'boolean');
		check('image', image, false, 'object');
		checkInstance('image', image, Image);

		// array to named arguments
		if (Array.isArray(params))
			params = utils.toParams(params, ['dst', 'quality', 'progressive']);

		// arguments splitting
		var dst = params.dst || params;
		var quality = params.quality || 0;
		var progressive = params.progressive || false;

		// set output format to source format by default
		var format = image.inputFormat;

		// if dst is a path, create a writable stream
		if ('string' == typeof dst) {
			dst = fs.createWriteStream(dst);
			format = image.inputFormat;
		}
		// if dst is a stream, get the output path if possible
		else if (utils.isWritableStream(dst))
			format = path.extname(dst.path).slice(1) || image.inputFormat;
		// early check on dst validity
		else if (!Buffer.isBuffer(dst))
			throw new Error('invalid destination image');

		// encode the image
		image.encode(format, quality, function(err, data) {
			if (err) return next(err, image);

			// dst is a stream, write to it
			if (utils.isWritableStream(dst)) {
				if (process.stdout !== dst)
					dst.end(data);
				else
					dst.write(data);

				dst.on('finish', function() {
					next(null, image);
				});
				dst.on('error', function(err) {
					next(err, image);
				});

				return;
			}

			// dst is a buffer, copy data
			data.copy(dst);

			next(null, image);
		});

		return params;
	}
	catch (err) {
		return next(err, image);
		return params;
	}
}

/**
 * Register operation.
 */

Pipeline.add('to', to);

/**
 * Export.
 */

module.exports = to;