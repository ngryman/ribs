/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "encode.h"
#include "../image.h"

using namespace std;
using namespace v8;
using namespace node;
using namespace ribs;

struct EncodeBaton : Baton {
	string   ext;
	uint32_t quality;
};

bool EncodeOperation::CheckArguments(_NAN_METHOD_ARGS) {
	return (NULL != ObjectWrap::Unwrap<Image>(args.This()));
}

Baton* EncodeOperation::PreProcess(_NAN_METHOD_ARGS) {
	auto    image = ObjectWrap::Unwrap<Image>(args.This());
	auto filename = FromV8String(args[0]);
	auto      ext = filename.substr(filename.find_last_of('.'));
	auto  quality = args[1]->Uint32Value();

	// creates and populate baton
	auto baton = new EncodeBaton();
	baton->in = reinterpret_cast<void*>(image);
	baton->ext = ext;
	baton->quality = quality;

	return baton;
}

void EncodeOperation::DoProcess(Baton* baton) {
	auto encodeBaton = static_cast<EncodeBaton*>(baton);
	auto       image = reinterpret_cast<Image*>(baton->in);
	auto      outVec = new vector<uchar>();

	try {
		vector<int> params;

		// quality
		if (encodeBaton->quality > 0) {
			params.push_back(".jpg" == encodeBaton->ext ? CV_IMWRITE_JPEG_QUALITY : CV_IMWRITE_PNG_COMPRESSION);
			params.push_back(encodeBaton->quality);
		}

		// encode
		cv::imencode(encodeBaton->ext, image->Matrix(), *outVec);
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and check against outMat.
	}

	// empty matrix, set error
	if (outVec->empty()) {
		baton->error = "invalid file";
		return;
	}

	// create a new image object
	baton->out = reinterpret_cast<void*>(outVec);
}

v8::Local<v8::Object> EncodeOperation::OutputValue(Baton* baton) {
	auto outVec = reinterpret_cast<vector<uchar>*>(baton->out);
	return NanNewBufferHandle(reinterpret_cast<char*>(&(*outVec)[0]), outVec->size());
}

void EncodeOperation::PostProcess(Baton* baton) {
	auto outVec = reinterpret_cast<vector<uchar>*>(baton->out);
	delete outVec;
}