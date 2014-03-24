/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var path = require('path'),
	fs = require('fs'),
	ribs = require('../..');

/**
 * Tests constants.
 */

var SRC_DIR = require('ribs-fixtures').path,
	TMP_DIR = path.join(SRC_DIR, 'tmp/');

/**
 * Test suite.
 */

describe('lena\'s head', function() {
	before(function() {
		try { fs.mkdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	after(function() {
		try { fs.rmdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	it('should be resized and cropped', function(done) {
		ribs(
			path.join(SRC_DIR, 'lena.bmp'),
			path.join(TMP_DIR, 'lena-head.png')
		)
		.crop({ width: 300, height: 300, x: 312, y: 267 })
		.resize({ width: 32, height: 32 })
		.done(function(err, savedImage) {
			ribs(path.join(SRC_DIR, 'lena-head.png')).done(function(err, image) {
				helpers.similarity(savedImage, image).should.be.true;
				fs.unlinkSync(path.join(TMP_DIR, 'lena-head.png'));
				done();
			});
		});
	});
});