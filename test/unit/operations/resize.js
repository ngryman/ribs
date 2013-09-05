/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var resize = require('../../../lib/operations/resize');

/**
 * Tests constants.
 */

/**
 * Tests helper functions.
 */

var matrixTest = curry(function(expectations, size, done) {
	async.parallel([
		resize.bind(null, { width: size }),
		resize.bind(null, { height: size }),
		resize.bind(null, { width: size, height: size })
	], function(err, res) {
		res.forEach(function(r, i) {
			r.should.be.instanceof(Image);
			r.should.have.property('width', expectations[i * 2]);
			r.should.have.property('height', expectations[(i + 1) * 2]);
		});
		done();
	});
});

/**
 * Test suite.
 */

describe('resize operation', function() {
	it('should resize to given width and height', function(done) {
		ribs.shrink(FILENAME_SRC, WIDTH_2, HEIGHT_2, checkCallbackSize_2(done));
	});

	it('should resize to given width and height when strings are specified', function(done) {
		(function() {
			ribs.shrink(FILENAME_SRC, WIDTH_2.toString(), HEIGHT_2.toString(), checkCallbackSize_2(done));
		}).should.not.throw();
	});

	it('should not upscale when superior sizes are specified', function(done) {
		async.parallel([
			asyncCall(FILENAME_SRC, WIDTH * 2, HEIGHT * 2, WIDTH, HEIGHT),
			asyncCall(FILENAME_SRC, WIDTH * 2, HEIGHT, WIDTH, HEIGHT),
			asyncCall(FILENAME_SRC, WIDTH, HEIGHT * 2, WIDTH, HEIGHT)
		], done);
	});

	it('should keep aspect ratio when sizes compute to a different aspect ratio', function(done) {
		async.parallel([
			asyncCall(FILENAME_SRC, WIDTH_2, null, WIDTH_2, HEIGHT_2),
			asyncCall(FILENAME_SRC, null, HEIGHT_2, WIDTH_2, HEIGHT_2),
			asyncCall(FILENAME_SRC, WIDTH_2, HEIGHT * 2, WIDTH_2, HEIGHT_2),
			asyncCall(FILENAME_SRC, WIDTH * 2, HEIGHT_2, WIDTH_2, HEIGHT_2)
		], done);
	});

	it('should add a padding to source size given a negative value', matrixTest([
		WIDTH - 20, 79,
		124, HEIGHT - 20,
		124, HEIGHT - 20
	], -10, -10));

	it('should add a padding to source size given a string negative value', function(done) {
		async.parallel([
			asyncCall(FILENAME_SRC, '-10', '-10', 124, HEIGHT - 20)
		], done);
	});

	it('should add a padding to a constant given a 2-op subtraction', matrixTest([
		80, 0,
		80, 0,
		80, 0
	], '100-10'));

	it('should resize to the given percentage of source size', matrixTest([
		80, 0,
		80, 0,
		80, 0
	], 'x50'));

	it('should resize to the given percentage of a constant', matrixTest([
		50, 28,
		50, 28,
		50, 28
	],'100x50'));

	it('should add a margin to source size given a addition', matrixTest([
		150, 84,
		107, 60,
		107, 60
	], 'a50'));

	it('should add a margin to a constant given a 2-op addition', matrixTest([
		107, 60,
		107, 60,
		107, 60
	], '100a50'));

	it('should round down source size to a given multiple', matrixTest([
		150, 84,
		107, 60,
		107, 60
	], 'r50'));

	it('should round down a constant to a given multiple', matrixTest([
		107, 60,
		107, 60,
		107, 60
	], '100r50'));
});