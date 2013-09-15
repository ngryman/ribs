'use strict';

var fs = require('fs'),
	path = require('path');

function fromPm(filename) {
	filename = path.resolve(__dirname + '/' + filename);

	var data = fs.readFileSync(filename, 'utf8');
	// header size
	var headerSize = Math.max(2, Number(data.substr(1, 2)));
	// remove header
	data = data.split('\n').slice(headerSize).join('');
	// converts to array of pixels
	data = data.split(' ');
	// remove last empty pixel (trailing whitespace)
	if ('' == data[data.length - 1]) data.pop();

	return data;
}

function raw(filename, alpha) {
	var basename = path.basename(filename, path.extname(filename)),
		alphaFilename = basename.substr(0, 2) + (alpha ? 'a' : '') + '.pbm',
		pixelsFilename = basename + '.ppm',
		a = fromPm(alphaFilename),
		rgb = fromPm(pixelsFilename);

	// merge 24bit pixels and 8 bit alpha channel
	var rgba = new Array(a.length * 4);
	for (var i = 0, len = a.length; i < len; i++) {
		rgba[i * 4 + 0] = '1' == a[i] ? 255 : 0;
		rgba[i * 4 + 1] = Number(rgb[i * 3 + 2]);
		rgba[i * 4 + 2] = Number(rgb[i * 3 + 1]);
		rgba[i * 4 + 3] = Number(rgb[i * 3]);
	}

	return rgba;
}

module.exports = raw;