/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "resize.h"
#include "../image.h"

using namespace v8;
using namespace node;
using namespace ribs;

OPERATION_PREPARE(Resize, {
	// check against mandatory image input (from this)
	image = ObjectWrap::Unwrap<Image>(args.This());

	// create a persistent object during the process to avoid v8 to dispose the JavaScript image object.
	NanAssignPersistent(Object, imageHandle, args.This());

	// store width & height
	width  = args[0]->Uint32Value();
	height = args[1]->Uint32Value();
})

OPERATION_CLEANUP(Resize, {
	if (!imageHandle.IsEmpty()) NanDisposePersistent(imageHandle);
})

OPERATION_PROCESS(Resize, {
	try {
		cv::Mat res;

		// resize
		cv::resize(image->Matrix(), res, cv::Size(width, height), 0, 0);

		image->Matrix(res);
	}
	catch (const cv::Exception& e) {
		error = "operation error: resize";
	}
})

OPERATION_VALUE(Resize, {
	image->Sync(imageHandle);
	return NanPersistentToLocal(imageHandle);
})
