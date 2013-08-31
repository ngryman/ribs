/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	mock = require('../utils/ribs-mock'),
	chai = require('chai'),
	should = chai.should(),
	fs = require('fs'),
	Stream = require('stream').Duplex,
	curry = require('curry'),
	async = require('async');

/**
 * Tests constants.
 */

var FILENAME_SRC = __dirname + '/../fixtures/in.png',
	FILENAME_DST = __dirname + '/../fixtures/out.png',
	WIDTH = 160,
	HEIGHT = 90,
	WIDTH_2 = WIDTH / 2,
	HEIGHT_2 = HEIGHT / 2;

/**
 * Tests helper functions.
 */

var checkCallback = curry(function(expectedErr, expectedWidth, expectedHeight, done, err, res) {
	if (!expectedErr) {
		res.width.should.be.a('number').and.equal(expectedWidth);
		res.height.should.be.a('number').and.equal(expectedHeight);
		res.data.should.be.an.instanceof(Buffer);
		res.data.length.should.be.above(0);
	}
	else {
		err.should.be.instanceof(Error);
	}
	done();
});

var asyncCall = function(filename, width, height, expectedWidth, expectedHeight) {
	return function(callback) {
		ribs.shrink(filename, width, height, checkCallback(null, expectedWidth, expectedHeight, callback));
	};
};

/**
 * Mock implementation.
 */

mock.configure(WIDTH, HEIGHT);
ribs.impl = mock;

/**
 * Test suite.
 */

xdescribe('shrink operation', function() {
	var checkValidCallback = checkCallback(null);
	var checkCallbackSize_2 = checkValidCallback(WIDTH_2, HEIGHT_2);

	describe('arguments', function() {
		it('should accept width and height by default', function(done) {
			(function() {
				ribs.shrink(FILENAME_SRC, WIDTH_2, HEIGHT_2, checkCallbackSize_2(done));
			}).should.not.throw();
		});

		it('should accept width if there is only one number is given', function(done) {
			(function() {
				ribs.shrink(FILENAME_SRC, WIDTH_2, checkCallbackSize_2(done));
			}).should.not.throw();
		});

		it('should accept width and height as percentage', function(done) {
			(function() {
				ribs.shrink(FILENAME_SRC, '50%', '50%', checkCallbackSize_2(done));
			}).should.not.throw();
		});

		it('should accept a writable stream instead of a filename', function() {
			var input = fs.createReadStream(FILENAME_SRC);
			(function() {
				ribs.shrink(input, WIDTH_2, HEIGHT_2);
			}).should.not.throw();
		});

		it('should accept a filename instead of a callback', function() {
			(function() {
				ribs.shrink(FILENAME_SRC, WIDTH_2, HEIGHT_2, FILENAME_DST);
			}).should.not.throw();
		});
	});

	describe('return value', function() {
		it('should be undefined by default', function(done) {
			var ret = ribs.shrink(FILENAME_SRC, WIDTH_2, HEIGHT_2, function() {
				should.not.exist(ret);
				done();
			});
		});

		it('should be a duplex stream if no callback is given', function() {
			var ret = ribs.shrink(FILENAME_SRC, '50%', '50%');
			ret.should.be.instanceof(Stream);
		});

		it('should be a duplex stream if a writable stream is given', function() {
			var input = fs.createReadStream(FILENAME_SRC);
			var ret = ribs.shrink(input, '50%', '50%');
			ret.should.be.instanceof(Stream);
		});
	});

	describe('with valid values', function() {
		it('should shrink to the given width and height by default', function(done) {
			ribs.shrink(FILENAME_SRC, WIDTH_2, HEIGHT_2, checkCallbackSize_2(done));
		});

		it('should not upscale', function(done) {
			async.parallel([
				asyncCall(FILENAME_SRC, WIDTH * 2, HEIGHT * 2, WIDTH, HEIGHT),
				asyncCall(FILENAME_SRC, WIDTH * 2, HEIGHT, WIDTH, HEIGHT),
				asyncCall(FILENAME_SRC, WIDTH, HEIGHT * 2, WIDTH, HEIGHT)
			], done);
		});

		it('should keep aspect ratio', function(done) {
			async.parallel([
				asyncCall(FILENAME_SRC, WIDTH_2, null, WIDTH_2, HEIGHT_2),
				asyncCall(FILENAME_SRC, null, HEIGHT_2, WIDTH_2, HEIGHT_2),
				asyncCall(FILENAME_SRC, WIDTH_2, HEIGHT * 2, WIDTH_2, HEIGHT_2),
				asyncCall(FILENAME_SRC, WIDTH * 2, HEIGHT_2, WIDTH_2, HEIGHT_2)
			], done);
		});
	});

	describe('with invalid values', function() {
		it('should do nothing if null', function(done) {
			ribs.shrink(FILENAME_SRC, null, null, checkValidCallback(WIDTH, HEIGHT, done));
		});

		it('should throw an exception for invalid types', function() {
			(function() {
				ribs.shrink(0);
			}).should.throw('filename should be a string or object');
			(function() {
				ribs.shrink(FILENAME_SRC, {});
			}).should.throw('width should be a number or string');
			(function() {
				ribs.shrink(FILENAME_SRC, 0, {});
			}).should.throw('height should be a number or string');
			(function() {
				ribs.shrink(FILENAME_SRC, 0, 0, 0);
			}).should.throw('callback should be a function or string');
		});
	});
});