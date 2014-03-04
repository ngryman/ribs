/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var operations = require('./operations'),
	defaultHooks = require('./hooks'),
	utils = require('./utils'),
	check = utils.checkType,
	Pipeline = require('./pipeline'),
	curry = require('curry'),
	Stream = require('stream').Duplex;

/**
 * Ribs front-end.
 *
 * TODO
 *
 * The pipeline is configured to have an *entry point* and an *exit point* (i.e. open and save).
 * An *entry point* will basically fetch image data, an *exit point* will save or transfer the result. We can see it as
 * an the *input* and the *output*.
 *
 * This behavior can be changed by directly manipulating the `Pipeline#queue`, but this is strongly discouraged, unless
 * you are a smart fool.
 *
 * @param src
 * @param {string|object} dst
 */

var ribs = function(src, dst) {
	var pipeline = new Pipeline();

	if (src) {
		pipeline.open(src);

		if (dst) {
			var done = pipeline.done;
			pipeline.done = function() {
				var params;

				if ('string' == typeof dst)
					params = { filename: dst };
				else
					params = dst;

				this.save(params);

				done.apply(this, arguments);
			};
		}
	}

	return pipeline;
};

/**
 * Private variables.
 */

/**
 *
 * @param filename
 */
ribs.open = function(filename) {
	var pipeline = new Pipeline();
	pipeline.open(filename);

	return pipeline;
};

///**
// *
// * @param filename
// */
//ribs.save = function(filename) {
//	// arguments type
//	check('filename', filename, true, 'string');
//
//	return ribs;
//};

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

	// treat null sizes as zero
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
 * Produces a *hooks pipeline* which is basically a composed function of all matched hooks.
 *
 * @param {string} operation - Operation hooks to pipeline.
 * @param {string} name - Hooks name to pipeline.
 * @param {string} filename - Filename to be matched.
 * @return {(function|*)} The pipeline.
 */
function hooksPipeline(operation, name, filename) {
//	var hooksPool = hooks[operation + ':' + name];
//	if (!hooksPool) return null;
//
//	var pipeline = hooksPool
//		.filter(function(hook) {
//			return (null == hook.pattern || !filename || hook.pattern.exec(filename));
//		})
//		.reduce(function(previous, current) {
//			return function() {
//				return current.fn.apply(this, arguments);
//			};
//		}, utils.noop);
//
//	// wraps the top function with a well defined arity in order to curry later
//	if (4 == hooksPool.arity) return function(a,b,c,d) { return pipeline.apply(this, arguments); };
//	return pipeline;
}

/**
 * Export.
 */

module.exports = ribs;
module.exports.Image = require('./image');
module.exports.Pipeline = Pipeline;
module.exports.operations = operations;