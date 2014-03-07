/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../utils'),
	check = utils.checkType,
	checkInstance = utils.checkInstance,
	Image = require('../image');

/**
 *
 * @param {object|[]} params
 * @param image
 * @param next
 */
function resize(params, image, next) {
	var width, height;

	// array to named arguments
	if (Array.isArray(params))
		params = utils.toParams(params, ['width', 'height']);

	// arguments type
	check('next', next, false, 'function');
	try {
		check('params', params, true, 'string', 'object');

		// early call back if params is null
		if (null == params) return next(null, image);

		check('width', params.width, true, 'number', 'string');
		check('height', params.height, true, 'number', 'string');
		check('image', image, false, 'object');
		checkInstance('image', image, Image);

		// invoke the constraints hook
		var hook = params.hooks['resize:constraints'];
		if (hook) hook(params, image);

		// do nothing when specified size is the same as original one
		if (image.width == params.width && image.height == params.height)
			return next(null, image);

		// do nothing when image is empty
		if (0 === image.width && 0 === image.height)
			return next(null, image);

		image.resize(params.width, params.height, next);
	}
	catch (err) {
		return next(err, image);
	}
}

/**
 * Export.
 */

module.exports = resize;