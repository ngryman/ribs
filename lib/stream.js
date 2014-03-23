/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Duplex = require('stream').Duplex,
	PassThrough = require('stream').PassThrough,
	util = require('util');

function createStream(pipeline, params) {
	var stream = new RibsStream(params);

	params = params || {};
	params.dst = stream.outStream;

	pipeline
		.from(stream.inStream)
		.to(params)
		.done();

	var streamProto = Object.getPrototypeOf(stream),
		pipelineProto = Object.getPrototypeOf(pipeline);

	_.assign(streamProto, pipelineProto);

	// don't expose from and to
	delete streamProto.from;
	delete streamProto.to;

	return stream;
}

/**
 *
 * @constructor
 */

function RibsStream() {
	Duplex.call(this);

	this.inStream = new PassThrough();
	this.outStream = new PassThrough();
}

util.inherits(RibsStream, Duplex);

RibsStream.prototype._read = function(size) {
	this.outStream.on('finish', function() {
		var chunk;
		while (null != (chunk = this.outStream.read(size)))
			this.push(chunk);
		this.push(null);
	}.bind(this));
};

RibsStream.prototype._write = function(chunk, encoding, callback) {
	var ended = this.inStream.write(chunk, encoding, callback);
	if (ended) this.inStream.end();
};

/**
 * Module exports.
 */

module.exports.Stream = RibsStream;
module.exports.createStream = createStream;