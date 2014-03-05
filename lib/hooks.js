/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
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
 * Applies default constraints to given `width` and `height` for a resize operation.
 * It ensures that aspect ratio is preserved and only allows downscale.
 * It lets the user customize how constraints are computed by RIBS.
 *
 * @param {object} params - Parameters to hook.
 * @param {(number|string)} params.width - Width after resize.
 * @param {(number|string)} params.height - Height after resize.
 * @param {Image} image - Image to process.
 */
hooks.resizeConstraintsHook = function(params, image) {
	var dstWidth = params.width,
		dstHeight = params.height,
		srcWidth = image.width,
		srcHeight = image.height;

	// treat formulas
	if ('string' == typeof dstWidth)
		dstWidth = utils.computeFormula(dstWidth, srcWidth);
	if ('string' == typeof dstHeight)
		dstHeight = utils.computeFormula(dstHeight, srcHeight);

	// treat null values
	if (null == dstWidth)  dstWidth  = 0;
	if (null == dstHeight) dstHeight = 0;

	// clamping and adjustments
	//  - 0 dest size is assigned to src size
	//  - negative dest size is src size - 2 * src size
	//  - clamp upscale
	if (0 === dstWidth)
		dstWidth = srcWidth;
	else if (dstWidth < 0)
		dstWidth = srcWidth + 2 * dstWidth;
	else if (dstWidth > srcWidth)
		dstWidth = srcWidth;
	if (0 === dstHeight)
		dstHeight = srcHeight;
	else if (dstHeight < 0)
		dstHeight = srcHeight + 2 * dstHeight;
	else if (dstHeight > srcHeight)
		dstHeight = srcHeight;

	// ratio constraints applied to the smaller size
	var ratio = srcWidth / srcHeight;
	if (dstWidth / srcWidth <= dstHeight / srcHeight)
		dstHeight = dstWidth / ratio;
	else
		dstWidth = dstHeight * ratio;

	// rounding
	dstWidth = Math.round(dstWidth);
	dstHeight = Math.round(dstHeight);

	// assign new values
	params.width = dstWidth;
	params.height = dstHeight;
};

/**
 * Crop constraints hook.
 * Applies default constraints to given `width`, `height`, `x`, `y` and `anchor` for a crop operation.
 * It ensures that cropping is centered when no `x`, `y` and `anchor` are provided and clamps the region to the image size.
 * if `anchor` is specified without `x` and `y`, it deducts those values from original image size.
 * If `x` and `y` are specified without `anchor`, it crops taking `x` and `y` as center.
 * If `anchor`, `x` and `y` are specified, it crops taking `x` and `y` as reference point. Cropping direction is then
 * deducted from `anchor`.
 * It lets the user customize how constraints are computed by RIBS.
 *
 * @param {object} params - Parameters to hook.
 * @param {(number|string)} params.width - Width after crop.
 * @param {(number|string)} params.height - Height after crop.
 * @param {(number|string)} params.x - x coordinate from where to crop.
 * @param {(number|string)} params.y - y coordinate from where to crop.
 * @param {(string)} params.anchor - Anchor point form where to crop.
 * @param {(string)} params.mode - Mode of crop.
 * @param {image} image - Image to process.
 */
hooks.cropConstraintsHook = function(params, image) {
	var dstWidth = params.width,
		dstHeight = params.height,
		anchor = params.anchor,
		mode = params.mode,
		srcWidth = image.width,
		srcHeight = image.height;

	// treat formulas
	if ('string' == typeof dstWidth)
		dstWidth = utils.computeFormula(dstWidth, srcWidth);
	if ('string' == typeof dstHeight)
		dstHeight = utils.computeFormula(dstHeight, srcHeight);
	if ('string' == typeof params.x)
		params.x = utils.computeFormula(params.x, srcHeight);
	if ('string' == typeof params.y)
		params.y = utils.computeFormula(params.y, srcHeight);

	// treat possible null values
	if (null == dstWidth)  dstWidth  = 0;
	if (null == dstHeight) dstHeight = 0;
	if (null == params.x) params.x = 0;
	if (null == params.y) params.y = 0;

	// compute anchor point coordinates
	if (anchor && 0 === params.x && 0 === params.y)
		utils.computeAnchor(anchor, srcWidth, srcHeight, params);

	// default mode to anchor value to avoid useless repetition
	if (anchor && !mode) mode = anchor;

	// compute crop region origin
	if (mode)
		utils.computeRegionOrigin(mode, dstWidth, dstHeight, params.x, params.y, params);

	// adjustments
	//  - 0 dest size is assigned to src size
	//  - negative dest size is src size - 2 * src size
	if (0 === dstWidth)
		dstWidth = srcWidth;
	else if (dstWidth < 0)
		dstWidth = srcWidth + 2 * dstWidth;
	else if (dstWidth > srcWidth)
		dstWidth = srcWidth;
	if (0 === dstHeight)
		dstHeight = srcHeight;
	else if (dstHeight < 0)
		dstHeight = srcHeight + 2 * dstHeight;
	else if (dstHeight > srcHeight)
		dstHeight = srcHeight;

	// clamping
	params.x = utils.clamp(params.x, 0, srcWidth - 1);
	params.y = utils.clamp(params.y, 0, srcHeight - 1);
	dstWidth = utils.clamp(params.x + dstWidth, 0, srcWidth) - params.x;
	dstHeight = utils.clamp(params.y + dstHeight, 0, srcHeight) - params.y;

	// rounding
	dstWidth = Math.round(dstWidth);
	dstHeight = Math.round(dstHeight);
	params.x = Math.round(params.x);
	params.y = Math.round(params.y);

	// assign new values
	params.width = dstWidth;
	params.height = dstHeight;
};

/**
 * Export.
 */

module.exports = hooks;