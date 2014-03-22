/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs'),
	Duplex = require('stream').Duplex,
	Readable = require('stream').Readable,
	Image = require('../image'),
	Pipeline = require('../pipeline'),
	utils = require('../utils'),
	check = utils.checkType;

/**
 *
 * @param {string} filename - Filename of a source image.
 * @param {function} next - Next function in the pipeline.
 */
function open(filename, next) {
	// arguments type
	check('next', next, false, 'function');

	try {
		check('filename', filename, false, 'string', 'object', 'array');

		// array to named arguments
		if (Array.isArray(filename))
			filename = filename[0];

		// filename is a path, use readFile
		if ('string' == typeof filename) {
			// open, decode and pass an image object to the next operation
			fs.readFile(filename, function(err, data) {
				if (err) return next(err, null);
				if (!data || 0 === data.length)
					return next(new Error('empty file: ' + filename), null);

				Image.decode(data, next);
			});
		}
		// filename is a readable stream, listen to events
		else if (filename instanceof Readable || filename instanceof Duplex) {
			var buffers = [];

			filename.on('data', buffers.push.bind(buffers));
			filename.on('end', function() {
				Image.decode(Buffer.concat(buffers), next);
			});
		}
		// filename is a buffer
		else if (filename instanceof Buffer) {
			Image.decode(filename, next);
		}
		else throw new Error('invalid filename');
	}
	catch (err) {
		return next(err, undefined);
	}
}

/**
 * Register operation.
 */

Pipeline.add('open', open);

/**
 * Export.
 */

module.exports = open;