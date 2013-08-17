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
	Pipeline = require('../../lib/pipeline'),
	curry = require('curry'),
	chai = require('chai'),
	should = chai.should();

/**
 * Tests constants.
 */

var FILENAME_SRC = __dirname + '/../fixtures/in.png';

/**
 * Tests helper functions.
 */

var checkDone = curry(function(done, err, res) {
	should.not.exist(err);
	res.should.be.instanceof(Buffer);
	done();
});

var checkDoneErr = curry(function(trueErr, done, err) {
	err.should.be.instanceof(Error);
	err.message.should.have.string(trueErr);
	done();
});

/**
 * Test suite.
 */

describe('open operation', function() {
	it('should accept a filename', function(done) {
		ribs.open(FILENAME_SRC).done(checkDone(done));
	});

	it('should return a Pipeline for chaining', function() {
		var ret = ribs.open(FILENAME_SRC);
		ret.should.be.instanceof(Pipeline);
	});

	it('should pass an error if file is not found', function(done) {
		ribs.open(FILENAME_SRC + '1337').done(checkDoneErr('ENOENT', done));
	});
	
	it('should pass an error for invalid filename', function(done) {
		ribs.open().done(checkDoneErr('filename should not be null nor undefined', done));
	});

	it('should be aliased to ribs', function(done) {
		ribs(FILENAME_SRC).done(function(err, res) {
			should.not.exist(err);
			res.should.be.instanceof(Buffer);
			done();
		});
	});
});