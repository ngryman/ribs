/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "decode.h"
#include "../image.h"

using namespace v8;
using namespace node;
using namespace ribs;

DecodeOperation::DecodeOperation(_NAN_METHOD_ARGS) : Operation(args) {
	// check against mandatory buffer input
	if (!Buffer::HasInstance(args[0])) throw "invalid input buffer";

	// convert the node buffer to an OCV matrix.
	// we do this because OCV only accepts matrix as input for imdecode.
	// however this should not have any performance input as the matrix does not copy data.
	auto buffer = reinterpret_cast<pixel_t*>(Buffer::Data(args[0]->ToObject()));
	auto length = Buffer::Length(args[0]->ToObject());

	inMat = cv::Mat(length, 1, CV_8UC1, buffer);
}

void DecodeOperation::DoProcess() {
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
		error = "invalid file";
	}
}

v8::Local<v8::Object> DecodeOperation::OutputValue() {
	return Image::New(outMat);
}