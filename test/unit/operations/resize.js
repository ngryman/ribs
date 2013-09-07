/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var open = require('../../../lib/operations/open'),
	resize = require('../../../lib/operations/resize'),
	Image = require('../../../lib').Image;

/**
 * Tests constants.
 */

var W = 16,
	H = 9,
	W_2 = W / 2,
	H_2 = H / 2 << 0;

/**
 * Tests helper functions.
 */

var testResize = curry(function(params, expectedErr, expectedWidth, expectedHeight, done) {
	open('../fixtures/in-24-a.png', function(err, image) {
		resize(params, image, function(err, image) {
			if (expectedErr) {
				err.should.be.instanceof(Error);
				err.message.should.equal(expectedErr);
			}
			else {
				should.not.exist(err);
			}
			image.should.be.instanceof(Image);
			image.should.have.property('width', expectedWidth);
			image.should.have.property('height', expectedHeight);
			done();
		});
	});
});

var testMatrix = curry(function(expect, width, height, done) {
	optify({ width: width, height: height }, function(opts, i, done) {
		testResize(opts, null, expect[i * 2], expect[(i + 1) * 2], done);
	}, done);
});

// TODO check pixel data

/**
 * Test suite.
 */

describe('resize operation', function() {
	it('should resize to given width and height', testResize({
		width: W_2,
		height: H_2
	}, null, W_2, H_2));

	it('should resize to given width and height when strings are specified', testResize({
		width: W_2.toString(),
		height: H_2.toString()
	}, null, W_2, H_2));

	it('should not upscale when superior sizes are specified', testMatrix([
		W, H,
		W, H,
		W, H
	], W * 2, H * 2));

	it('should keep aspect ratio when sizes compute to a different aspect ratio', testMatrix([
		W_2, H_2,
		W_2, H_2,
		W_2, H_2
	], W_2, H_2));
	
	it('should keep aspect ratio relative to the smaller size', testMatrix([
		53, 30,
		80, 45,
		53, 30
	], W / 3 << 0, H_2));

	it('should add a padding to source size given a negative value', testMatrix([
		W - 20, 80,
		124, H - 20,
		124, H - 20
	], -10, -10));

	it('should add a padding to source size given a string negative value', testResize({
		width: '-10',
		height: '-10'
	}, null, 124, H - 20));

	it('should add a padding to a constant given a 2-op subtraction', testMatrix([
		80, 45,
		142, 80,
		80, 45
	], '100-10', '100-10'));

	it('should resize to the given percentage of source size', testMatrix([
		W_2, H_2,
		48, 27,
		48, 27
	], 'x50', 'x30'));

	it('should resize to the given percentage of a constant', testMatrix([
		50, 28,
		89, 50,
		50, 28
	], '100x50', '100x50'));

	it('should add a margin to source size given a addition', testMatrix([
		W, H,
		W, H,
		W, H
	], 'a50', 'a50'));

	it('should add a margin to a constant given a 2-op addition', testMatrix([
		150, 84,
		W, H,
		150, 84
	], '100a50', '100a50'));

	it('should round down source size to a given multiple', testMatrix([
		150, 84,
		89, 50,
		107, 60
	], 'r50', 'r50'));

	it('should round down a constant to a given multiple', testMatrix([
		107, 60,
		107, 60,
		107, 60
	], '100r50', '100r50'));

	it('should do nothing when both sizes are null', testResize({
		width: null,
		height: null
	}, null, W, H));

	it('should do nothing when both params is null', testResize(null, null, W, H));

	it('should pass an error when width is not valid', testResize({
		width: 'woot'
	}, 'width has an invalid value', W, H));

	it('should pass an error when height is not valid', testResize({
		height: 'woot'
	}, 'height has an invalid value', W, H));

	it('should pass an error when width has an invalid type', testResize({
		width: { 0 : 0 }
	}, 'width should a string or number', W, H));

	it('should pass an error when height has an invalid type', testResize({
		height: { 0 : 0 }
	}, 'height should a string or number', W, H));
});