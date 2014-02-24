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
	hooks = require('../../../lib/hooks'),
	Pipeline = require('../../../lib/pipeline'),
	Image = require('../../..').Image,
	path = require('path');

/**
 * Tests constants.
 */

var W = 8,
	H = 8,
	W_2 = W / 2,
	H_2 = H / 2 << 0;

/**
 * Tests helper functions.
 */

var testResize = curry(function(params, expectedErr, expectedWidth, expectedHeight, done) {
	var filename = path.join(__dirname, '..', '..', 'fixtures', '0124.png');
	open(filename, function(err, image) {
		should.not.exist(err);

		// adds a reference to pipeline hooks (mimic pipeline behavior)
		if (params) params.hooks = Pipeline.hooks;

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
var testMatrix = curry(function(expect, width, height, done) {
	expect.push(W, H);
	optify({ width: width, height: height }, function(opts, i, done) {
		testResize(opts, null, expect[i * 2], expect[i * 2 + 1])(done);
	}, function() {
		// indirection here because optify passes the resulting matrix as argument.
		// mocha then thinks it's an error.
		done();
	});
});

// TODO check pixel data

/**
 * Test suite.
 */

describe('resize operation', function() {
	before(function() {
		Pipeline.hook('resize', 'constraints', hooks.resizeConstraintsHook);
	});

	xit('should resize to given width and height', testResize({
		width: W_2,
		height: H_2
	}, null, W_2, H_2));

	xit('should resize to given width and height when strings are specified', testResize({
		width: W_2.toString(),
		height: H_2.toString()
	}, null, W_2, H_2));

	xit('should not upscale when superior sizes are specified', testMatrix([
		W, H,
		W, H,
		W, H
	], W * 2, H * 2));

	xit('should keep aspect ratio when sizes compute to a different aspect ratio', testMatrix([
		W_2, H_2,
		W_2, H_2,
		W_2, H_2
	], W_2, H_2));
	
	xit('should keep aspect ratio relative to the smaller size', testMatrix([
		W / 3 << 0, W / 3 << 0,
		H_2, H_2,
		W / 3 << 0, W / 3 << 0
	], W / 3 << 0, H_2));

	xit('should add a padding to source size given a negative value', testMatrix([
		W - 2, H - 2,
		W - 2, H - 2,
		W - 2, H - 2
	], -1, -1));

	xit('should add a padding to source size given a string negative value', testResize({
		width: '-1',
		height: '-1'
	}, null, W - 2, H - 2));

	xit('should add a padding to a constant given a 2-op subtraction', testMatrix([
		W_2, H_2,
		W_2, H_2,
		W_2, H_2
	], '6-1', '6-1'));

	xit('should resize to the given percentage of source size', testMatrix([
		2, 2,
		2, 2,
		4, 4
	], 'x50', 'x30'));

	xit('should resize to the given percentage of a constant', testMatrix([
		3, 3,
		3, 3,
		3, 3
	], '6x50', '6x50'));

	// TODO: this should really add a margin
	xit('should add a margin to source size given a addition', testMatrix([
		W, H,
		W, H,
		W, H
	], 'a1', 'a1'));

	xit('should add a margin to a constant given a 2-op addition', testMatrix([
		5, 5,
		5, 5,
		5, 5
	], '3a1', '3a1'));

	xit('should round down source size to a given multiple', testMatrix([
		5, 5,
		5, 5,
		5, 5
	], 'r5', 'r5'));

	xit('should not resize if source size is a multiple of a given round', testMatrix([
		W, H,
		W, H,
		W, H
	], 'r4', 'r4'));

	xit('should round down a constant to a given multiple', testMatrix([
		3, 3,
		3, 3,
		3, 3
	], '5r3', '5r3'));

	xit('should do nothing when both sizes are null', testResize({
		width: null,
		height: null
	}, null, W, H));

	it('should pass an error when params is null', testResize(null, 'params should not be null nor undefined', W, H));

	xit('should pass an error when width is not valid', testResize({
		width: 'woot'
	}, 'invalid formula: woot', W, H));

	xit('should pass an error when height is not valid', testResize({
		height: 'woot'
	}, 'invalid formula: woot', W, H));

	xit('should pass an error when width has an invalid type', testResize({
		width: { 0 : 0 }
	}, 'width should be a number or string', W, H));

	xit('should pass an error when height has an invalid type', testResize({
		height: { 0 : 0 }
	}, 'height should be a number or string', W, H));
});