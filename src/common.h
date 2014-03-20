/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_COMMON_H__
#define __RIBS_COMMON_H__

#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>
#include <node_version.h>

#include <nan.h>

#include <fcntl.h>
#include <string>

#include <cv.h>
#include <highgui.h>

namespace ribs {

typedef uint8_t pixel_t;

class Image;
class Operation;

inline std::string FromV8String(v8::Local<v8::Value> v8Str) {
	size_t size;
	char* cstr = NanCString(v8Str, &size);
	std::string cppstr(cstr);
	delete[] cstr;
	return cppstr;
}

}

#endif