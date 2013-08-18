/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bindings = require('../bindings'),
	utils = require('../utils'),
	fs = require('fs'),
	check = utils.checkType;

/**
 *
 * @param {string|object} filename - Path to a source image or stream containing image data.
 * @param next
 */
function open(filename, next) {
	// arguments type
	try {
		check('filename', filename, false, 'string', 'object');
	}
	catch (err) {
		next(err);
		return;
	}

	// opens, decodes and pass an image object to the next operation
	bindings.readFile(filename, next);
}

/**
 * Export.
 */

module.exports = open;