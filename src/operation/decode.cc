/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "decode.h"
#include "../image.h"

using namespace std;
using namespace v8;
using namespace node;
using namespace ribs;

static string Format(pixel_t* data);

OPERATION_PREPARE(Decode, {
	// check against mandatory buffer input
	if (!Buffer::HasInstance(args[0])) throw "invalid input buffer";

	// convert the node buffer to an OCV matrix.
	// we do this because OCV only accepts matrix as input for imdecode.
	// however this should not have any performance input as the matrix does not copy data.
	auto buffer = reinterpret_cast<pixel_t*>(Buffer::Data(args[0]->ToObject()));
	auto length = Buffer::Length(args[0]->ToObject());

	// store input format
	inFormat = Format(buffer);

	inMat = cv::Mat(length, 1, CV_8UC1, buffer);
})

OPERATION_CLEANUP(Decode, {})

OPERATION_PROCESS(Decode, {
	try {
		// decode
		outMat = cv::Mat(cv::imdecode(inMat, CV_LOAD_IMAGE_UNCHANGED));
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and check against outMat.
	}

	// empty matrix, set error
	if (outMat.empty()) {
		error = "operation error: decode";
	}
})

OPERATION_VALUE(Decode, {
	return Image::New(outMat, inFormat);
})

string Format(pixel_t* data) {
	// jpeg
	if (0xff == data[0] && 0xd8 == data[1])
		return "jpg";

	// png
	if ('P' == data[1] && 'N' == data[2] && 'G' == data[3])
		return "png";

	// gif
	if ('G' == data[0] && 'I' == data[1] && 'F' == data[2])
		return "gif";

	// tiff
	// 42 in little/big endian, funky
	if (('M' == data[0] && 'M' == data[1]) ||
		('I' == data[0] && 'I' == data[1]))
		return "tiff";

	// bmp
	if (('B' == data[0] && 'M' == data[1]) ||
		('B' == data[0] && 'A' == data[1]) ||
		('C' == data[0] && 'I' == data[1]) ||
		('C' == data[0] && 'P' == data[1]) ||
		('I' == data[0] && 'C' == data[1]) ||
		('P' == data[0] && 'T' == data[1]))
			return "bmp";

	return "";
}