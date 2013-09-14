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
	open(path.join(SRC_DIR, filename), function(err, image) {
		filename = path.join(TMP_DIR, filename);
		// randomize filename in order to avoid conflict with existing fixtures
		filename = filename.replace(/\.(jpg|png|gif)$/, '-' + (Math.floor(Math.random() * 1000)) + '.$1');

		save({
			filename: filename,
			quality: quality,
			progressive: progressive
		}, image, function(err) {
			if (expectedErr) {
				err.should.be.instanceof(Error);
				err.message.should.equal(expectedErr);
			}
			else {
				should.not.exist(err);
				fs.existsSync(filename).should.be.truthy;
				fs.unlinkSync(filename);
			}
			done();
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

	describe('(filename, image, next)', function() {
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

	describe('(params, image, next)', function() {
		it('should pass an error when filename is not valid', function(done) {
			save({ filename: null }, new Image(), function(err) {
				err.should.be.instanceof(Error);
				err.message.should.equal('filename should not be null nor undefined');
				done();
			});
		});
	});

	describe('with jpg files', function() {
		it('should save when 100% compressed', testSave('in-q100.jpg', 100, false, null));
		it('should save when 50% compressed', testSave('in-q50.jpg', 50, false, null));
		it('should save when 0% compressed', testSave('in-q0.jpg', 0, false, null));
		it('should save when progressive and 100% compressed', testSave('in-q100-p.jpg', 100, true, null));
		it('should save when progressive and 50% compressed', testSave('in-q50-p.jpg', 50, true, null));
		it('should save when progressive and 0% compressed', testSave('in-q0-p.jpg', 50, true, null));
	});

	describe('with png files', function() {
//		it('should save 8-bit', testSave('in-8.png', 0, false, null)); // full transparent?
//		it('should save 8-bit with alpha channel', testSave('in-8-a.png', null));
//		it('should open interlaced 8-bit with alpha channel', testSave('in-8-a-i.png', null));
//		it('should save 24-bit', testSave('in-24.png', 0, false, null)); // full transparent?
		it('should save 24-bit with alpha channel', testSave('in-24-a.png', 0, false, null));
		it('should save interlaced 24-bit with alpha channel', testSave('in-24-a-i.png', 0, false, null));
	});

	describe('with gif files', function() {
		it('should save standard', testSave('in.gif', 0, false, null));
//		it('should save with alpha channel', testSave('in-a.gif', 0, false, null));
//		it('should save interlaced with alpha channel', testSave('in-a-i.gif', 0, false, null));
	});
});