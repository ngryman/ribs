/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var async = require('async'),
	curry = require('curry'),
	operations = require('./operations'),
	utils = require('./utils'),
	check = utils.checkType;

/**
 * The `Pipeline` object provides a unified API to hold and execute consecutive operations to be applied to an image.
 *
 * The idea here is *lazy evaluation*. This means that the user can chain multiple operation with the fluent API of RIBS
 * but only execute them when he decides. A *pipeline* will then execute every operations in order and asynchronously.
 * This has the advantage of *batching* file operations and avoid back and forth between disk and memory.
 *
 * A *pipeline* has a *entry point* and an *exit point*.
 * An *entry point* will basically fetch image data, an *exit point* will save or transfer the result. We can see it as
 * an the *input* and the *output*.
 *
 * The *entry point* is directly defined by instantiating a `Pipeline` and passing a `filename` or a `Stream`.
 *
 * @constructor
 */
function Pipeline(filename) {
	// contain a stack of operations to by applied in FIFO order
	this.stack = [];

	// push an `open` operation
	this.stack.push(async.apply(operations.open, filename));
}

/**
 *
 * @param callback
 */
Pipeline.prototype.done = function(callback) {
	// unleash the kraken!
	// it's dangerous, take this ascii sword
	//
	//   o()xxxx[{::::::::::::::::::::::::::>
	//
	async.waterfall(this.stack, function(err, image) {
		// we proxy callback to allow currying from outside
		// it seems that currying a function passed to the native side does not work correctly
		// even though it appears to make sense, and could probably be solved, i don't won't to waste time
//		setTimeout(callback.bind(this, err, image), 1500);
		callback(err, image);
	});
};

/**
 *
 */
Pipeline.prototype.clear = function() {
	this.stack.length = 0;
};

/**
 * Export.
 */

module.exports = Pipeline;