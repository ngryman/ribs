/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"

using namespace v8;
using namespace ribs;

int errorHandler(int status, const char* fnName, const char* message, const char* filename, int line, void*) {
	// for now we do nothing
    return 0;
}

extern "C" void init(Handle<Object> target) {
	NanScope();

	Image::Initialize(target);

	// mute OCV errors, let us handle those
	//   http://stackoverflow.com/questions/2182235/error-modes-for-opencv
	cvRedirectError(errorHandler);
}

NODE_MODULE(ribs, init);