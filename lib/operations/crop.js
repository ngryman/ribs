/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Image = require('../image'),
	Pipeline = require('../pipeline'),
	utils = require('../utils'),
	check = utils.checkType,
	checkInstance = utils.checkInstance;

/**
 *
 * @param {object|[]} params
 * @param image
 * @param next
 */
function crop(params, image, next) {
	var width, height;

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
			params = utils.toParams(params, ['width', 'height', 'x', 'y', 'landmark', 'anchor']);

		check('width', params.width, true, 'number', 'string');
		check('height', params.height, true, 'number', 'string');
		check('x', params.x, true, 'number', 'string');
		check('y', params.y, true, 'number', 'string');
		check('landmark', params.landmark, true, 'string');
		check('anchor', params.anchor, true, 'string');
		check('image', image, false, 'object');
		checkInstance('image', image, Image);

		// invoke the constraints hook
		Pipeline.hook('crop', 'constraints')(params, image);

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

		image.crop(params.width, params.height, params.x, params.y, next);
	}
	catch (err) {
		next(err, image);
		return params;
	}
}

/**
 * Register operation.
 */

Pipeline.add('crop', crop);

/**
 * Export.
 */

module.exports = crop;