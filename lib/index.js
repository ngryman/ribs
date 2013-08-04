/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var impl = require('./bindings'),
	curry = require('curry'),
	utils = require('./utils'),
	check = utils.checkType;

/**
 * Ribs namespace and declarations.
 */

var ribs = { impl: impl },
	hooks = {};

/**
 *
 * @param {string} filename
 * @param {(number|string)} width
 * @param {(number|string|function)} height
 * @param {function|object|string} [callback]
 */
ribs.shrink = function(filename, width, height, callback) {
	// arguments juggling
	if ('function' == typeof height) {
		callback = height;
		height = 0;
	}

	// treats null sizes as zero
	width = width || 0;
	height = height || 0;

	// arguments type
	check('filename', filename, 'string');
	check('width', width, 'number', 'string');
	check('height', height, 'number', 'string');
	check('callback', callback, 'function', 'object', 'string');

	// hooks pipeline, *curried* with the destination size.
	// the native part has only to provide the original size to complete the call.
	var pipeline = hooksPipeline('shrink', filename, 4);
	var processor = curry(pipeline || shrinkHook)(width, height);

	// call implementation
	if ('function' == typeof callback) return this.impl.shrink(processor, filename, callback);
	return this.impl.shrinkStream(processor, filename, callback);
};

/**
 * Installs a hook for a given operation and filename pattern.
 *
 * @param {string} operation - Operation to which install the hook.
 * It can be one of the following values:
 *  - shrink
 * @param {RegExp} pattern - A regexp that apply the hook when matched with a filename. If `null` is specified, the
 * hook function will always be applied.
 * @param {Function} fn - The hook function that will be applied. Depending of the operation, the hook function
 * signature may depend. See each default hooks for more details.
 */
ribs.hook = function(operation, pattern, fn) {
	check('operation', operation, 'string');
	check('pattern', pattern, 'object');
	check('fn', fn, 'function');

	hooks[operation] = hooks[operation] || [];
	hooks[operation].push({ pattern: pattern, fn: fn });
};

/**
 * Produce a **hooks pipeline** which is basically a composed function of all matched hooks.
 *
 * @param operation
 * @param filename
 * @param arity
 * @returns {*}
 */
function hooksPipeline(operation, filename, arity) {
	if (!hooks[operation]) return null;

	var pipeline = hooks[operation]
		.filter(function(hook) {
			return (null == hook.pattern || hook.pattern.exec(filename));
		})
		.reduce(function(previous, current) {
			return function() {
				return current.fn.apply(this, arguments);
			}
		}, utils.noop);

	// wraps the top function with a well defined arity in order to curry later
	if (4 == arity) return function(a,b,c,d) { return pipeline.apply(this, arguments); };
	return pipeline;
}

/**
 * Shrink Hook.
 * Applies default constraints to given size of a shrink operation.
 * It ensures that aspect ratio is preserved and only allows downsampling (shrink).
 * This is called from the native part and lets the user customize how constraints are computed by RIBS.
 *
 * @param dstWidth
 * @param dstHeight
 * @param srcWidth
 * @param srcHeight
 */
function shrinkHook(dstWidth, dstHeight, srcWidth, srcHeight) {
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
}

/**
 * Install default hooks.
 */

ribs.hook('shrink', null, shrinkHook);

/**
 * Export
 */

module.exports = ribs;