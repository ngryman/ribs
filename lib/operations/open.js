/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bindings = require('../bindings'),
	utils = require('../utils'),
	fs = require('fs'),
	check = utils.checkType,
	Image = bindings.Image;

/**
 *
 * @param {string|object} filename - Filename of a source image.
 * @param {function} next - Next function in the pipeline.
 */
function open(filename, next) {
	// arguments type
	check('next', next, true, 'function');
	try {
		check('filename', filename, false, 'string', 'object');
	}
	catch (err) {
		next(err, undefined);
		return;
	}

	// open, decodes and pass an image object to the next operation
	Image.open(filename, next);
}

/**
 * Export.
 */

module.exports = open;