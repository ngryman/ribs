/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	Image = ribs.Image,
	Pipeline = ribs.Pipeline,
	fs = require('fs'),
	path = require('path');

/**
 * Tests constants.
 */

var SRC_DIR = require('ribs-fixtures').path,
	SRC_IMAGE = path.join(SRC_DIR, '0124.png'),
	TMP_DIR = path.resolve(SRC_DIR, 'tmp'),
	TMP_FILE = path.join(TMP_DIR, '0124-ribs.png'),
	W = 8,
	H = 8;

/**
 * Tests helper functions.
 */

/**
 * Test suite.
 */

describe('ribs', function() {
	before(function() {
		try { fs.mkdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	after(function() {
		try { fs.rmdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	describe('()', function() {
		it('should return a new instance of Pipeline', function() {
			ribs().should.be.instanceof(Pipeline);
			ribs().should.not.equal(ribs());
		});
	});

	describe('(filename)', function() {
		it('should implicitly call open operation', function(done) {
			ribs('NaNaNaN.jpg').done(function(err) {
				err.message.should.equal("ENOENT, open 'NaNaNaN.jpg'");
				done();
			});
		});
	});

	describe('(src, dst)', function() {
		it('should implicitly call open & save operation', function(done) {
			ribs(SRC_IMAGE, TMP_FILE).done(function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});

		it('should call open first and save last', function(done) {
			var called = false;
			ribs(SRC_IMAGE, TMP_FILE)
				.use(function(params, image, next) {
					image.should.be.instanceof(Image);
					image.should.have.property('width', W);
					image.should.have.property('height', H);
					fs.existsSync(TMP_FILE).should.be.false;
					called = true;
					next(null, image);
				})
				.done(function() {
					fs.existsSync(TMP_FILE).should.be.true;
					fs.unlinkSync(TMP_FILE);
					called.should.equal(true);
					done();
				});
		});
	});

	describe('#open', function() {
		it('should return a new instance of Pipeline', function() {
			ribs.open().should.be.instanceof(Pipeline);
			ribs.open().should.not.equal(ribs.open());
		});

		it('should call open operation', function(done) {
			ribs.open('NaNaNaN.jpg').done(function(err) {
				err.message.should.equal("ENOENT, open 'NaNaNaN.jpg'");
				done();
			});
		});
	});

	describe('#save', function() {
		it('should return an instance of Pipeline', function() {
			ribs.open().save().should.be.instanceof(Pipeline);
			ribs.open().save().should.not.equal(ribs.open());
		});

		it('should call save operation', function(done) {
			ribs.open(SRC_IMAGE).save(TMP_FILE).done(function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});
	});

	describe('#done', function() {
		it('should have a reference to the image', function(done) {
			ribs.open(SRC_IMAGE).save(TMP_FILE).done(function(err, image) {
				image.should.be.instanceof(Image);
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});
	});
});