'use strict';

var fs = require('fs'),
	path = require('path');

function fromPm(filename) {
	filename = path.resolve(__dirname + '/' + filename);

	var data = fs.readFileSync(filename, 'utf8');
	// header size
	var headerSize = Math.max(2, Number(data.substr(1, 2)));
	// remove header & convert to array of pixels
	data = data.split('\n').slice(headerSize);
	// remove last empty pixel (trailing whitespace)
	if ('' == data[data.length - 1]) data.pop();

	return data;
}

function raw(filename, alpha) {
	// filename can be a stream
	if ('object' == typeof filename)
		filename = filename.path;

	var basename = path.basename(filename, path.extname(filename)),
        pixelsFilename = basename + '.ppm',
        rgb = fromPm(pixelsFilename), a;

    if (alpha) {
        var alphaFilename = basename.substr(0, 2) + (alpha ? 'a' : '') + '.pbm';
        a = fromPm(alphaFilename);
    }

    var length = rgb.length / 3;
    var channels = alpha ? 4 : 3;

	// convert to RGB(A)
	var rgba = new Array(length * channels);
	for (var i = 0; i < length; i++) {
		rgba[i * channels + 0] = Number(rgb[i * 3 + 2]);
		rgba[i * channels + 1] = Number(rgb[i * 3 + 1]);
		rgba[i * channels + 2] = Number(rgb[i * 3]);
		if (alpha) rgba[i * channels + 3] = '1' == a[i] ? 255 : 0;
	}

	return rgba;
}

module.exports = raw;