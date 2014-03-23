/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../../..'),
	Image = ribs.Image,
	from = ribs.operations.from,
	raw = require('../../raw'),
	path = require('path'),
	fs = require('fs');

/**
 * Tests constants.
 */

var SRC_DIR = require('ribs-fixtures').path;

/**
 * Tests helper functions.
 */

var testParams = helpers.testOperationArg(from, [null], 0);

var test = curry(function(src, expectedErr, alpha, done) {
	if ('string' == typeof src && src && '/' != src[0]) {
		src = path.join(SRC_DIR, src);
	}
	else if ('function' == typeof src) {
		src = src();
	}
	else if (Array.isArray(src)) {
		src = path.join(SRC_DIR, src[0]);
	}

	from(src, checkPixels(src, expectedErr, alpha, done));
});

var checkPixels = _.curry(function(src, expectedErr, alpha, done, err, image) {
	if (expectedErr) {
		err.should.be.instanceof(Error);
		err.message.should.equal(expectedErr);
	}
	else {
		should.not.exist(err);
		image.should.be.instanceof(Image);
		image.should.have.property('width', 8);
		image.should.have.property('height', 8);
		image.should.have.property('channels', alpha ? 4 : 3);
		image.should.have.property('inputFormat', path.extname(src.path || src).slice(1));
		image.should.have.lengthOf(image.width * image.height * image.channels);

		var pixels = raw(src, alpha);
		for (var i = 0, len = image.length; i < len; i++) {
			image[i].should.equal(pixels[i]);
		}
	}
	done();
});

/**
 * Test suite.
 */

describe('from operation', function() {
	describe('(params, image, next)', function() {
		it('should fail when params has an invalid type', testParams(
			'params', ['string', 'object', 'array'], false
		));

		it('should accept params as an array', test(['0124.png'], null, false));

		it('should accept a buffer', test(
			function() {
				var filename = path.join(SRC_DIR, '0124.png');
				var buffer = fs.readFileSync(filename);
				// cheat
				buffer.path = filename;
				return buffer;
			}, null, false
		));

		it('should accept a readable stream', test(
			fs.createReadStream.bind(null, path.join(SRC_DIR, '0124.png')), null, false
		));

		it('should fail when file does not exists', test(
			'vaynerox',
			"ENOENT, open '"  + path.join(SRC_DIR, 'vaynerox') + "'",
			false
		));

		it('should fail when src is a path to an invalid image', function(done) {
			from('/dev/null', function(err) {
				helpers.checkError(err, 'empty file: /dev/null');
				done();
			});
		});

		it('should fail when next has an invalid type', function(done) {
			helpers.invalidTypes(['function'], false, function(arg, done) {
				try {
					from('/dev/null', arg);
				}
				catch (err) {
					helpers.checkTypeError(err, ['function'], 'next', arg);
					done();
				}
			}, done);
		});
	});

	describe('with jpg files', function() {
		it('should work when quality is 100%', test('01100.jpg', null, false));

		it('should work when quality is 50%', test('0150.jpg', null, false));

		it('should work when quality is 0%', test('010.jpg', null, false));

		it('should work when progressive and quality is 100%', test('01100p.jpg', null, false));

		it('should work when progressive and quality is 50%', test('0150p.jpg', null, false));

		it('should work when progressive and quality is 0%', test('010p.jpg', null, false));

		it('should work when optimized and quality is 100%', test('01100o.jpg', null, false));

		it('should work when optimized and quality is 50%', test('0150o.jpg', null, false));

		it('should work when optimized and quality is 0%', test('010o.jpg', null, false));
	});

	describe('with png files', function() {
		it('should work with 8-bit', test('018.png', null, false));

		// seems buggy for 8-bit PNG with alpha channel, posted a question here:
		//   http://answers.opencv.org/question/28220/alpha-channel-for-8-bit-png/
		xit('should work with 8-bit with alpha channel', test('018a.png', null, true));
		xit('should work with interlaced 8-bit with alpha channel', test('018-ai.png', null, true));

		it('should work with 24-bit', test('0124.png', null, false));

		it('should work with 24-bit with alpha channel', test('0124a.png', null, true));

		it('should work with interlaced 24-bit with alpha channel', test('0124ai.png', null, true));
	});

	// gif are not supported by OCV
	//   http://stackoverflow.com/questions/11494119/error-in-opencv-2-4-2-opencv-error-bad-flag
	xdescribe('with gif files', function() {
		it('should work with standard', test('01.gif', null, false));

		it('should work with interlaced', test('01i.gif', null, false));

		it('should work with with alpha channel', test('01a.gif', null, true));

		it('should work with interlaced with alpha channel', test('01ai.gif', null, true));
	});
});