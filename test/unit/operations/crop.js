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

var W = 8,
	H = 8,
	W_2 = W / 2,
	H_2 = H / 2,
	ANCHORS = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l', [W / 4, H / 4], [W / 4 * 3, H / 4 * 3]],
	DIRECTIONS = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l'],
	SIZES = [[W_2, H_2], [W, H], [2 * W, 2 * H]];

/**
 * Tests helper functions.
 */

var testCrop = curry(function(params, expectedErr, expectedWidth, expectedHeight, done) {
	var filename = path.join(__dirname, '..', '..', 'fixtures', '0124.png');
	open(filename, function(err, image) {
		should.not.exist(err);

		var originParams;

		// adds a reference to pipeline hooks (mimic pipeline behavior)
		if (params) {
			params.hooks = Pipeline.hooks;

			originParams = _.extend({}, params);

			// we test the minimum between original size and computed one.
			// However when original size is a falsy value, it is set to the original image size.
			originParams.width = originParams.width || image.width;
			originParams.height = originParams.height || image.height;
		}

		crop(params, image, function(err, image) {
			if (expectedErr) {
				err.should.be.instanceof(Error);
				err.message.should.equal(expectedErr);
			}
			else {
				should.not.exist(err);
				expectedWidth = Math.min(originParams.width, params.width);
				expectedHeight = Math.min(originParams.height, params.height);
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
	before(function() {
		Pipeline.hook('crop', 'constraints', hooks.cropConstraintsHook);
	});

	SIZES.forEach(function(size) {
		describe('for size "' + size + '"', function() {
			ANCHORS.forEach(function(anchor) {
				describe('with anchor "' + anchor + '"', function() {
					DIRECTIONS.forEach(function(direction) {
						it('should crop using "' + direction + '" direction', function(done) {
							var params = {
								width: size[0],
								height: size[1],
								mode: direction
							};

							if ('string' == typeof anchor) {
								params.anchor = anchor;
							}
							else {
								params.x = anchor[0];
								params.y = anchor[1];
							}

							testCrop(params, null, size[0], size[1], done);
						});
					});
				});
			});
		});
	});

	it('should crop from center by default', testCrop({
		width: W_2,
		height: H_2
	}, null, W_2, H_2));

	it('should crop to given width and height when strings are specified', testCrop({
		width: W_2.toString(),
		height: H_2.toString()
	}, null, W_2, H_2));

	it('should do nothing when both sizes are null', testCrop({
		width: null,
		height: null
	}, null, W, H));

	it('should pass an error when params is null', testCrop(null, 'params should not be null nor undefined', W, H));

	it('should pass an error when width is not valid', testCrop({
		width: 'woot'
	}, 'invalid formula: woot', W, H));

	it('should pass an error when height is not valid', testCrop({
		height: 'woot'
	}, 'invalid formula: woot', W, H));

	it('should pass an error when x is not valid', testCrop({
		x: 'woot'
	}, 'invalid formula: woot', W, H));

	it('should pass an error when y is not valid', testCrop({
		y: 'woot'
	}, 'invalid formula: woot', W, H));

	it('should pass an error when width has an invalid type', testCrop({
		width: { 0 : 0 }
	}, 'width should be a number or string', W, H));

	it('should pass an error when height has an invalid type', testCrop({
		height: { 0 : 0 }
	}, 'height should be a number or string', W, H));

	it('should pass an error when x has an invalid type', testCrop({
		x: { 0 : 0 }
	}, 'x should be a number or string', W, H));

	it('should pass an error when y has an invalid type', testCrop({
		y: { 0 : 0 }
	}, 'y should be a number or string', W, H));
});