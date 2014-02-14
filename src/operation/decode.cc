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

bool DecodeOperation::CheckArguments(_NAN_METHOD_ARGS) {
	return Buffer::HasInstance(args[0]);
}

Baton* DecodeOperation::PreProcess(_NAN_METHOD_ARGS) {
	// convert the node buffer to an OCV matrix.
	// we do this because OCV only accepts matrix as input for imdecode.
	// however this should not have any performance input as the matrix does not copy data.
	auto buffer = reinterpret_cast<pixel_t*>(Buffer::Data(args[0]->ToObject()));
	auto length = Buffer::Length(args[0]->ToObject());
	auto  inMat = new cv::Mat(length, 1, CV_8UC1, buffer);

	// creates and populate baton
	auto baton = new Baton();
	baton->in = reinterpret_cast<void*>(inMat);

	return baton;
}

void DecodeOperation::DoProcess(Baton* baton) {
	auto      inMat = reinterpret_cast<cv::Mat*>(baton->in);
	cv::Mat* outMat = NULL;

	try {
		// decode
		outMat = new cv::Mat(cv::imdecode(*inMat, CV_LOAD_IMAGE_UNCHANGED));
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and check against outMat.
	}

	// empty matrix, set error
	if (NULL == outMat || outMat->empty()) {
		baton->error = "invalid file";
		return;
	}

	// create a new image object
	baton->out = reinterpret_cast<void*>(outMat);
}

v8::Local<v8::Object> DecodeOperation::OutputValue(Baton* baton) {
	return Image::New(*reinterpret_cast<cv::Mat*>(baton->out));
}

void DecodeOperation::PostProcess(Baton* baton) {
	auto inMat = reinterpret_cast<cv::Mat*>(baton->in);
	delete inMat;

	auto outMat = reinterpret_cast<cv::Mat*>(baton->out);
	delete outMat;
}