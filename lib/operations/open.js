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
 * @param {string} filename - Filename of a source image.
 * @param {function} next - Next function in the pipeline.
 */
function open(filename, next) {
	// arguments type
	check('next', next, true, 'function');
	try {
		check('filename', filename, false, 'string');
	}
	catch (err) {
		next(err, undefined);
		return;
	}

	// open, decode and pass an image object to the next operation
    fs.readFile(filename, function(err, data) {
        if (err) return next(err, null);

        Image.decode(data, next);
    });
}

/**
 * Export.
 */

module.exports = open;