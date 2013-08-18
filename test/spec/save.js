/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

'use strict';
process.env.NODE_ENV = 'test';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	chai = require('chai'),
	should = chai.should();

/**
 * Tests constants.
 */

var FILENAME_SRC = __dirname + '/../fixtures/in.png',
	FILENAME_DST = __dirname + '/../fixtures/out.png';

/**
 * Test suite.
 */

xdescribe('save operation', function() {
	it('should open and save to the given filename with open was not previously called', function() {
		(function() {
			ribs.save(FILENAME_DST);
		}).should.throw('open was not called');
	});

//	it('should accept a filename', function() {
//		(function() {
//			ribs.open(FILENAME_SRC);
//		}).should.not.throw();
//	});
//
//	it('should return ribs for chaining', function() {
//		var ret = ribs.open(FILENAME_SRC);
//		ret.should.equal(ribs);
//	});
//
//	it('should be aliased to ribs', function() {
//		(function() {
//			ribs(FILENAME_SRC);
//		}).should.not.throw();
//	});
});