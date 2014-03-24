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

var test = curry(function(src, params, done) {
	params = params || {};

	if ('string' == typeof src || Array.isArray(src)) {
		if (Array.isArray(src))
			src = src[0];

		// append `-to` to dst in order to avoid conflicts
		if (!params.dst)
			params.dst = path.join(TMP_DIR, src).replace(/\.(jpg|png|gif)$/, '-to.$1');
		src = path.join(SRC_DIR, src);
	}
	else if ('function' == typeof src) {
		// get the stream
		params.dst = src(path.join(TMP_DIR, '0124-to.png'));
		src = path.join(SRC_DIR, '0124.png');
	}

	from(src, function(err, image) {
		to(params, image, function(err, image) {
			should.not.exist(err);

			var dstFilename = params.dst.path || params.dst;
			fs.existsSync(dstFilename).should.be.true;

			from(dstFilename, function(err, savedImage) {
				should.not.exist(err);

				savedImage.originalFormat.should.equal(
					params.format || path.extname(dstFilename).slice(1) || image.originalFormat
				);

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
		it('should fail when params has an invalid type', testParams(
			'', ['string', 'object', 'array'], false, null
		));

		it('should accept params as a string', test('0124.png', null));

		it('should accept params as an array', test(['0124.png'], null));

		it('should fail when params.dst has an invalid type', testParams(
			'dst', ['string', 'object'], true, {}
		));

		it('should accept a writable stream', test(
			fs.createWriteStream, null
		));

		it('should accept a server response', function(done) {
			var srcImage;

			var server = http.createServer(function(req, res) {
				from(path.join(SRC_DIR, '0124.png'), function(err, image) {
					srcImage = image;
					to(res, image, function() {});
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

		it('should fail when params.quality has an invalid type', testParams(
			'quality', ['number'], true, { dst: '' }
		));

		it('should fail when params.progressive has an invalid type', testParams(
			'progressive', ['boolean'], true, { dst: '' }
		));

		it('should fail when params.format has an invalid type', testParams(
			'format', ['string'], true, { dst: '' }
		));

		it('should fail when image has an invalid type', testImage());

		it('should fail when image is not an instance of Image', function(done) {
			to('yolo.jpg', {}, function(err) {
				helpers.checkError(err, 'invalid type: image should be an instance of Image');
				done();
			});
		});

		it('should fail when image is an empty image', function(done) {
			var dst = path.join(TMP_DIR, 'yolo.jpg');
			to(dst, new Image(), function(err) {
				fs.unlinkSync(dst);
				helpers.checkError(err, 'empty image');
				done();
			});
		});

		it('should fail when next has an invalid type', testNext());
	});

	describe('with jpg files', function() {
		it('should save when quality is 100%', test('01100.jpg', {
			quality: 100
		}));

		it('should save when quality is 50%', test('0150.jpg', {
			quality: 50
		}));

		it('should save when quality is 0%', test('010.jpg', {
			quality: 0
		}));

		it('should save when progressive and quality is 100%', test('01100p.jpg', {
			quality: 100,
			progressive: true
		}));

		it('should save when progressive and quality is 50%', test('0150p.jpg', {
			quality: 50,
			progressive: true
		}));

		it('should save when progressive and quality is 0%', test('010p.jpg', {
			quality: 0,
			progressive: true
		}));
	});

	describe('with png files', function() {
		it('should save 8-bit', test('018.png', null));

		// seems buggy for 8-bit PNG with alpha channel, posted a question here:
		//   http://answers.opencv.org/question/28220/alpha-channel-for-8-bit-png/
		xit('should save 8-bit with alpha channel', test('018a.png', null));
		xit('should save interlaced 8-bit with alpha channel', test('018ai.png', null));

		it('should save 24-bit when quality is 100', test('0124.png', {
			quality: 100
		}));

		it('should save 24-bit when quality is 50', test('0124.png', {
			quality: 50
		}));

		it('should save 24-bit when quality is 0', test('0124.png', {
			quality: 0
		}));

		it('should save 24-bit with alpha channel when quality is 100', test('0124a.png', {
			quality: 100
		}));

		it('should save 24-bit with alpha channel when quality is 50', test('0124a.png', {
			quality: 50
		}));

		it('should save 24-bit with alpha channel when quality is 0', test('0124a.png', {
			quality: 0
		}));

		it('should save interlaced 24-bit with alpha channel when quality is 100', test('0124ai.png', {
			quality: 100
		}));

		it('should save interlaced 24-bit with alpha channel when quality is 50', test('0124ai.png', {
			quality: 50
		}));

		it('should save interlaced 24-bit with alpha channel when quality is 0', test('0124ai.png', {
			quality: 0
		}));
	});

	// gif are not supported by OCV
	//   http://stackoverflow.com/questions/11494119/error-in-opencv-2-4-2-opencv-error-bad-flag
	xdescribe('with gif files', function() {
		it('should save standard', test('01.gif', {
			quality: 0
		}));

		it('should save interlaced', test('01i.gif', {
			quality: 0
		}));

		it('should save with alpha channel', test('01a.gif', {
			quality: 0
		}));

		it('should save interlaced with alpha channel', test('01ai.gif', {
			quality: 0
		}));
	});

	describe('format handling', function() {

		it('should transcode a jpg to a png', test('01100.jpg', {
			format: 'png'
		}));

		it('should transcode a png to a jpg', test('0124.png', {
			format: 'jpg'
		}));

		it('should fallback to original format', test('0124.png', {
			dst: 'output'
		}));

	});
});