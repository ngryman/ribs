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
	checkInstance = utils.checkInstance,
	Image = require('../image');

/**
 *
 * @param params
 * @param image
 * @param next
 */
function resize(params, image, next) {
	var width, height;

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