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

var SRC_IMAGE = path.resolve(__dirname + '/../../fixtures/0124.png'),
	W = 8, H = 8,
	W_2 = W / 2, H_2 = H / 2,
	W_3 = Math.round(W / 3), H_3 = Math.round(H / 3);

/**
 * Tests helper functions.
 */

var testResizeParams = helpers.testOperationParams(resize);
var testResizeImage = helpers.testOperationImage(resize, {});
var testResizeNext = helpers.testOperationNext(resize, {});

var testResize = curry(function(params, expectedErr, expectedWidth, expectedHeight, done) {
	open(SRC_IMAGE, function(err, image) {
		should.not.exist(err);

		// adds a reference to pipeline hooks (mimic pipeline behavior)
		if (params) params.hooks = Pipeline.hooks;

		resize(params, image, function(err, image) {
			if (expectedErr) {
				helpers.checkError(err, expectedErr);
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

	describe('(params, image, next)', function() {
		it('should fail when params has an invalid type', testResizeParams(
			'', ['string', 'object'], true, null
		));

		it('should do nothing when params is null', testResize(null, null, W, H));

		it('should fail when params.width has an invalid type', testResizeParams(
			'width', ['number', 'string'], true, {}
		));

		it('should fail when params.height has an invalid type', testResizeParams(
			'height', ['number', 'string'], true, {}
		));

		it('should fail when image has an invalid type', testResizeImage());

		it('should fail when image is not an instance of Image', function(done) {
			resize({ width: W_2 }, {}, function(err) {
				helpers.checkError(err, 'invalid type: image should be an instance of Image');
				done();
			});
		});

		it('should do nothing when image is an empty image', function(done) {
			resize({ width: W_2 }, new Image(), function(err, image) {
				image.should.be.instanceof(Image);
				image.should.have.property('width', 0);
				image.should.have.property('height', 0);
				done();
			});
		});

		it('should fail when next has an invalid type', testResizeNext());
	});

	describe('with scalar params', function() {
		it('should resize to given size', testResize({
			width: W_2,
			height: H_2
		}, null, W_2, H_2));

		it('should not upscale', testMatrix([
			W, H,
			W, H,
			W, H
		], W * 2, H * 2));

		it('should keep aspect ratio relative to the smaller size', testMatrix([
			W_3, H_3,
			W_2, H_2,
			W_3, H_3
		], W_3, H_2));

		it('should round floating values', testMatrix([
			W_3, H_3,
			W_3, H_3,
			W_3, H_3
		], W / 3, H / 3));

		it('should add a padding to source size given a negative value', testMatrix([
			W - 2, H - 2,
			W - 2, H - 2,
			W - 2, H - 2
		], -1, -1));

		it('should replace a 0 value with origin value', testMatrix([
			W_2, H_2,
			W_2, H_2,
			W, H
		], 0, H_2));

		it('should do nothing when size is 0', testMatrix([
			W, H,
			W, H,
			W, H
		], 0, 0));
	});

	describe('with formulas params', function() {
		it('should resize to given size', testResize({
			width: W_2.toString(),
			height: H_2.toString()
		}, null, W_2, H_2));

		it('should add a padding to source size given a negative value', testMatrix([
			W - 2, H - 2,
			W - 2, H - 2,
			W - 2, H - 2
		], -1, -1));

		it('should add a padding to a given constant', testMatrix([
			W_2, H_2,
			W_2, H_2,
			W_2, H_2
		], '6-1', '6-1'));

		it('should resize to the given percentage of source size', testMatrix([
			2, 2,
			2, 2,
			4, 4
		], 'x50', 'x30'));

		it('should resize to a given percentage of a constant', testMatrix([
			3, 3,
			3, 3,
			3, 3
		], '6x50', '6x50'));

		it('should add a margin to source size given a addition', testMatrix([
			W, H,
			W, H,
			W, H
		], 'a1', 'a1'));

		it('should add a margin to a given constant', testMatrix([
			5, 5,
			5, 5,
			5, 5
		], '3a1', '3a1'));

		it('should round down source size to a given multiple', testMatrix([
			5, 5,
			5, 5,
			5, 5
		], 'r5', 'r5'));

		it('should not resize if source size is a multiple', testMatrix([
			W, H,
			W, H,
			W, H
		], 'r4', 'r4'));

		it('should round down a constant to a given multiple', testMatrix([
			3, 3,
			3, 3,
			3, 3
		], '5r3', '5r3'));

		it('should be cool with a complex formula', testMatrix([
			5, 5,
			5, 5,
			5, 5
		], '-1x50-1a2', '-1x50-1a2'));
	});
});