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
	defaultHooks = require('./hooks'),
	curry = require('curry'),
	utils = require('./utils'),
	check = utils.checkType;

/**
 * Ribs namespace & declarations.
 */

var ribs = { impl: impl },
	hooks = {};

/**
 * Shrink operation.
 * Resize an image to a given `width` and `height`, preserving aspect ratio and ensuring that we only downscale it.
 *
 * Its role is to provide a ease of use by exposing multiple overrides and wrapping the native implementation.
 * It does the nasty job of arguments juggling and checking before forwarding to native.
 *
 * By default, it applies all constraints listed above. This can be changed or enhanced via *hooks*.
 * The only *hook* for this operation is the **constraints hook** which can be installed like this:
 *  `ribs.hook('shrink', 'constraints', pattern, hook);
 *
 * See hooks for more information.
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
	var pipeline = hooksPipeline('shrink', 'constraints', filename);
	var processor = curry(pipeline || defaultHooks.shrinkConstraintsHook)(width, height);

	// call implementation
	if ('function' == typeof callback) return this.impl.shrink(processor, filename, callback);
	return this.impl.shrinkStream(processor, filename, callback);
};

/**
 * Installs a hook for a given operation and filename pattern.
 *
 * @param {string} operation - Operation for which the hook will be installed.
 * This can be one of the following values:
 *  - shrink
 * @param {string} name - Hook name. Each operation can have multiple hooks for different purpose. Depending of the
 * operation, this can be one of the following values:
 *  - constraints
 * @param {RegExp} pattern - A `regexp` that apply the hook when matched with a filename. If `null` is specified, the
 * hook function will always be applied.
 * @param {Function} hook - The hook function that will be called. Depending on the operation, its signature may depend.
 * See each default hooks for more details.
 */
ribs.hook = function(operation, name, pattern, hook) {
	// arguments type
	check('operation', operation, 'string');
	check('name', name, 'string');
	check('pattern', pattern, 'object');
	check('hook', hook, 'function');

	// registers hook
	var key = operation + ':' + name;
	var hooksPool = (hooks[key] = hooks[key] || []);
	hooksPool.arity = hooksPool.arity || hook.length;
	hooks[key].push({ pattern: pattern, hook: hook });
};

/**
 * Produces a *hooks pipeline* which is basically a composed function of all matched hooks.
 *
 * @param {string} operation - Operation hooks to pipeline.
 * @param {string} name - Hooks name to pipeline.
 * @param {string} filename - Filename to be matched.
 * @return {(function|*)} The pipeline.
 */
function hooksPipeline(operation, name, filename) {
	var hooksPool = hooks[operation + ':' + name];
	if (!hooksPool) return null;

	var pipeline = hooksPool
		.filter(function(hook) {
			return (null == hook.pattern || hook.pattern.exec(filename));
		})
		.reduce(function(previous, current) {
			return function() {
				return current.fn.apply(this, arguments);
			}
		}, utils.noop);

	// wraps the top function with a well defined arity in order to curry later
	if (4 == hooksPool.arity) return function(a,b,c,d) { return pipeline.apply(this, arguments); };
	return pipeline;
}

/**
 * Export
 */

module.exports = ribs;