/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
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
	async = require('async'),
	chai = require('chai'),
	should = chai.should(),
	Assertion = chai.Assertion;;

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
	image.depth.should.within(8, 32);
	image.pixels.should.be.instanceof(Buffer);
	done();
});

var checkDoneErr = curry(function(trueErr, done, err) {
	err.should.be.instanceof(Error);
	err.message.should.have.string(trueErr);
	done();
});

var asyncOpen = curry(function(ext, callback) {
	ribs.open(FILENAME_SRC + '.' + ext).done(callback);
});

Assertion.addMethod('samePixels', function(image) {
	var obj = this._obj, i, check = true;

	// first, our instanceof check, shortcut
	new Assertion(obj).to.be.instanceof(Image);
	new Assertion(image).to.be.instanceof(Image);

	// second, check for 100 first pixels
	for (i = 0; i < 100; i++) {
		if (obj.pixels[i] != image.pixels[i]) {
			check = false;
			break;
		}
	}

	// assertion
	this.assert(
		check,
		'expected #{this} to have the same pixels as #{exp}',
		'expected #{this} to not have the same pixels as #{exp}',
		image
	);
});
chai.use(function(chai, utils) {

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

	xit('should return the same data from several image formats', function(done) {
		async.parallel({
			jpg: asyncOpen('jpg'),
			png: asyncOpen('png'),
			gif: asyncOpen('gif')
		}, function(err, res) {
			res.png.should.have.samePixels(res.gif);
			done();
		})
	});
});