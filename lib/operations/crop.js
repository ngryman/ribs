/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils'),
	check = utils.checkType,
	Image = require('../image');

/**
 *
 * @param params
 * @param image
 * @param next
 */
function crop(params, image, next) {
	var width, height;

	// arguments type
	check('next', next, true, 'function');
	try {
		check('params', params, false, 'string', 'object');
		check('width', params.width, true, 'number', 'string');
		check('height', params.height, true, 'number', 'string');
		check('x', params.x, true, 'number', 'string');
		check('y', params.y, true, 'number', 'string');
		check('anchor', params.anchor, true, 'string');
		check('mode', params.mode, true, 'string');
		check('image', image, false, 'object');

		// invoke the constraints hook
		var hook = params.hooks && params.hooks['crop:constraints'];
		if (hook) hook(params, image);
	}
	catch (err) {
		return next(err, image);
	}

	image.crop(params.width, params.height, params.x, params.y, next);
}

/**
 * Export.
 */

module.exports = crop;