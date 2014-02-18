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
	crop = require('../../../lib/operations/crop'),
	Pipeline = require('../../../lib/pipeline'),
	Image = require('../../..').Image,
	path = require('path');

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

var testCrop = function(params, expectedErr, expectedWidth, expectedHeight) {
	return function(done) {
		var filename = path.join(__dirname, '..', '..', 'fixtures', '0124.png');
		open(filename, function(err, image) {
			should.not.exist(err);

			// adds a reference to pipeline hooks (mimic pipeline behavior)
			params.hooks = Pipeline.hooks;

			crop(params, image, function(err, image) {
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
	};
};

/**
 *
 * @param expect
 * It should always defined so that the results will be in that order:
 *   [width    , height   ]
 *   [undefined, height   ]
 *   [width    , undefined]
 *   [undefined, undefined]
 *
 * As the last possibility is redundant, it append automatically expected values
 *
 * @param width
 * @param height
 * @returns {Function}
 */
var testMatrix = function(expect, width, height) {
	expect.push(W, H);

	return function(done) {
		optify({ width: width, height: height }, function(opts, i, done) {
			testCrop(opts, null, expect[i * 2], expect[i * 2 + 1], done);
		}, function() {
			// indirection here because optify passes the resulting matrix as argument.
			// mocha then thinks it's an error.
			done();
		});
	};
};

// TODO check pixel data

/**
 * Test suite.
 */

describe('crop operation', function() {
	it('should crop from center to given width and height', testCrop({
		width: W_2,
		height: H_2
	}, null, W_2, H_2));

	it('should crop to given width and height when strings are specified', testCrop({
		width: W_2.toString(),
		height: H_2.toString()
	}, null, W_2, H_2));
	
	it('should crop from given x and y to given width and height', testCrop({
		width: W_2,
		height: H_2,
		x: W / 4,
		y: H / 4 << 0
	}, null, W_2, H_2));

	it('should clamp crop area to the original size', testCrop({
		width: W_2,
		height: H_2,
		x: 0,
		y: 0
	}, null, W / 4, H / 4 << 0));

	xit('should clamp crop center to the original bounds', testCrop({
		width: W_2,
		height: H_2,
		x: W * 2,
		y: H * 2
	}, null, W / 4, H / 4 << 0));

	xit('should add a padding to source size given a negative value', testMatrix([
		W - 20, 80,
		124, H - 20,
		124, H - 20
	], -10, -10));

	xit('should add a padding to source size given a string negative value', testCrop({
		width: '-10',
		height: '-10'
	}, null, 124, H - 20));

	xit('should add a padding to a constant given a 2-op subtraction', testMatrix([
		80, 45,
		142, 80,
		80, 45
	], '100-10', '100-10'));

	xit('should crop to the given percentage of source size', testMatrix([
		W_2, H_2,
		48, 27,
		48, 27
	], 'x50', 'x30'));

	xit('should crop to the given percentage of a constant', testMatrix([
		50, 28,
		89, 50,
		50, 28
	], '100x50', '100x50'));

	xit('should add a margin to source size given a addition', testMatrix([
		W, H,
		W, H,
		W, H
	], 'a50', 'a50'));

	xit('should add a margin to a constant given a 2-op addition', testMatrix([
		150, 84,
		W, H,
		150, 84
	], '100a50', '100a50'));

	xit('should round down source size to a given multiple', testMatrix([
		150, 84,
		89, 50,
		107, 60
	], 'r50', 'r50'));

	xit('should round down a constant to a given multiple', testMatrix([
		107, 60,
		107, 60,
		107, 60
	], '100r50', '100r50'));

	xit('should do nothing when both sizes are null', testCrop({
		width: null,
		height: null
	}, null, W, H));

	xit('should do nothing when both params is null', testCrop(null, null, W, H));

	xit('should pass an error when width is not valid', testCrop({
		width: 'woot'
	}, 'width has an invalid value', W, H));

	xit('should pass an error when height is not valid', testCrop({
		height: 'woot'
	}, 'height has an invalid value', W, H));

	xit('should pass an error when x is not valid', testCrop({
		x: 'woot'
	}, 'x has an invalid value', W, H));

	xit('should pass an error when y is not valid', testCrop({
		y: 'woot'
	}, 'y has an invalid value', W, H));

	xit('should pass an error when width has an invalid type', testCrop({
		width: { 0 : 0 }
	}, 'width should a string or number', W, H));

	xit('should pass an error when height has an invalid type', testCrop({
		height: { 0 : 0 }
	}, 'height should a string or number', W, H));

	xit('should pass an error when x has an invalid type', testCrop({
		x: { 0 : 0 }
	}, 'x should a string or number', W, H));

	xit('should pass an error when y has an invalid type', testCrop({
		y: { 0 : 0 }
	}, 'y should a string or number', W, H));
});