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
	// treats formulas
	if ('string' == typeof dstWidth) {
		dstWidth = utils.computeFormula(dstWidth, srcWidth);
	}
	if ('string' == typeof dstHeight) {
		dstHeight = utils.computeFormula(dstHeight, srcHeight);
	}

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

	return {
		width: dstWidth,
		height: dstHeight
	};
};

/**
 * Export.
 */

module.exports = hooks;