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
 * @param {string|object} filename - Path to a source image or stream containing image data.
 * @param next
 */
function open(filename, next) {
	throw new Error('not implemented');
//	// arguments type
//	try {
//		check('filename', filename, false, 'string', 'object');
//	}
//	catch (err) {
//		next(err);
//		return;
//	}
//
//	// open, decodes and pass an image object to the next operation
//	Image.fromFile(filename, next);
}

/**
 * Export.
 */

module.exports = open;