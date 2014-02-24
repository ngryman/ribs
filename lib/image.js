/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
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
 * @returns {string}
 */
Image.prototype.inspect = function() {
	return 'Image {width: ' + this.width +
		', height: ' + this.height +
		', channels: ' + this.channels +
		', length: ' + this.length + '}';
};

/**
 * Export.
 */

module.exports = Image;