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
	Image = require('../image');

/**
 *
 * @param next
 */
function crop(params, image, next) {
	throw new Error('not implemented');
}

/**
 * Export.
 */

module.exports = crop;