/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils'),
	fs = require('fs'),
	check = utils.checkType,
	Image = require('../image');

/**
 *
 * @param {string} filename - Filename of a source image.
 * @param {object} hooks - Available hooks.
 * @param {function} next - Next function in the pipeline.
 */
function open(filename, hooks, next) {
	// arguments type
	check('next', next, false, 'function');
	try {
		check('filename', filename, false, 'string');

		// open, decode and pass an image object to the next operation
		fs.readFile(filename, function(err, data) {
			if (err) return next(err, null);

			Image.decode(data, next);
		});
	}
	catch (err) {
		return next(err, undefined);
	}
}

/**
 * Export.
 */

module.exports = open;