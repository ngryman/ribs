/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"

using namespace v8;
using namespace ribs;

extern "C" void init(Handle<Object> target) {
	Image::Initialize(target);
}

NODE_MODULE(ribs, init);