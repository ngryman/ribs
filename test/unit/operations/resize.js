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
	open = ribs.operations.open,
	resize = ribs.operations.resize,
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

var testResize = curry(function(params, expect, done) {
	open(SRC_IMAGE, function(err, image) {
		should.not.exist(err);

		var finalParams = resize(params, image, function(err, image) {
			if (expect.err)
				helpers.checkError(err, expect.err);
			else
				should.not.exist(err);

			image.should.be.instanceof(Image);

			if (finalParams) {
				finalParams.should.have.property('width', expect.width);
				finalParams.should.have.property('height', expect.height);

				image.should.have.property('width', finalParams.width);
				image.should.have.property('height', finalParams.height);
			}

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
 * @param params
 * @param expect
 * @param done
 * @returns {function}
 */
var testMatrix = curry(function(params, expect, done) {
	expect.push({ width: W, height: H });

	optify(params, function(opts, i, done) {
		testResize(opts, expect[i], done);
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
	describe('(params, image, next)', function() {
		it('should fail when params has an invalid type', testResizeParams(
			'', ['string', 'number', 'object', 'array'], true, null
		));

		it('should accept params as a scalar', testResize(W_2, {
			width: W_2, height: H_2
		}));

		it('should accept params as a string', testResize(W_2.toString(), {
			width: W_2, height: H_2
		}));

		it('should accept params as an array', testResize([W_2, H_2], {
			width: W_2, height: H_2
		}));

		it('should do nothing when params is null', testResize(null, {
			width: W, height: H
		}));

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
		it('should resize to given size', testResize({ width: W_2, height: H_2 }, {
			width: W_2, height: H_2
		}));

		it('should not upscale', testMatrix({
			width: W * 2, height: H * 2
		}, [
			{ width: W, height: H },
			{ width: W, height: H },
			{ width: W, height: H }
		]));

		it('should keep aspect ratio relative to the smaller size', testMatrix({
			width: W_3, height: H_2
		}, [
			{ width: W_3, height: H_3 },
			{ width: W_2, height: H_2 },
			{ width: W_3, height: H_3 }
		]));

		it('should round floating values', testMatrix({
			width: W / 3, height: H / 3
		}, [
			{ width: W_3, height: H_3 },
			{ width: W_3, height: H_3 },
			{ width: W_3, height: H_3 }
		]));

		it('should add a padding to source size given a negative value', testMatrix({
			width: -1, height: -1
		}, [
			{ width: W - 2, height: H - 2 },
			{ width: W - 2, height: H - 2 },
			{ width: W - 2, height: H - 2 }
		]));

		it('should replace a 0 value with origin value', testMatrix({
			width: 0, height: H_2
		}, [
			{ width: W_2, height: H_2 },
			{ width: W_2, height: H_2 },
			{ width: W, height: H }
		]));

		it('should do nothing when size is 0', testMatrix({
			width: 0, height: 0
		}, [
			{ width: W, height: H },
			{ width: W, height: H },
			{ width: W, height: H }
		]));
	});

	describe('with formulas params', function() {
		it('should resize to given size', testResize({
			width: W_2.toString(), height: H_2.toString()
		}, {
			width: W_2.toString(), height: H_2.toString()
		}));

		it('should add a padding to source size given a negative value', testMatrix({
			width: -1, height: -1
		}, [
			{ width: W - 2, height: H - 2 },
			{ width: W - 2, height: H - 2 },
			{ width: W - 2, height: H - 2 }
		]));

		it('should add a padding to a given constant', testMatrix({
			width: '6-1', height: '6-1'
		}, [
			{ width: W_2, height: H_2 },
			{ width: W_2, height: H_2 },
			{ width: W_2, height: H_2 }
		]));

		it('should resize to the given percentage of source size', testMatrix({
			width: 'x50', height: 'x50'
		}, [
			{ width: 2, height: 2 },
			{ width: 2, height: 2 },
			{ width: 4, height: 4 }
		]));

		it('should resize to a given percentage of a constant', testMatrix({
			width: '6x50', height: '6x50'
		}, [
			{ width: 3, height: 3 },
			{ width: 3, height: 3 },
			{ width: 3, height: 3 }
		]));

		it('should add a margin to source size given a addition', testMatrix({
			width: 'a1', height: 'a1'
		}, [
			{ width: W, height: H },
			{ width: W, height: H },
			{ width: W, height: H }
		]));

		it('should add a margin to a given constant', testMatrix({
			width: '3a1', height: '3a1'
		}, [
			{ width: 5, height: 5 },
			{ width: 5, height: 5 },
			{ width: 5, height: 5 }
		]));

		it('should round down source size to a given multiple', testMatrix({
			width:'r5', height: 'r5'
		}, [
			{ width: 5, height: 5 },
			{ width: 5, height: 5 },
			{ width: 5, height: 5 }
		]));

		it('should not resize if source size is a multiple', testMatrix({
			width: 'r4', height: 'r4'
		}, [
			{ width: W, height: H },
			{ width: W, height: H },
			{ width: W, height: H }
		]));

		it('should round down a constant to a given multiple', testMatrix({
			width: '5r3', height: '5r3'
		}, [
			{ width: 3, height: 3 },
			{ width: 3, height: 3 },
			{ width: 3, height: 3 }
		]));

		it('should be cool with a complex formula', testMatrix({
			width: '-1x50-1a2', height: '-1x50-1a2'
		}, [
			{ width: 5, height: 5 },
			{ width: 5, height: 5 },
			{ width: 5, height: 5 }
		]));
	});
});