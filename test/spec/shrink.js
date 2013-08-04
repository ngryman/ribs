/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	mock = require('../utils/bindings-mock'),
	chai = require('chai'),
	should = chai.should(),
	fs = require('fs'),
	Stream = require('stream').Duplex,
	curry = require('curry');

/**
 * Tests constants.
 */

var FILENAME = __dirname + '/../fixtures/in.png',
	WIDTH = 160,
	HEIGHT = 90,
	WIDTH_2 = WIDTH / 2,
	HEIGHT_2 = HEIGHT / 2,
	WIDTH_3 = WIDTH / 3,
	HEIGHT_3 = HEIGHT / 3;

/**
 * Tests helper functions.
 */

var checkCallback = curry(function(expectedWidth, expectedHeight, done, res) {
	res.width.should.be.a('number').and.equal(expectedWidth);
	res.height.should.be.a('number').and.equal(expectedHeight);
	res.data.should.be.an.instanceof(Buffer);
	res.data.length.should.be.above(0);
	done();
});

var checkSize = curry(function(width, height, expectedWidth, expectedHeight, done) {
	ribs.shrink(FILENAME, width, height, checkCallback(expectedWidth, expectedHeight, done));
});

/**
 * Mock implementation.
 */

mock.configure(WIDTH, HEIGHT);
ribs.impl = mock;

/**
 * Test suite.
 */

describe('shrink', function() {
	describe('overrides', function() {
		it('should take a width and height in pixel by default', function(done) {
			ribs.shrink(FILENAME, WIDTH_2, HEIGHT_2, checkCallback(WIDTH_2, HEIGHT_2, done));
		});

		it('should take a width if only one size parameter is specified', function(done) {
			ribs.shrink(FILENAME, WIDTH_2, checkCallback(WIDTH_2, HEIGHT_2, done));
		});

		it('should take a width and height as percentage', function(done) {
			ribs.shrink(FILENAME, '50%', '50%', checkCallback(WIDTH_2, HEIGHT_2, done));
		});

		it('should return a duplex stream by default', function() {
			var output = ribs.shrink(FILENAME, WIDTH_2, HEIGHT_2);
			output.should.be.instanceof(Stream);
		});

		it('should pass a buffer when a callback is specified', function(done) {
			ribs.shrink(FILENAME, WIDTH_2, HEIGHT_2, checkCallback(WIDTH_2, HEIGHT_2, done));
		});

		it('should return a duplex stream when a writable stream is specified', function() {
			var input = fs.createReadStream(FILENAME);
			var output = ribs.shrink(FILENAME, WIDTH_2, HEIGHT_2, input);
			output.should.be.instanceof(Stream);
		});

		it('should write to a file when a file name is specified', function() {
			ribs.shrink(FILENAME, WIDTH_2, HEIGHT_2, 'out.png');
		});
	});

	describe('with number arguments', function() {
		it('should shrink to the given width and height', checkSize(WIDTH_2, HEIGHT_2, WIDTH_2, HEIGHT_2));
		it('should not upper scale', checkSize(WIDTH * 2, HEIGHT * 2, WIDTH, HEIGHT));
		it('should shrink to the given width keeping aspect ratio', checkSize(WIDTH_2, null, WIDTH_2, HEIGHT_2));
		it('should shrink to the given height keeping aspect ratio', checkSize(null, HEIGHT_2, WIDTH_2, HEIGHT_2));
		it('should shrink to the smallest argument keeping aspect ratio', checkSize(WIDTH_3, HEIGHT_2, WIDTH_3, HEIGHT_3));
		it('should not shrink if no param is specified', checkSize(null, null, WIDTH, HEIGHT));
	});

	describe('with percentage arguments', function() {
		it('should shrink to the given width and height', checkSize('50%', '50%', WIDTH_2, HEIGHT_2));
		it('should not upper scale', checkSize('200%', '200%', WIDTH, HEIGHT));
		it('should shrink to the given width keeping aspect ratio', checkSize('50%', null, WIDTH_2, HEIGHT_2));
		it('should shrink to the given height keeping aspect ratio', checkSize(null, '50%', WIDTH_2, HEIGHT_2));
		it('should shrink to the smallest argument keeping aspect ratio', checkSize('33%', '50%', WIDTH_3, HEIGHT_3));
	});

	describe('with invalid arguments', function() {
		it('should not shrink if no param is specified', checkSize(null, null, WIDTH, HEIGHT));
	});

	describe('processed image', function() {
		it('should be a duplex stream by default', function() {
			var output = ribs.shrink(FILENAME, 320, 200);
			output.is.instanceof(Stream);
		});

		it('should be a buffer when a callback is specified', function(done) {
			ribs.shrink(FILENAME, 320, 200, function(buffer) {
				buffer.is.instanceof(Buffer);
				done();
			});
		});

		it('should be a duplex stream when a stream is specified', function() {
			var input = fs.createReadStream('in.png');
			var output = ribs.shrink(FILENAME, 320, 200, input);
			output.is.instanceof(Stream);
		});

		it('should be written to a file when a file name is specified', function(done) {
			ribs.shrink(FILENAME, 320, 200, 'out.png');
			fs.exists('out.png', function(exists) {
				exists.should.be.truthy;
				done();
			});
		});
	});
});