/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
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
 * Shrink constraints hook.
 * Applies default constraints to a given `dstWidth` and `dstHeight` for a shrink operation.
 * It ensures that aspect ratio is preserved and only allows downscale.
 * It is called from the native part and lets the user customize how constraints are computed by RIBS.
 *
 * @param {(number|string)} dstWidth - Width after shrink.
 * @param {(number|string)} dstHeight - Height after shrink.
 * @param {number} srcWidth - Width before shrink.
 * @param {number} srcHeight - Height before shrink.
 * @return {object} The final destination size.
 */
hooks.shrinkConstraintsHook = function(dstWidth, dstHeight, srcWidth, srcHeight) {
	// treats percentages
	if ('string' == typeof dstWidth) {
		dstWidth = srcWidth * utils.percentage(dstWidth);
	}
	if ('string' == typeof dstHeight) {
		dstHeight = srcHeight * utils.percentage(dstHeight);
	}

	// clamp upsampling
	if (dstWidth > srcWidth) dstWidth = srcWidth;
	if (dstHeight > srcHeight) dstHeight = srcHeight;

	// ratio constraints
	var ratio = srcWidth / srcHeight;
	if (0 == dstHeight && dstWidth > 0) {
		dstHeight = dstWidth / ratio;
	}
	else if (0 == dstWidth && dstHeight > 0) {
		dstWidth = dstHeight * ratio;
	}

	// rounding
	dstWidth = Math.round(dstWidth);
	dstHeight = Math.round(dstHeight);

	return {
		width: dstWidth,
		height: dstHeight
	}
};

/**
 * Export.
 */

module.exports = hooks;