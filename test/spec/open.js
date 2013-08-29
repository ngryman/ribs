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
	Image = ribs.Image,
	Pipeline = require('../../lib/pipeline'),
	curry = require('curry'),
	chai = require('chai'),
	should = chai.should();

/**
 * Tests constants.
 */

var FILENAME_SRC = __dirname + '/../fixtures/in';
var WIDTH = 160;
var HEIGHT = 90;

/**
 * Tests helper functions.
 */

var checkDone = curry(function(done, err, image) {
	should.not.exist(err);
	image.should.be.instanceof(Image);
	image.width.should.equal(WIDTH);
	image.height.should.equal(HEIGHT);
	image.pixels.should.be.instanceof(Buffer);
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
		ribs.open(FILENAME_SRC + '.png').done(checkDone(done));
	});

	it('should return a Pipeline', function() {
		var ret = ribs.open(FILENAME_SRC + '.png');
		ret.should.be.instanceof(Pipeline);
	});

	it('should pass an error if file is not found', function(done) {
		ribs.open('1337').done(checkDoneErr('no such file or directory', done));
	});
	
	it('should pass an error for invalid filename', function(done) {
		ribs.open().done(checkDoneErr('filename should not be null nor undefined', done));
	});

	it('should open jpg files', function(done) {
		ribs.open(FILENAME_SRC + '.jpg').done(checkDone(done));
	});

	it('should open png files', function(done) {
		ribs.open(FILENAME_SRC + '.png').done(checkDone(done));
	});

	it('should open gif files', function(done) {
		ribs.open(FILENAME_SRC + '.gif').done(checkDone(done));
	});

	it('should be aliased to ribs', function(done) {
		ribs(FILENAME_SRC).done(checkDone(done));
	});
});