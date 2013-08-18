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
	operations = require('./operations'),
	defaultHooks = require('./hooks'),
	curry = require('curry'),
	utils = require('./utils'),
	check = utils.checkType,
	Pipeline = require('./pipeline'),
	Stream = require('stream').Duplex;

/**
 * Ribs namespace.
 */

var ribs = function() { return ribs.open.apply(ribs, arguments); };

/**
 * Private variables.
 */
var hooks = {};

/**
 *
 * @param filename
 */
ribs.open = function(filename) {
	return new Pipeline(filename);
};

/**
 *
 * @param filename
 */
ribs.save = function(filename) {
	// arguments type
	check('filename', filename, true, 'string');

	// ensure we have opened the file in the first place
	// if not, opens `filename` directly
	if (filename) {
		if (!current || !current[0] || 'open' != current[0].operation) {
			current.unshift({ operation: 'open', filename: filename });
		}
	}
	// if no filename was specified, take the one from the open operation
	else {
		// TODO
		return ribs;
	}

	return ribs;
};

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
 * @param {string|object} filename - Path or readable stream of the source image.
 * @param {number|string} width - Destination width of the image.
 * @param {number|string|function} height - Destination height of the image.
 * @param {function|string} [callback] - Function called on completion or path to the destination image.
 */
ribs.shrink = function(filename, options, callback) {
	// arguments juggling
	if ('function' == typeof options) {
		callback = options;
		options = {};
	}

	// stream mode?
	var hasStream = filename instanceof Stream || 'function' != typeof callback;

	// treats null sizes as zero
	options.width = options.width || 0;
	options.height = options.height || 0;

	// arguments type
	check('filename', filename, 'string', 'object');
	check('width', options.width, 'number', 'string');
	check('height', options.height, 'number', 'string');
	check('callback', callback, 'function', 'string');

	// hooks pipeline, *curried* with the destination size.
	// the native part has only to provide the original size to complete the call.
	var pipeline = hooksPipeline('shrink', 'constraints', hasStream && filename);
	var processor = curry(pipeline || defaultHooks.shrinkConstraintsHook)(options.width, options.height);

	// call implementation
	if (!hasStream) return this.impl.shrink(processor, filename, callback);
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
			return (null == hook.pattern || !filename || hook.pattern.exec(filename));
		})
		.reduce(function(previous, current) {
			return function() {
				return current.fn.apply(this, arguments);
			};
		}, utils.noop);

	// wraps the top function with a well defined arity in order to curry later
	if (4 == hooksPool.arity) return function(a,b,c,d) { return pipeline.apply(this, arguments); };
	return pipeline;
}

/**
 * Export.
 */

ribs.Image = impl.Image;
module.exports = ribs;