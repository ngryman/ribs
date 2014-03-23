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
	from = ribs.operations.from,
	crop = ribs.operations.crop,
	path = require('path');

/**
 * Tests constants.
 */

var SRC_IMAGE = path.join(require('ribs-fixtures').path, '0124.png'),
	W = 8,
	H = 8,
	W_2 = W / 2,
	H_2 = H / 2,
	ANCHORS = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l', [W / 3 | 0, H / 2]],
	GRAVITY = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l'],
	SIZES = [[W_2, H_2], [W * 2, H * 2]],
	EXPECT = require('./crop-expect');

/**
 * Tests helper functions.
 */

var testParams = helpers.testOperationParams(crop);
var testImage = helpers.testOperationImage(crop, {});
var testNext = helpers.testOperationNext(crop, {});

var test = curry(function(params, expect, done) {
	from(SRC_IMAGE, function(err, image) {
		should.not.exist(err);

		var finalParams = crop(params, image, function(err, image) {
			if (expect.err)
				helpers.checkError(err, expect.err);
			else
				should.not.exist(err);

			image.should.be.instanceof(Image);

			if (finalParams) {
				finalParams.should.have.property('width', expect.width);
				finalParams.should.have.property('height', expect.height);
				finalParams.should.have.property('x', expect.x);
				finalParams.should.have.property('y', expect.y);

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
		test(opts, expect[i], done);
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
	describe('(params, hooks, image, next)', function() {
		it('should fail when params has an invalid type', testParams(
			'', ['string', 'number', 'object', 'array'], true, null
		));

		it('should accept params as a scalar', test(W_2, {
			width: W_2, height: H, x: 2, y: 0
		}));

		it('should accept params as a string', test(W_2.toString(), {
			width: W_2, height: H, x: 2, y: 0
		}));

		it('should accept params as an array', test([W_2, H_2], {
			width: W_2, height: H_2, x: 2, y: 2
		}));

		it('should do nothing when params is null', test(null, {
			width: W, height: H, x: 0, y: 0
		}));

		it('should fail when params.width has an invalid type', testParams(
			'width', ['number', 'string'], true, {}
		));

		it('should fail when params.height has an invalid type', testParams(
			'height', ['number', 'string'], true, {}
		));

		it('should fail when params.x has an invalid type', testParams(
			'x', ['number', 'string'], true, {}
		));

		it('should fail when params.y has an invalid type', testParams(
			'y', ['number', 'string'], true, {}
		));

		it('should fail when params.gravity has an invalid type', testParams(
			'gravity', ['string'], true, {}
		));

		it('should fail when params.anchor has an invalid type', testParams(
			'anchor', ['string'], true, {}
		));

		it('should fail when image has an invalid type', testImage());

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

		it('should fail when next has an invalid type', testNext());
	});

	describe('with scalar params', function() {
		it('should crop to given size from center', test({ width: W_2, height: H_2 }, {
			width: W_2, height: H_2, x: 2, y: 2
		}));

		SIZES.forEach(function(size) {
			describe('for size "' + size + '"', function() {
				ANCHORS.forEach(function(anchor) {
					it('should crop with anchor point "' + anchor + '" for each gravity values', function(done) {
						var seq = GRAVITY.map(function(gravity) {
							return function(done) {
								var params = {
									width: size[0],
									height: size[1],
									gravity: gravity
								}, anchorKey;

								if ('string' == typeof anchor) {
									params.anchor = anchor;
									anchorKey = anchor;
								}
								else {
									params.x = anchor[0];
									params.y = anchor[1];
									anchorKey = anchor[0];
								}

								test(params, EXPECT[size[0]][anchorKey][gravity], done);
							};
						});
						async.series(seq, done);
					});
				});
			});
		});
	});

	describe('with formulas params', function() {
		it('should crop to given size from center', test({
			width: W_2.toString(), height: H_2.toString()
		}, {
			width: W_2, height: H_2, x: 2, y: 2
		}));

		it('should add a padding to source size given a negative value', testMatrix({
			width: -1, height: -1
		}, [
			{ width: W - 2, height: H - 2 },
			{ width: W, height: H - 2 },
			{ width: W - 2, height: H }
		]));

		it('should add a padding to a given constant', testMatrix({
			width: '6-1', height: '6-1'
		}, [
			{ width: W_2, height: H_2 },
			{ width: W, height: H_2 },
			{ width: W_2, height: H }
		]));

		it('should crop to the given percentage of source size', testMatrix({
			width: 'x50', height: 'x50'
		}, [
			{ width: W_2, height: 2 },
			{ width: W, height: 2 },
			{ width: W_2, height: H }
		]));

		it('should crop to a given percentage of a constant', function(done) {
			testMatrix({
				width: '6x50', height: '6x50'
			}, [
				{ width: 3, height: 3 },
				{ width: W, height: 3 },
				{ width: 3, height: H }
			], done);
		});

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
			{ width: W, height: 5 },
			{ width: 5, height: H }
		]));

		it('should round down source size to a given multiple', testMatrix({
			width: '6-1', height: '6-1'
		}, [
			{ width: 5, height: 5 },
			{ width: W, height: 5 },
			{ width: 5, height: H }
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
			{ width: W, height: 3 },
			{ width: 3, height: H }
		]));

		it('should be cool with a complex formula', testMatrix({
			width: '-1x50-1a2', height: '-1x50-1a2'
		}, [
			{ width: 5, height: 5 },
			{ width: W, height: 5 },
			{ width: 5, height: H }
		]));
	});
});