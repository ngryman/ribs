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
function save(filename, image, next) {
	throw new Error('not implemented');
}

/**
 * Export.
 */

module.exports = save;