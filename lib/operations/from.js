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
 * @param {string} params - Parameters, filename or readable stream of the source image.
 * @param {function} next - Next function in the pipeline.
 */
function from(params, next) {
	// arguments type
	check('next', next, false, 'function');

	try {
		check('filename', params, false, 'string', 'object', 'array');

		// array to named arguments
		if (Array.isArray(params))
			params = params[0];

		// filename is a path, use readFile
		if ('string' == typeof params) {
			// open, decode and pass an image object to the next operation
			fs.readFile(params, function(err, data) {
				if (err) return next(err, null);
				if (!data || 0 === data.length)
					return next(new Error('empty file: ' + params), null);

				Image.decode(data, next);
			});
		}
		// filename is a readable stream, listen to events
		else if (params instanceof Readable || params instanceof Duplex) {
			var buffers = [];

			params.on('data', buffers.push.bind(buffers));
			params.on('end', function() {
				Image.decode(Buffer.concat(buffers), next);
			});
		}
		// filename is a buffer
		else if (params instanceof Buffer) {
			Image.decode(params, next);
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

Pipeline.add('from', from);

/**
 * Export.
 */

module.exports = from;