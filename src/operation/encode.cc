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

OPERATION_PREPARE(Encode, {
	// check against mandatory image input (from this)
	image = ObjectWrap::Unwrap<Image>(args.This());
	if (NULL == image) throw "invalid input image";

	// check against mandatory file name
	auto filename = FromV8String(args[0]);
	if (filename.empty()) throw "invalid filename";

	// store params for further processing
	ext     = filename.substr(filename.find_last_of('.'));
	quality = args[1]->Uint32Value();
})

OPERATION_CLEANUP(Encode, {})

OPERATION_PROCESS(Encode, {
	try {
		vector<int> params;

		// quality
		if (quality > 0) {
			params.push_back(".jpg" == ext ? CV_IMWRITE_JPEG_QUALITY : CV_IMWRITE_PNG_COMPRESSION);
			params.push_back(quality);
		}

		// encode
		cv::imencode(ext, image->Matrix(), outVec);
	}
	catch (...) {
		// OCV uses assertion to handle errors, thus the message is not very explicit.
		// we simply do nothing and check against outMat.
	}

	// empty matrix, set error
	if (outVec.empty()) {
		error = "invalid file";
	}
})

OPERATION_VALUE(Encode, {
	return NanNewBufferHandle(reinterpret_cast<char*>(&outVec[0]), outVec.size());
})