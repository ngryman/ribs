/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"

using namespace v8;

extern "C" void init(Handle<Object> target) {
	Image::Initialize(target);
}

NODE_MODULE(ribs, init);