/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../..'),
	Image = ribs.Image,
	Pipeline = ribs.Pipeline,
	fs = require('fs');

/**
 * Tests constants.
 */

/**
 * Tests helper functions.
 */

/**
 * Test suite.
 */

describe('ribs', function() {
	describe('()', function() {
		it('should return a new instance of Pipeline', function() {
			ribs().should.be.instanceof(Pipeline);
			ribs().should.not.equal(ribs());
		});
	});

	describe('(filename)', function() {
		it('should implicitly call open operation', function(done) {
			ribs('NaNaNaN.jpg').done(function(err) {
				err.message.should.equal('no such file or directory');
				done();
			});
		});
	});

	describe('(src, dst)', function() {
		it('should implicitly call open & save operation', function(done) {
			var dst = 'fixtures/null';
			ribs('fixtures/in-24-a.png', dst).done(function() {
				fs.existsSync(dst).should.be.truthy;
				fs.unlinkSync(dst);
				done();
			});
		});

		it('should call open first and save last', function(done) {
			var dst = 'fixtures/null', called = false;
			ribs('fixtures/in-24-a.png', dst)
				.use(function(image, next) {
					image.should.be.instanceof(Image);
					image.should.have.property('width', 16);
					image.should.have.property('height', 9);
					fs.existsSync(dst).should.be.falsy;
					called = true;
					next(null, image);
				})
				.done(function() {
					fs.existsSync(dst).should.be.truthy;
					called.should.equal(1);
					done();
				});
		});
	});

	describe('#open', function() {
		it('should return a new instance of Pipeline', function() {
			ribs.open().should.be.instanceof(Pipeline);
			ribs.open().should.not.equal(ribs.open());
		});

		it('should implicitly call open operation', function(done) {
			ribs.open('NaNaNaN.jpg').done(function(err) {
				err.message.should.equal('no such file or directory');
				done();
			});
		});
	});

	describe('#hook', function() {
		it('should proxy Pipeline#hook', function(done) {

		});
	});

	describe('#add', function() {
		it('should proxy Pipeline#add', function(done) {

		});
	});
});