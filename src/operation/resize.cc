/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "resize.h"
#include "../image.h"

using namespace v8;
using namespace node;
using namespace ribs;

ResizeOperation::~ResizeOperation() {
	if (imageHandle.IsEmpty()) return;
	imageHandle.Dispose();
	imageHandle.Clear();
}

ResizeOperation::ResizeOperation(_NAN_METHOD_ARGS) : Operation(args) {
	// check against mandatory image input (from this)
	image = ObjectWrap::Unwrap<Image>(args.This());
	if (NULL == image) throw "invalid input image";

	// create a persistent object during the process to avoid v8 to dispose the JavaScript image object.
	NanAssignPersistent(Object, imageHandle, args.This());

	// store width & height
	width  = args[0]->Uint32Value();
	height = args[1]->Uint32Value();
}

void ResizeOperation::DoProcess() {
	try {
		cv::Mat res;

		// resize
		cv::resize(image->Matrix(), res, cv::Size(width, height), 0, 0);

		image->Matrix(res);
	}
	catch (const cv::Exception& e) {
		error = "invalid image";
	}
}

Local<Value> ResizeOperation::OutputValue() {
	return NanPersistentToLocal(imageHandle);
}