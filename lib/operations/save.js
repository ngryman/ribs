/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils'),
	fs = require('fs'),
	check = utils.checkType,
	checkInstance = utils.checkInstance,
	Image = require('../image');

/**
 *
 * @param {string|object} params - Parameters.
 * @param {string} params.filename - Filename of the source image.
 * @param {string} params.quality - Quality (1 - 100) of the destination image, only applies to JPEG.
 * @param {boolean} params.progressive - Either the destination image is progressive or not, only applies to JPEG.
 * @param {Image} image - Image instance.
 * @param {function} next - Next function in the pipeline.
 */
function save(params, image, next) {
	var filename, quality, progressive;

	// arguments type
	check('next', next, false, 'function');
	try {
		check('params', params, false, 'string', 'object');
		check('filename', params.filename, false, 'string');
		check('quality', params.quality, true, 'number');
		check('progressive', params.progressive, true, 'boolean');
		check('image', image, false, 'object');
		checkInstance('image', image, Image);

		// arguments splitting
		filename = 'string' == typeof params ? params : params.filename;
		quality = params.quality || 0;
		progressive = params.progressive || false;

		// filename check
		check('filename', filename, false, 'string');

		// encode, write and pass image object to the next operation
		image.encode(filename, quality, function(err, data) {
			if (err) return next(err, null);

			fs.writeFile(filename, data, next);
		});
	}
	catch (err) {
		return next(err, undefined);
	}
}

/**
 * Export.
 */

module.exports = save;