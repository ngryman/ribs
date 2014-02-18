/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var computeFormula = require('../../lib/utils').computeFormula;

/**
 * Tests helper functions.
 */

var testFormula = curry(function(formula, expected, done) {
	try {
		var res = computeFormula(formula);
		res.should.equal(expected);
	}
	catch (err) {
		err.message.should.equal(expected);
	}

	done();
});

/**
 * Test suite.
 */

describe('formulas', function() {
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

	it('should throw an error when passing null', testFormula(null, 'invalid formula: null'));

	it('should throw an error when passing an invalid value', testFormula('woot', 'invalid formula: woot'));
});