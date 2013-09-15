/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

/**
 * For now, color mapped images do not support alpha channel.
 * This has been addressed to Leptonica's developer.
 * He will probably add support for it in 1.70:
 *  - https://code.google.com/p/leptonica/issues/detail?id=82
 */

'use strict';

/**
 * Module dependencies.
 */

var open = require('../../../lib/operations/open'),
	Image = require('../../..').Image,
	raw = require('../../fixtures/raw'),
	fs = require('fs'),
	path = require('path');

/**
 * Tests constants.
 */

/**
 * Tests helper functions.
 */

var checkPixels = curry(function(filename, expectedErr, alpha, done, err, image) {
	if (expectedErr) {
		err.should.be.instanceof(Error);
		err.message.should.equal(expectedErr);
	}
	else {
		should.not.exist(err);
		image.should.be.instanceof(Image);
		image.should.have.property('width', 8);
		image.should.have.property('height', 8);
		image.should.have.lengthOf(image.width * image.height * 4);

		var pixels = raw(filename, alpha);
		for (var i = 0, len = image.length; i < len; i++) {
			image[i].should.equal(pixels[i]);
		}
	}
	done();
});

var testOpen = curry(function(filename, expectedErr, alpha, done) {
	if (filename) filename = path.join(__dirname, '..', '..', 'fixtures', filename);
	open(filename, checkPixels(filename, expectedErr, alpha, done));
});

/**
 * Test suite.
 */

// TODO: see if all alternatives are (1) relevant, (2) possible
describe('open operation', function() {
	describe('with jpg files', function() {
		it('should open when quality is 100%', testOpen('01100.jpg', null, false));
		it('should open when quality is 50%', testOpen('0150.jpg', null, false));
		it('should open when quality is 0%', testOpen('010.jpg', null, false));
		it('should open when progressive and quality is 100%', testOpen('01100p.jpg', null, false));
		it('should open when progressive and quality is 50%', testOpen('0150p.jpg', null, false));
		it('should open when progressive and quality is 0%', testOpen('010p.jpg', null, false));
		it('should open when optimized and quality is 100%', testOpen('01100o.jpg', null, false));
		it('should open when optimized and quality is 50%', testOpen('0150o.jpg', null, false));
		it('should open when optimized and quality is 0%', testOpen('010o.jpg', null, false));
	});

	describe('with png files', function() {
		it('should open 8-bit', testOpen('018.png', null, false));
//		it('should open 8-bit with alpha channel', testOpen('018-a.png', null, true));
//		it('should open interlaced 8-bit with alpha channel', testOpen('018-ai.png', null, true));
		it('should open 24-bit', testOpen('0124.png', null, false));
		it('should open 24-bit with alpha channel', testOpen('0124a.png', null, true));
		it('should open interlaced 24-bit with alpha channel', testOpen('0124ai.png', null, true));
	});

	describe('with gif files', function() {
		it('should open standard', testOpen('01.gif', null, false));
		it('should open interlaced', testOpen('01i.gif', null, false));
//		it('should open with alpha channel', testOpen('01a.gif', null, true));
//		it('should open interlaced with alpha channel', testOpen('01ai.gif', null, true));
	});

	it('should pass an error when filename is not valid', testOpen(null, 'filename should not be null nor undefined', false));
	it('should throw an error when next is not valid', function() {
		(function() {
			open(path.resolve(__dirname + '/../../fixtures/in.gif'), 'lolilol');
		}).should.throw('next should be a function');
	});

	// win32 leptonica does not support reading from memory, so it also handles reading from file
	// as it does not give any error info, we can't really distinguish i/o errors from decoding errors
	if ('win32' == process.platform) {
		it('should pass an error when file is not found', testOpen('/dev/null', "can't decode file: unknown image format", false));
	}
	else {
		it('should pass an error when file is not found', testOpen('/dev/null', "can't open file: no such file or directory", false));
	}
});