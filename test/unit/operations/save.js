/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var open = require('../../../lib/operations/open'),
	save = require('../../../lib/operations/save'),
	Image = require('../../..').Image,
	fs = require('fs'),
	path = require('path');

/**
 * Tests constants.
 */

var SRC_DIR = path.resolve(__dirname + '/../../fixtures/'),
	TMP_DIR = path.join(SRC_DIR, 'tmp/');

/**
 * Tests helper functions.
 */

var testSave = curry(function(filename, quality, progressive, expectedErr, done) {
	open(path.join(SRC_DIR, '01a.gif'), function(err, image) {
		filename = path.join(TMP_DIR, filename);
		// randomize filename in order to avoid conflict with existing fixtures
		filename = filename.replace(/\.(jpg|png|gif)$/, '-save.$1');
		save({
			filename: filename,
			quality: quality,
			progressive: progressive
		}, image, function(err) {
			if (expectedErr) {
				err.should.be.instanceof(Error);
				err.message.should.equal(expectedErr);
				done();
			}
			else {
				should.not.exist(err);
				fs.existsSync(filename).should.be.truthy;
				open(filename, function(err, savedImage) {
					for (var i = 0, len = image.length; i < len; i++) {
						console.log(savedImage[i], image[i]);
//						savedImage[i].should.equal(image[i]);
					}
					fs.unlinkSync(filename);
					done();
				});
//				done();
			}
		});
	});
});

/**
 * Test suite.
 */

describe('save operation', function() {
	before(function() {
		try { fs.mkdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	after(function() {
		fs.rmdirSync(TMP_DIR);
	});

	xdescribe('(filename, image, next)', function() {
		it('should pass an error when params are not valid', function(done) {
			save(null, null, function(err) {
				err.should.be.instanceof(Error);
				err.message.should.equal('params should not be null nor undefined');
				done();
			});
		});

		it('should pass an error when image is not valid', function(done) {
			save('/dev/null', null, function(err) {
				err.should.be.instanceof(Error);
				err.message.should.equal('image should not be null nor undefined');
				done();
			});
		});

		it('should throw an error when next is not valid', function() {
			(function() {
				save('/dev/null', new Image(), 'lolilol');
			}).should.throw('next should be a function');
		});
	});

	xdescribe('(params, image, next)', function() {
		it('should pass an error when filename is not valid', function(done) {
			save({ filename: null }, new Image(), function(err) {
				err.should.be.instanceof(Error);
				err.message.should.equal('filename should not be null nor undefined');
				done();
			});
		});
	});

	describe('with jpg files', function() {
		it('should save when quality is 100%', testSave('01100.jpg', 100, false, null));
		xit('should save when quality is 50%', testSave('0150.jpg', 50, false, null));
		xit('should save when quality is 0%', testSave('010.jpg', 0, false, null));
		xit('should save when progressive and quality is 100%', testSave('01100p.jpg', 100, true, null));
		xit('should save when progressive and quality is 50%', testSave('0150p.jpg', 50, true, null));
		xit('should save when progressive and quality is 0%', testSave('010p.jpg', 0, true, null));
	});

	xdescribe('with png files', function() {
//		it('should save 8-bit', testSave('018.png', 0, false, null)); // full transparent?
//		it('should save 8-bit with alpha channel', testSave('018a.png', null));
//		it('should open interlaced 8-bit with alpha channel', testSave('018ai.png', null));
//		it('should save 24-bit', testSave('0124.png', 0, false, null)); // full transparent?
		it('should save 24-bit with alpha channel', testSave('0124a.png', 0, false, null));
		it('should save interlaced 24-bit with alpha channel', testSave('0124ai.png', 0, false, null));
	});

	xdescribe('with gif files', function() {
		it('should save standard', testSave('01.gif', 0, false, null));
		it('should save interlaced', testSave('01i.gif', 0, false, null));
//		it('should save with alpha channel', testSave('01a.gif', 0, false, null));
//		it('should save interlaced with alpha channel', testSave('01ai.gif', 0, false, null));
	});
});