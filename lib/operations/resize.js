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
 * @param params
 * @param image
 * @param next
 */
function resize(params, image, next) {
	var width, height;

	// arguments type
	check('next', next, true, 'function');
	try {
		check('params', params, false, 'string', 'object');
		check('width', params.width, true, 'number', 'string');
		check('height', params.height, true, 'number', 'string');
		check('image', image, false, 'object');
	}
	catch (err) {
		return next(err, undefined);
	}

	// invoke the constraints hook
	var hook = params.hooks && params.hooks['resize:constraints'];
	if (hook) hook(params, image);

	image.resize(params.width, params.height, next);
}

/**
 * Export.
 */

module.exports = resize;