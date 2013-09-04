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
	fs = require('fs');

/**
 * Tests constants.
 */

/**
 * Tests helper functions.
 */

var testSave = curry(function(filename, expectedErr, done) {
	// randomize filename in order to avoid conflict with existing fixtures
	filename += Math.floor(Math.random() * 1000);

	open('../fixtures/in-24-a.png', function(err, image) {
		save('../fixtures/' + filename, image, function(err) {
			if (expectedErr) {
				err.should.be.instanceof(Error);
				err.message.should.equal(expectedErr);
			}
			else {
				should.not.exist(err);
				fs.existsSync(filename).should.be.truthy;
			}
			done();
		});
	});
});

/**
 * Test suite.
 */

describe('save operation', function() {
	describe('with jpg files', function() {
		it('should save when 100% compressed', testSave('in-q100.jpg', null));
		it('should save when 50% compressed', testSave('in-q50.jpg', null));
		it('should save when 0% compressed', testSave('in-q0.jpg', null));
		it('should save when progressive and 100% compressed', testSave('in-q100-p.jpg', null));
		it('should save when progressive and 50% compressed', testSave('in-q50-p.jpg', null));
		it('should save when progressive and 0% compressed', testSave('in-q0-p.jpg', null));
		it('should save when optimized and 100% compressed', testSave('in-q100-o.jpg', null));
		it('should save when optimized and 50% compressed', testSave('in-q50-o.jpg', null));
		it('should save when optimized and 0% compressed', testSave('in-q0-o.jpg', null));
	});

	describe('with png files', function() {
		it('should save 8-bit', testSave('in-8.png', null));
		it('should save 8-bit with alpha channel', testSave('in-8-a.png', null));
		it('should save 24-bit', testSave('in-24.png', null));
		it('should save 24-bit with alpha channel', testSave('in-24-a.png', null));
		it('should save interlaced 24-bit with alpha channel', testSave('in-24-a-i.png', null));
	});

	describe('with gif files', function() {
		it('should save standard', testSave('in.gif', null));
		it('should save with alpha channel', testSave('in-a.gif', null));
		it('should save interlaced with alpha channel', testSave('in-a-i.gif', null));
	});

	it('should pass an error when file is not found', testSave('void', 'no such file or directory'));
	it('should pass an error when filename is not valid', testSave(null, 'filename should not be null nor undefined'));
});