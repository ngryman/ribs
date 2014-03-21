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

	describe('(src)', function() {
		it('should implicitly call from operation', function(done) {
			ribs('NaNaNaN.jpg').done(function(err) {
				err.message.should.equal("ENOENT, open 'NaNaNaN.jpg'");
				done();
			});
		});
	});

	describe('(src, dst, [callback])', function() {
		it('should implicitly call from & to operation', function(done) {
			ribs(SRC_IMAGE, TMP_FILE).done(function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});

		it('should call from first and to last', function(done) {
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

		it('should accept an optional callback', function(done) {
			ribs(SRC_IMAGE, TMP_FILE, function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});
	});

	describe('(src, dst, bulk, [callback])', function() {
		it('should implicitly call from, to & bulk operations', function(done) {
			var called = false;
			ribs(SRC_IMAGE, TMP_FILE, [function(params, image, next) {
				called = true;
				next(null, image);
			}]).done(function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				called.should.be.true;
				done();
			});
		});

		it('should accept an optional callback', function(done) {
			var called = false;
			ribs(SRC_IMAGE, TMP_FILE, [function(params, image, next) {
				called = true;
				next(null, image);
			}], function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				called.should.be.true;
				done();
			});
		});
	});

	describe('(bulk, [callback])', function() {

		it('should implicitly call bulk operations', function(done) {
			var called = false;
			ribs([function(params, next) {
				called = true;
				next(null, null);
			}]).done(function() {
				called.should.be.true;
				done();
			});
		});

		it('should accept an optional callback', function(done) {
			var called = false;
			ribs([function(params, next) {
				called = true;
				next(null, null);
			}], function() {
				called.should.be.true;
				done();
			});
		});

	});

	describe('#from', function() {
		it('should return a new instance of Pipeline', function() {
			ribs.from().should.be.instanceof(Pipeline);
			ribs.from().should.not.equal(ribs.from());
		});

		it('should call from operation', function(done) {
			ribs.from('NaNaNaN.jpg').done(function(err) {
				err.message.should.equal("ENOENT, open 'NaNaNaN.jpg'");
				done();
			});
		});
	});

	describe('#to', function() {
		it('should return an instance of Pipeline', function() {
			ribs.from().to().should.be.instanceof(Pipeline);
			ribs.from().to().should.not.equal(ribs.from());
		});

		it('should call to operation', function(done) {
			ribs.from(SRC_IMAGE).to(TMP_FILE).done(function() {
				fs.existsSync(TMP_FILE).should.be.true;
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});
	});

	describe('#done', function() {
		it('should have a reference to the image', function(done) {
			ribs.from(SRC_IMAGE).to(TMP_FILE).done(function(err, image) {
				image.should.be.instanceof(Image);
				fs.unlinkSync(TMP_FILE);
				done();
			});
		});
	});
});