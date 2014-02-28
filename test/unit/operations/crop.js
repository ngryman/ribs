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
	hooks = require('../../../lib/hooks'),
	Pipeline = require('../../../lib/pipeline'),
	Image = require('../../..').Image,
	path = require('path');

/**
 * Tests constants.
 */

var SRC_IMAGE = path.resolve(__dirname + '/../../fixtures/0124.png'),
	W = 8,
	H = 8,
	W_2 = W / 2,
	H_2 = H / 2,
	LANDMARKS = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l', [W / 3 | 0, H / 2]],
	ANCHORS = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l'],
	SIZES = [[W_2, H_2], [W * 2, H * 2]];

/**
 * Tests helper functions.
 */

var testCropParams = helpers.testOperationParams(crop);
var testCropImage = helpers.testOperationImage(crop, {});
var testCropNext = helpers.testOperationNext(crop, {});

var testCrop = curry(function(params, expectedErr, expectedWidth, expectedHeight, done) {
	open(SRC_IMAGE, function(err, image) {
		should.not.exist(err);

		// adds a reference to pipeline hooks (mimic pipeline behavior)
		if (params) params.hooks = Pipeline.hooks;

		crop(params, image, function(err, image) {
			if (expectedErr) {
				helpers.checkError(err, expectedErr);
			}
			else {
				should.not.exist(err);
			}

			image.should.be.instanceof(Image);
			image.should.have.property('width', Math.min(expectedWidth, image.width));
			image.should.have.property('height', Math.min(expectedHeight, image.height));
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
		testCrop(opts, null, expect[i * 2], expect[i * 2 + 1])(done);
	}, function() {
		// indirection here because optify passes the resulting matrix as argument.
		// mocha then thinks it's an error.
		done();
	});
});

/**
 * Test suite.
 */

describe('crop operation', function() {
	before(function() {
		Pipeline.hook('crop', 'constraints', hooks.cropConstraintsHook);
	});

	describe('(params, image, next)', function() {
		it('should fail when params has an invalid type', testCropParams(
			'', ['string', 'object'], true, null
		));

		it('should do nothing when params is null', testCrop(null, null, W, H));

		it('should fail when params.width has an invalid type', testCropParams(
			'width', ['number', 'string'], true, {}
		));

		it('should fail when params.height has an invalid type', testCropParams(
			'height', ['number', 'string'], true, {}
		));

		it('should fail when params.x has an invalid type', testCropParams(
			'x', ['number', 'string'], true, {}
		));

		it('should fail when params.y has an invalid type', testCropParams(
			'y', ['number', 'string'], true, {}
		));

		it('should fail when params.anchor has an invalid type', testCropParams(
			'anchor', ['string'], true, {}
		));

		it('should fail when params.mode has an invalid type', testCropParams(
			'mode', ['string'], true, {}
		));

		it('should fail when image has an invalid type', testCropImage());

		it('should fail when image is not an instance of Image', function(done) {
			crop({ width: W_2 }, {}, function(err) {
				helpers.checkError(err, 'invalid type: image should be an instance of Image');
				done();
			});
		});

		it('should do nothing when image is an empty image', function(done) {
			crop({ width: W_2 }, new Image(), function(err, image) {
				image.should.be.instanceof(Image);
				image.should.have.property('width', 0);
				image.should.have.property('height', 0);
				done();
			});
		});

		it('should fail when next has an invalid type', testCropNext());
	});

	describe('with scalar params', function() {
		it('should crop to given size from center', testCrop({
			width: W_2,
			height: H_2
		}, null, W_2, H_2));

		SIZES.forEach(function(size) {
			describe('for size "' + size + '"', function() {
				LANDMARKS.forEach(function(landmark) {
					it('should crop with landmark point "' + landmark + '" and each anchor', function(done) {
						var seq = ANCHORS.map(function(anchor) {
							return function(done) {
								var params = {
									width: size[0],
									height: size[1],
									anchor: anchor
								};

								if ('string' == typeof landmark) {
									params.landmark = landmark;
								}
								else {
									params.x = landmark[0];
									params.y = landmark[1];
								}

								testCrop(params, null, size[0], size[1], done);
							};
						});
						async.series(seq, done);
					});
				});
			});
		});
	});

	describe('with formulas params', function() {
		it('should crop to given size from center', testCrop({
			width: W_2.toString(),
			height: H_2.toString()
		}, null, W_2, H_2));

		it('should add a padding to source size given a negative value', testMatrix([
			W - 2, H - 2,
			W, H - 2,
			W - 2, H
		], -1, -1));

		it('should add a padding to a given constant', testMatrix([
			W_2, H_2,
			W, H_2,
			W_2, H
		], '6-1', '6-1'));

		it('should crop to the given percentage of source size', testMatrix([
			W_2, 2,
			W, 2,
			W_2, H
		], 'x50', 'x30'));

		it('should crop to a given percentage of a constant', function(done) {
			testMatrix([
				3, 3,
				W, 3,
				3, H
			], '6x50', '6x50', done);
		});

		it('should add a margin to source size given a addition', testMatrix([
			W, H,
			W, H,
			W, H
		], 'a1', 'a1'));

		it('should add a margin to a given constant', testMatrix([
			5, 5,
			W, 5,
			5, H
		], '3a1', '3a1'));

		it('should round down source size to a given multiple', testMatrix([
			5, 5,
			W, 5,
			5, H
		], 'r5', 'r5'));

		it('should not resize if source size is a multiple', testMatrix([
			W, H,
			W, H,
			W, H
		], 'r4', 'r4'));

		it('should round down a constant to a given multiple', testMatrix([
			3, 3,
			W, 3,
			3, H
		], '5r3', '5r3'));

		it('should be cool with a complex formula', testMatrix([
			5, 5,
			W, 5,
			5, H
		], '-1x50-1a2', '-1x50-1a2'));
	});
});