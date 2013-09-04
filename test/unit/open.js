/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var open = require('../../lib/operations/open');

/**
 * Tests constants.
 */

var PIXELS = [
	0xff, 0x00, 0x00, 0x00,
	0xff, 0xff, 0xff, 0xff,
	0xff, 0x00, 0x00, 0x00,
	0xff, 0xff, 0xff, 0xff
];

/**
 * Tests helper functions.
 */

var checkPixels = curry(function(expectedErr, done, err, image) {
	if (expectedErr) {
		err.should.be.instanceof(Error);
		err.message.should.equal(expectedErr);
	}
	else {
		should.not.exist(err);
		image.should.be.instanceof(Image);
		image.should.have.property('width', 2);
		image.should.have.property('height', 2);
		image.pixels.should.be.instanceof(Buffer);
		image.pixels.should.have.lengthOf(PIXELS.length);
		for (var i = 0, len = image.pixels.length; i < len; i++) {
			image.pixels[i].should.equal(PIXELS[i]);
		}
	}
	done();
});

var testOpen = curry(function(filename, expectedErr, done) {
	open('../fixtures/' + filename, checkPixels(expectedErr, done));
});

/**
 * Test suite.
 */

// TODO: see if all alternatives are (1) relevant, (2) possible
describe('open operation', function() {
	describe('with jpg files', function() {
		it('should open when 100% compressed', testOpen('in-q100.jpg', null));
		it('should open when 50% compressed', testOpen('in-q50.jpg', null));
		it('should open when 0% compressed', testOpen('in-q0.jpg', null));
		it('should open when progressive and 100% compressed', testOpen('in-q100-p.jpg', null));
		it('should open when progressive and 50% compressed', testOpen('in-q50-p.jpg', null));
		it('should open when progressive and 0% compressed', testOpen('in-q0-p.jpg', null));
		it('should open when optimized and 100% compressed', testOpen('in-q100-o.jpg', null));
		it('should open when optimized and 50% compressed', testOpen('in-q50-o.jpg', null));
		it('should open when optimized and 0% compressed', testOpen('in-q0-o.jpg', null));
	});

	describe('with png files', function() {
		it('should open 8-bit', testOpen('in-8.png', null));
		it('should open 8-bit with alpha channel', testOpen('in-8-a.png', null));
		it('should open 24-bit', testOpen('in-24.png', null));
		it('should open 24-bit with alpha channel', testOpen('in-24-a.png', null));
		it('should open interlaced 24-bit with alpha channel', testOpen('in-24-a-i.png', null));
	});

	describe('with gif files', function() {
		it('should open standard', testOpen('in.gif', null));
		it('should open with alpha channel', testOpen('in-a.gif', null));
		it('should open interlaced with alpha channel', testOpen('in-a-i.gif', null));
	});

	it('should pass an error when file is not found', testOpen('void', 'no such file or directory'));
	it('should pass an error when filename is not valid', testOpen(null, 'filename should not be null nor undefined'));
});