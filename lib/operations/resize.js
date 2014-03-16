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
 * @param hooks
 * @param image
 * @param next
 */
function resize(params, hooks, image, next) {
	// arguments type
	check('next', next, false, 'function');

	try {
		check('params', params, true, 'string', 'number', 'object', 'array');

		// early call back if params is null
		if (null == params) return next(null, image);

		// if params is a number or a string, it is assigned to width
		if ('string' == typeof params || 'number' == typeof params)
			params = { width: params };

		// array to named arguments
		else if (Array.isArray(params))
			params = utils.toParams(params, ['width', 'height']);

		check('width', params.width, true, 'number', 'string');
		check('height', params.height, true, 'number', 'string');
		check('image', image, false, 'object');
		checkInstance('image', image, Image);

		// invoke the constraints hook
		var hook = hooks['resize:constraints'];
		if (hook) hook(params, image);

		// do nothing when specified size is the same as original one
		if (image.width == params.width && image.height == params.height) {
			next(null, image);
			return params;
		}

		// do nothing when image is empty
		if (0 === image.width && 0 === image.height) {
			next(null, image);
			return params;
		}

		image.resize(params.width, params.height, next);
	}
	catch (err) {
		next(err, image);
		return params;
	}
}

/**
 * Export.
 */

module.exports = resize;