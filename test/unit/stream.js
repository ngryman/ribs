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
	Pipeline = ribs.Pipeline,
	createStream = ribs.createStream,
	fs = require('fs'),
	path = require('path');

/**
 * Test constants.
 */

var SRC_DIR = require('ribs-fixtures').path,
	TMP_DIR = path.join(SRC_DIR, 'tmp/');

/**
 * Test suite.
 */

describe('stream', function() {

	before(function() {
		try { fs.mkdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	after(function() {
		try { fs.rmdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	it('should be pipeable', function(done) {
		var input = fs.createReadStream(path.join(SRC_DIR, 'lena.bmp'));
		var output = fs.createWriteStream(path.join(TMP_DIR, 'stream.bmp'));
		var stream = createStream(new Pipeline());

		input.pipe(stream).pipe(output).on('finish', function() {
			fs.existsSync(output.path);
			fs.unlinkSync(output.path);
			done();
		});
	});

	it('should allow to call operations like pipeline', function(done) {
		var input = fs.createReadStream(path.join(SRC_DIR, 'lena.bmp'));
		var output = fs.createWriteStream(path.join(TMP_DIR, 'stream.bmp'));

		var stream = createStream(new Pipeline());
		stream.resize(2);

		input.pipe(stream).pipe(output).on('finish', function() {
			fs.existsSync(output.path);
			fs.unlinkSync(output.path);
			done();
		});
	});

});