/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var utils = require('../../lib/utils');

/**
 * Tests helper functions.
 */

var testFormula = curry(function(formula, expected, done) {
	try {
		var res = utils.computeFormula(formula);
	}
	catch (err) {
		err.message.should.equal(expected);
		return done();
	}

	res.should.equal(expected);

	done();
});

var testRegionOrigin = curry(function(mode, width, height, x, y, expectedX, expectedY, done) {
	if ('string' == x) {
		done = y;
	}

	var coords = { x: 100, y: 100 };

	try {
		utils.computeRegionOrigin(mode, width, height, x, y, coords);
	}
	catch (err) {
		err.message.should.equal(expectedX);
		return done();
	}

	coords.should.have.property('x').and.equal(expectedX);
	coords.should.have.property('y').and.equal(expectedY);

	done();
});

var testAnchor = curry(function(anchor, width, height, expectedX, expectedY, done) {
	if ('string' == expectedY) {
		done = expectedY;
	}

	var coords = { x: 100, y: 100 };

	try {
		utils.computeAnchor(anchor, width, height, coords);
	}
	catch (err) {
		err.message.should.equal(expectedX);
		return done();
	}

	coords.should.have.property('x').and.equal(expectedX);
	coords.should.have.property('y').and.equal(expectedY);

	done();
});

/**
 * Test suite.
 */

describe('utils', function() {
	describe('compute formulas', function() {
		it('should parse a string scalar', testFormula('100', 100));

		it('should parse a string negative scalar', testFormula('-100', -100));

		it('should deduct a scalar from a fixed scalar following box model', testFormula('100-10', 80));

		it('should deduct several scalars from a fixed scalar following box model', testFormula('100-10-10-5', 50));

		it('should take a percentage of a fixed scalar', testFormula('100x10', 10));

		it('should take several percentages of a fixed scalar', testFormula('100x10x10', 1));

		it('should return 0 when taking a percentage of an unexisting scalar', testFormula('x10', 0));

		it('should add a scalar to a fixed scalar following box model', testFormula('100a10', 120));

		it('should add several scalars to a fixed scalar following box model', testFormula('100a10a10a5', 150));

		it('should round down a fixed scalar to a multiple of a scalar', testFormula('100r66', 66));

		it('should round down a fixed scalar to a multiple of several scalars', testFormula('100r66r20', 60));

		it('should return 0 when passing null', testFormula(null, 0));

		it('should throw an error when passing an invalid value', testFormula('woot', 'invalid formula: woot'));
	});

	describe('compute region origin', function() {
		it('should return top left origin', testRegionOrigin('tl', 100, 100, 10, 10, 10, 10));
		it('should return top left origin', testRegionOrigin('lt', 100, 100, 10, 10, 10, 10));

		it('should return top origin', testRegionOrigin('t', 100, 100, 50, 50, 0, 50));

		it('should return top right origin', testRegionOrigin('tr', 100, 100, 50, 50, -50, 50));
		it('should return top right origin', testRegionOrigin('rt', 100, 100, 50, 50, -50, 50));

		it('should return right origin', testRegionOrigin('r', 100, 100, 50, 50, -50, 0));

		it('should return bottom right origin', testRegionOrigin('br', 100, 100, 50, 50, -50, -50));
		it('should return bottom right origin', testRegionOrigin('rb', 100, 100, 50, 50, -50, -50));

		it('should return bottom origin', testRegionOrigin('b', 100, 100, 50, 50, 0, -50));

		it('should return bottom left origin', testRegionOrigin('bl', 100, 100, 50, 50, 50, -50));
		it('should return bottom left origin', testRegionOrigin('lb', 100, 100, 50, 50, 50, -50));

		it('should return left origin', testRegionOrigin('l', 100, 100, 50, 50, 50, 0));

		it('should return center if anchor is empty', testRegionOrigin('', 100, 100, 50, 50, 0, 0));
		it('should return center if anchor is a number', testRegionOrigin(1337, 100, 100, 50, 50, 0, 0));
		it('should return center if anchor is invalid', testRegionOrigin('woot', 100, 100, 50, 50, 0, 0));
		it('should return center if anchor is invalid', testRegionOrigin('xy', 100, 100, 50, 50, 0, 0));
		it('should return center of a valid/invalid pair', testRegionOrigin('ab', 100, 100, 50, 50, 0, -50));
	});

	describe('compute anchor', function() {
		it('should return top left coordinates', testAnchor('tl', 100, 100, 0, 0));
		it('should return top left coordinates', testAnchor('lt', 100, 100, 0, 0));

		it('should return top coordinates', testAnchor('t', 100, 100, 50, 0));

		it('should return top right coordinates', testAnchor('tr', 100, 100, 100, 0));
		it('should return top right coordinates', testAnchor('rt', 100, 100, 100, 0));

		it('should return right coordinates', testAnchor('r', 100, 100, 100, 50));

		it('should return bottom right coordinates', testAnchor('br', 100, 100, 100, 100));
		it('should return bottom right coordinates', testAnchor('rb', 100, 100, 100, 100));

		it('should return bottom coordinates', testAnchor('b', 100, 100, 50, 100));

		it('should return bottom left coordinates', testAnchor('bl', 100, 100, 0, 100));
		it('should return bottom left coordinates', testAnchor('lb', 100, 100, 0, 100));

		it('should return left coordinates', testAnchor('l', 100, 100, 0, 50));

		it('should return center if anchor is empty', testAnchor('', 100, 100, 50, 50));
		it('should return center if anchor is a number', testAnchor(1337, 100, 100, 50, 50));
		it('should return center if anchor is invalid', testAnchor('woot', 100, 100, 50, 50));
		it('should return center if anchor is invalid', testAnchor('xy', 100, 100, 50, 50));
		it('should return center of a valid/invalid pair', testAnchor('ab', 100, 100, 50, 100));
	});
});