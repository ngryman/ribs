/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs'),
	utils = require('../utils'),
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

	// opens file and pass raw data to the next operation
	fs.readFile(filename, next);
}

/**
 * Export.
 */

module.exports = open;