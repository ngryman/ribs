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
	Duplex = require('stream').Duplex,
	Writable = require('stream').Writable,
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
function save(params, image, next) {
	var dst, quality, progressive;

	// arguments type
	check('next', next, false, 'function');

	try {
		check('params', params, false, 'string', 'object');
		check('dst', params.dst, true, 'string', 'object');
		check('quality', params.quality, true, 'number');
		check('progressive', params.progressive, true, 'boolean');
		check('image', image, false, 'object');
		checkInstance('image', image, Image);

		// arguments splitting
		dst = params.dst || params;
		quality = params.quality || 0;
		progressive = params.progressive || false;

		var encodeCallback, writer;

		// check if a stream was specified
		if (dst instanceof Writable || dst instanceof Duplex) writer = dst;

		if (writer) {
			dst = writer.path || image.format;
			encodeCallback = function(data) {
				if (writer !== process.stdout)
					writer.end(data);
				else
					writer.write(data);

				writer.on('finish', function() {
					next(null, image);
				});
			};
		}
		else {
			// filename check
			check('dst', dst, false, 'string');

			encodeCallback = function(data) {
				fs.writeFile(dst, data, function(err) {
					next(err, image);
				});
			};
		}

		// encode, write and pass image object to the next operation
		image.encode(dst, quality, function(err, data) {
			if (err) return next(err, null);

			encodeCallback(data);
		});
	}
	catch (err) {
		return next(err, image);
	}
}

/**
 * Register operation.
 */

Pipeline.add('save', save);

/**
 * Export.
 */

module.exports = save;