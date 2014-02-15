/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Hooks.
 */

var hooks = {};

/**
 * Resize constraints hook.
 * Applies default constraints to a given `params.width` and `params.height` for a resize operation.
 * It ensures that aspect ratio is preserved and only allows downscale.
 * It is called from the native part and lets the user customize how constraints are computed by RIBS.
 *
 * @param {object} params - Parameters to hook.
 * @param {(number|string)} params.width - Width after resize.
 * @param {(number|string)} params.height - Height after resize.
 * @param {image} image - Image to process.
 */
hooks.resizeConstraintsHook = function(params, image) {
	var dstWidth = params.width,
		dstHeight = params.height,
		srcWidth = image.width,
		srcHeight = image.height;

	// treat formulas
	if ('string' == typeof dstWidth) {
		dstWidth = utils.computeFormula(dstWidth, srcWidth);
	}
	if ('string' == typeof dstHeight) {
		dstHeight = utils.computeFormula(dstHeight, srcHeight);
	}

	// treat null values
	if (null == dstWidth)  dstWidth  = 0;
	if (null == dstHeight) dstHeight = 0;

	// clamping and adjustments
	//  - 0 dest size is assigned to src size
	//  - negative dest size is src size - 2 * src size
	//  - clamp upscale
	if (0 === dstWidth) dstWidth = srcWidth;
	else if (dstWidth < 0) dstWidth = srcWidth + 2 * dstWidth;
	else if (dstWidth > srcWidth) dstWidth = srcWidth;
	if (0 === dstHeight) dstHeight = srcHeight;
	else if (dstHeight < 0) dstHeight = srcHeight + 2 * dstHeight;
	else if (dstHeight > srcHeight) dstHeight = srcHeight;

	// ratio constraints applied to the smaller size
	var ratio = srcWidth / srcHeight;
	if (dstWidth / srcWidth <= dstHeight / srcHeight) dstHeight = dstWidth / ratio;
	else dstWidth = dstHeight * ratio;

	// rounding
	dstWidth = Math.round(dstWidth);
	dstHeight = Math.round(dstHeight);

	// assign new values
	params.width = dstWidth;
	params.height = dstHeight;
};

/**
 * Export.
 */

module.exports = hooks;