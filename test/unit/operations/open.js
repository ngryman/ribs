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
	path = require('path');

/**
 * Tests constants.
 */

var SRC_PATH = path.resolve(__dirname + '/../../fixtures/'),
	PIXELS = [
	false, false, false, false,
	false, true,  true,  true
];

/**
 * Tests helper functions.
 */

var checkPixels = _.curry(function(expectedErr, alpha, done, err, image) {
	if (expectedErr) {
		err.should.be.instanceof(Error);
		err.message.should.equal(expectedErr);
	}
	else {
		should.not.exist(err);
		image.should.be.instanceof(Image);
		image.should.have.property('width', 16);
		image.should.have.property('height', 9);
		image.should.have.lengthOf(image.width * image.height * 4);
		for (var i = 0, len = image.length; i < len; i++) {
			if (!alpha) {
				// because of compression, not every pixel is either deep black or white
				// instead we give 10% of error margin
				if (pixelAt(i, 16 * 4)) {
					image[i].should.be.above(255 * 0.9);
				}
				else {
					image[i].should.be.below(255 * 0.1);
				}
			}
			else {
				image[i].should.be.equal(0 == pixelPos(i, 16 * 4) ? 255 : 0);
			}
		}
	}
	done();
});

var testOpen = _.curry(function(filename, expectedErr, alpha, done) {
	if (filename) filename = path.join(SRC_PATH, filename);
	open(filename, checkPixels(expectedErr, alpha, done));
});

function pixelAt(i, stride) {
	return PIXELS[pixelPos(i, stride)];
}

function pixelPos(i, stride) {
	var offset = (i / stride << 0) % (stride * 2);
	return (i + offset * 4) % 8;
}

/**
 * Test suite.
 */

// TODO: see if all alternatives are (1) relevant, (2) possible
describe('open operation', function() {
	describe('with jpg files', function() {
		it('should open when 100% compressed', testOpen('in-q100.jpg', null, false));
		it('should open when 50% compressed', testOpen('in-q50.jpg', null, false));
		it('should open when 0% compressed', testOpen('in-q0.jpg', null, false));
		it('should open when progressive and 100% compressed', testOpen('in-q100-p.jpg', null, false));
		it('should open when progressive and 50% compressed', testOpen('in-q50-p.jpg', null, false));
		it('should open when progressive and 0% compressed', testOpen('in-q0-p.jpg', null, false));
		it('should open when optimized and 100% compressed', testOpen('in-q100-o.jpg', null, false));
		it('should open when optimized and 50% compressed', testOpen('in-q50-o.jpg', null, false));
		it('should open when optimized and 0% compressed', testOpen('in-q0-o.jpg', null, false));
	});

	describe('with png files', function() {
		it('should open 8-bit', testOpen('in-8.png', null, false));
//		it('should open 8-bit with alpha channel', testOpen('in-8-a.png', null, true));
//		it('should open interlaced 8-bit with alpha channel', testOpen('in-8-a-i.png', null, true));
		it('should open 24-bit', testOpen('in-24.png', null, false));
		it('should open 24-bit with alpha channel', testOpen('in-24-a.png', null, true));
		it('should open interlaced 24-bit with alpha channel', testOpen('in-24-a-i.png', null, true));
	});

	describe('with gif files', function() {
		it('should open standard', testOpen('in.gif', null, false));
//		it('should open with alpha channel', testOpen('in-a.gif', null, true));
//		it('should open interlaced with alpha channel', testOpen('in-a-i.gif', null, true));
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