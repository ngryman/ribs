/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bindings = require('./bindings'),
	Image = bindings.Image;

/**
 * Used by console.log and friends.
 *
 * @returns {string}
 */
Image.prototype.inspect = function() {
	return 'Image {width: ' + this.width +
		', height: ' + this.height +
		', channels: ' + this.channels +
		', length: ' + this.length + '}';
};

/**
 * Iterate over each pixel in left-right, top-bottom direction.
 *
 * @param callback - Callback invoked with each pixel.
 */
Image.prototype.each = function(callback) {
	for (var i = 0, len = this.length; i < len; i++)
		callback(this[i], i, this);
};

/**
 * Map over each pixel in left-right, top-bottom direction.
 *
 * @param callback - Callback invoked with each pixel. The return value will be assigned to the
 * current pixel.
 */
Image.prototype.map = function(callback) {
	for (var i = 0, len = this.length; i < len; i++)
		this[i] = callback(this[i], i, this) || this[i];
};

/**
 * Export.
 */

module.exports = Image;