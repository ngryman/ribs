/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils'),
	check = utils.checkType;

/**
 *
 * @param {string|object} filename - Path to a source image or stream containing image data.
 */
function open(filename, next) {
	// arguments type
	check('filename', filename, false, 'string', 'object');

	next();
}

/**
 * Export.
 */

module.exports = open;