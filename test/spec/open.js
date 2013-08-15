/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	chai = require('chai'),
	should = chai.should();

/**
 * Tests constants.
 */

var FILENAME_SRC = __dirname + '/../fixtures/in.png';

/**
 * Test suite.
 */

describe('open operation', function() {
	it('should accept a filename', function() {
		(function() {
			ribs.open(FILENAME_SRC);
		}).should.not.throw();
	});

	it('should throw an error for invalid arguments', function() {
		(function() {
			ribs.open(0);
		}).should.throw('filename should be a string');
		(function() {
			ribs.open();
		}).should.throw('filename should not be null nor undefined');
	});

	it('should return ribs for chaining', function() {
		var ret = ribs.open(FILENAME_SRC);
		ret.should.equal(ribs);
	});

	it('should be aliased to ribs', function() {
		(function() {
			ribs(FILENAME_SRC);
		}).should.not.throw();
	});
});