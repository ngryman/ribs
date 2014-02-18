/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var computeAnchor = require('../../lib/utils').computeAnchor;

/**
 * Tests helper functions.
 */

var testAnchor = curry(function(anchor, width, height, expectedX, expectedY, done) {
	if ('string' == expectedY) {
		done = expectedY;
	}

	var coords = { x: 100, y: 100 };

	try {
		computeAnchor(anchor, width, height, coords);
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

describe('formulas', function() {
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