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

// TODO check pixel data

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
					describe('with landmark point "' + landmark + '"', function() {
						ANCHORS.forEach(function(anchor) {
							it('should crop with anchor "' + anchor + '"', function(done) {
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
							});
						});
					});
				});
			});
		});

//		it('should not upscale', testMatrix([
//			W, H,
//			W, H,
//			W, H
//		], W * 2, H * 2));
//
//		it('should keep aspect ratio relative to the smaller size', testMatrix([
//			W_3, H_3,
//			W_2, H_2,
//			W_3, H_3
//		], W_3, H_2));
//
//		it('should round floating values', testMatrix([
//			W_3, H_3,
//			W_3, H_3,
//			W_3, H_3
//		], W / 3, H / 3));
//
//		it('should add a padding to source size given a negative value', testMatrix([
//			W - 2, H - 2,
//			W - 2, H - 2,
//			W - 2, H - 2
//		], -1, -1));
//
//		it('should replace a 0 value with origin value', testMatrix([
//			W_2, H_2,
//			W_2, H_2,
//			W, H
//		], 0, H_2));
//
//		it('should do nothing when size is 0', testMatrix([
//			W, H,
//			W, H,
//			W, H
//		], 0, 0));
	});
//
//	it('should crop from center by default', testCrop({
//		width: W_2,
//		height: H_2
//	}, null, W_2, H_2));
//
//	it('should crop to given width and height when strings are specified', testCrop({
//		width: W_2.toString(),
//		height: H_2.toString()
//	}, null, W_2, H_2));
});