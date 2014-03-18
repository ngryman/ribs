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
 * @param callback - Callback invoked with each color.
 */
Image.prototype.each = function(callback) {
	for (var i = 0, len = this.length; i < len; i++)
		callback(this[i], i, this);
};

/**
 *
 * @param callback
 */
Image.prototype.eachPixel = function(callback) {
	var pixel = {};
	for (var i = 0, len = this.length, channels = this.channels; i < len; i += channels) {
		pixel.r = this[i + 0];
		pixel.g = this[i + 1];
		pixel.b = this[i + 2];
		if (4 == channels)
			pixel.a = this[i + 3];

		callback(pixel, i, this);
	}
};

/**
 * Map over each pixel in left-right, top-bottom direction.
 *
 * @param callback - Callback invoked with each color. The return value will be assigned to the
 * current pixel.
 */
Image.prototype.map = function(callback) {
	for (var i = 0, len = this.length; i < len; i++)
		this[i] = callback(this[i], i, this) || this[i];
};

/**
 *
 * @param callback
 */
Image.prototype.mapPixel = function(callback) {
	var pixel = {};
	for (var i = 0, len = this.length, channels = this.channels; i < len; i += channels) {
		pixel.r = this[i + 0];
		pixel.g = this[i + 1];
		pixel.b = this[i + 2];
		if (4 == channels)
			pixel.a = this[i + 3];

		callback(pixel, i, this);

		this[i + 0] = pixel.r;
		this[i + 1] = pixel.g;
		this[i + 2] = pixel.b;
		if (4 == channels)
			this[i + 3] = pixel.a;
	}
};

/**
 * Export.
 */

module.exports = Image;