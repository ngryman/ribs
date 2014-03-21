/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var request = require('supertest'),
	express = require('express'),
	path = require('path'),
	ribs = require('../..');

/**
 * Tests constants.
 */

var ROOT_DIR = require('ribs-fixtures').path;

/**
 * Server init.
 */

var app = express();
app.use(ribs.middleware(ROOT_DIR));
app.use(express.static(ROOT_DIR));
app.use(express.errorHandler());

/**
 * Tests helpers.
 */

function binaryParser(res, callback) {
	res.setEncoding('binary');
	res.data = '';
	res.on('data', function (chunk) {
		res.data += chunk;
	});
	res.on('end', function () {
		callback(null, new Buffer(res.data, 'binary'));
	});
}

request.Test.prototype.expectImage = function(expect, done) {
	// default values
	expect.type = expect.type || 'bmp';
	expect.channels = expect.channels || 3;

	// mime type
	// special treatment for jpeg images: jpg extension != mime type jpeg
	var mimeType = expect.type;
	if ('jpeg' == mimeType)
		expect.type = 'jpg';

	// parse binary
	this.parse(binaryParser)
		// content type
		.expect('content-type', 'image/' + mimeType)
		// check sent image
		.expect(200, function(err, res) {
			if (err) return done(err);

			ribs(res.body).done(function(err, image) {
				should.not.exist(err);
				image.should.be.instanceof(Image);
				image.should.have.property('width', expect.width);
				image.should.have.property('height', expect.height);
				image.should.have.property('channels', expect.channels);
				image.should.have.property('originalFormat', expect.type);
				image.should.have.lengthOf(expect.width * expect.height * expect.channels);
				done();
			});
		});
};

/**
 * Test suite.
 */

describe('express middleware', function() {

	it('should serve an existing image', function(done) {
		request(app).get('/lena.bmp')
			.expect('content-type', 'image/bmp')
			.expect(200, done);
	});

	it('should send 404 for an unknown image', function(done) {
		request(app).get('/kahzix.pwn')
			.expect(404, done);
	});

	it('should send 404 for an unknown operation', function(done) {
		request(app).get('/rresize/100/lena.bmp')
			.expect(404, done);
	});

	it('should send a 400 for invalid parameters', function(done) {
		request(app).get('/resize/xxx/lena.bmp')
			.expect(400, done);
	});

	describe('resizing', function() {

		it('should accept short version', function(done) {
			request(app).get('/r/100/100/lena.bmp').expectImage({
				width: 100,
				height: 100
			}, done);
		});

		it('should handle no parameters', function(done) {
			request(app).get('/resize/lena.bmp').expectImage({
				width: 512,
				height: 512
			}, done);
		});

		it('should handle width', function(done) {
			request(app).get('/resize/100/lena.bmp').expectImage({
				width: 100,
				height: 100
			}, done);
		});

		it('should handle height', function(done) {
			request(app).get('/resize/0/100/lena.bmp').expectImage({
				width: 100,
				height: 100
			}, done);
		});

		it('should handle width & height', function(done) {
			request(app).get('/resize/200/100/lena.bmp').expectImage({
				width: 100,
				height: 100
			}, done);
		});

	});

	describe('cropping', function() {

		it('should accept short version', function(done) {
			request(app).get('/c/100/100/lena.bmp').expectImage({
				width: 100,
				height: 100
			}, done);
		});

		it('should handle no parameters', function(done) {
			request(app).get('/crop/lena.bmp').expectImage({
				width: 512,
				height: 512
			}, done);
		});

	});

	describe('transcoding', function() {

		it('should transcode to jpg', function(done) {
			request(app).get('/format/jpg/lena.bmp').expectImage({
				width: 512,
				height: 512,
				type: 'jpeg'
			}, done);
		});

	});

	describe('order', function() {

		it('should call operations in order', function(done) {
			request(app).get('/resize/-10/resize/x10/lena.bmp').expectImage({
				width: Math.round((512 - 20) / 10),
				height: Math.round((512 - 20) / 10)
			}, done);
		});

		it('should allow format not to be the last', function(done) {
			request(app).get('/format/jpg/resize/100/100/lena.bmp').expectImage({
				width: 100,
				height: 100,
				type: 'jpeg'
			}, done);
		});

	});

});
