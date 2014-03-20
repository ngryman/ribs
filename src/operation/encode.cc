/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "encode.h"
#include "../image.h"

using namespace std;
using namespace v8;
using namespace node;
using namespace ribs;

OPERATION_PREPARE(Encode, {
	image = ObjectWrap::Unwrap<Image>(args.This());
	string filename;
	if (args[0]->IsString())
		filename = FromV8String(args[0]);
	else
		filename = "." + image->InputFormat();

	// store params for further processing
	auto index = filename.find_last_of('.');
	if (string::npos == index) throw invalid_argument("invalid filename: " + filename);

	// check if image is empty
	if (image->Matrix().empty()) throw invalid_argument("empty image");

	ext     = filename.substr(index);
	quality = args[1]->Uint32Value();
})

OPERATION_CLEANUP(Encode, {})

OPERATION_PROCESS(Encode, {
	try {
		vector<int> params;

		// quality
		if (quality > 0) {
			params.push_back(".jpg" == ext ? CV_IMWRITE_JPEG_QUALITY : CV_IMWRITE_PNG_COMPRESSION);

			// normalize png quality for OCV.
			// RIBS takes a [0,100] value, OCV takes a [0,9] value.
			if (".png" == ext) {
				quality = quality * 90 / 1000;
			}

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
		error = "operation error: encode";
	}
})

OPERATION_VALUE(Encode, {
	return NanNewBufferHandle(reinterpret_cast<char*>(&outVec[0]), outVec.size());
})