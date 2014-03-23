/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var ribs = require('../../..'),
	Image = ribs.Image,
	from = ribs.operations.from,
	to = ribs.operations.to,
	fs = require('fs'),
	http = require('http'),
	path = require('path');

/**
 * Tests constants.
 */

var SRC_DIR = require('ribs-fixtures').path,
	TMP_DIR = path.join(SRC_DIR, 'tmp/');

/**
 * Tests helper functions.
 */

var testParams = helpers.testOperationParams(to);
var testImage = helpers.testOperationImage(to, { dst: '' });
var testNext = helpers.testOperationNext(to, { dst: '' });

var test = curry(function(dst, quality, progressive, done) {
	var stream, dstFilename;

	if ('string' == typeof dst) {
		dst = path.join(SRC_DIR, dst);

		// append `-to` to filename in order to avoid conflicts
		dstFilename = path.join(TMP_DIR, dst);
		dstFilename = dst.replace(/\.(jpg|png|gif)$/, '-to.$1');
	}
	else if ('function' == typeof dst) {
		stream = dst();
		dst = stream.path
			.replace('tmp/', '')
			.replace('-to', '');
		dstFilename = stream.path;
	}
	else if (Array.isArray(dst)) {
		dst = path.join(SRC_DIR, dst[0]);

		// append `-to` to filename in order to avoid conflicts
		dstFilename = path.join(TMP_DIR, dst);
		dstFilename = dst.replace(/\.(jpg|png|gif)$/, '-to.$1');
	}

	from(dst, function(err, image) {
		var params = {
			quality: quality,
			progressive: progressive
		};

		params.dst = stream || dstFilename;

		to(params, image, function(err, image) {
			should.not.exist(err);

			fs.existsSync(dstFilename).should.be.true;
			from(dstFilename, function(err, savedImage) {
				helpers.similarity(savedImage, image).should.be.true;
				fs.unlinkSync(dstFilename);
				done();
			});
		});
	});
});

/**
 * Test suite.
 */

describe('to operation', function() {
	before(function() {
		try { fs.mkdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	after(function() {
		try { fs.rmdirSync(TMP_DIR); }
		catch(err) { /* let cry */ }
	});

	describe('(params, image, next)', function() {
		xit('should fail when params has an invalid type', testParams(
			'', ['string', 'object', 'array'], false, null
		));

		xit('should accept params as a string', test('0124.png', 0, false));

		xit('should accept params as an array', test(['0124.png'], 0, false));

		xit('should fail when params.dst has an invalid type', testParams(
			'dst', ['string', 'object'], true, {}
		));

		it('should accept a writable stream', test(
			fs.createWriteStream.bind(null, path.join(TMP_DIR, '0124-to.png')), 0, false
		));

		it('should accept a server response', function(done) {
			var srcImage;

			var server = http.createServer(function(req, res) {
				from(path.join(SRC_DIR, '0124.png'), function(err, image) {
					srcImage = image;
					to({ dst: res }, image, function() {});
				});
			});
			server.listen(1337);

			http.get({ port: 1337, agent: false }, function(res) {
				var buffer;

				res.on('data', function(data) {
					buffer = data;
				});
				res.on('end', function() {
					from(buffer, function(err, image) {
						helpers.similarity(srcImage, image).should.be.true;
						done();
					});
				});
			});
		});


		it('should fail when params.dst does not have an extension', function(done) {
			to({ dst: '/dev/null' }, new Image(), function(err) {
				helpers.checkError(err, 'invalid filename: /dev/null');
				done();
			});
		});

		it('should fail when params.quality has an invalid type', testParams(
			'quality', ['number'], true, { dst: '' }
		));

		it('should fail when params.progressive has an invalid type', testParams(
			'progressive', ['boolean'], true, { dst: '' }
		));

		it('should fail when image has an invalid type', testImage());

		it('should fail when image is not an instance of Image', function(done) {
			to({ dst: 'yolo.jpg' }, {}, function(err) {
				helpers.checkError(err, 'invalid type: image should be an instance of Image');
				done();
			});
		});

		it('should fail when image is an empty image', function(done) {
			to({ dst: 'yolo.jpg' }, new Image(), function(err) {
				helpers.checkError(err, 'empty image');
				done();
			});
		});

		it('should fail when next has an invalid type', testNext());
	});

	describe('with jpg files', function() {
		it('should save when quality is 100%', test('01100.jpg', 100, false));

		it('should save when quality is 50%', test('0150.jpg', 50, false));

		it('should save when quality is 0%', test('010.jpg', 0, false));

		it('should save when progressive and quality is 100%', test('01100p.jpg', 100, true));

		it('should save when progressive and quality is 50%', test('0150p.jpg', 50, true));

		it('should save when progressive and quality is 0%', test('010p.jpg', 0, true));
	});

	describe('with png files', function() {
		it('should save 8-bit', test('018.png', 0, false));

		// seems buggy for 8-bit PNG with alpha channel, posted a question here:
		//   http://answers.opencv.org/question/28220/alpha-channel-for-8-bit-png/
		xit('should save 8-bit with alpha channel', test('018a.png', 0, false));
		xit('should save interlaced 8-bit with alpha channel', test('018ai.png', 0, false));

		it('should save 24-bit when quality is 100', test('0124.png', 100, false));

		it('should save 24-bit when quality is 50', test('0124.png', 50, false));

		it('should save 24-bit when quality is 0', test('0124.png', 0, false));

		it('should save 24-bit with alpha channel when quality is 100', test('0124a.png', 100, false));

		it('should save 24-bit with alpha channel when quality is 50', test('0124a.png', 50, false));

		it('should save 24-bit with alpha channel when quality is 0', test('0124a.png', 0, false));

		it('should save interlaced 24-bit with alpha channel when quality is 100', test('0124ai.png', 100, false));

		it('should save interlaced 24-bit with alpha channel when quality is 50', test('0124ai.png', 50, false));

		it('should save interlaced 24-bit with alpha channel when quality is 0', test('0124ai.png', 0, false));
	});

	// gif are not supported by OCV
	//   http://stackoverflow.com/questions/11494119/error-in-opencv-2-4-2-opencv-error-bad-flag
	xdescribe('with gif files', function() {
		it('should save standard', test('01.gif', 0, false));

		it('should save interlaced', test('01i.gif', 0, false));

		it('should save with alpha channel', test('01a.gif', 0, false));

		it('should save interlaced with alpha channel', test('01ai.gif', 0, false));
	});
});