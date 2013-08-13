/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var Stream = require('stream').Duplex;

/**
 * Bindings mock.
 */

var bindings = {};

/**
 *
 * @param hookChain
 * @param filename
 * @param callback
 */
bindings.shrink = function(hookChain, filename, callback) {
	// this should be called into the native part in order to compute the final size
	var size = hookChain(this.width, this.height);

	setImmediate(callback, null, {
		width: size.width,
		height: size.height,
		data: new Buffer(256)
	});
};

/**
 *
 * @param hookChain
 * @param filename
 * @param input
 */
bindings.shrinkStream = function(hookChain, filename, input) {
	return new Stream();
};

/**
 *
 * @param width
 * @param height
 */
bindings.configure = function(width, height) {
	this.width = width;
	this.height = height;
};

/**
 * Export.
 */

module.exports = bindings;