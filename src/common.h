/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_COMMON_H__
#define __RIBS_COMMON_H__

#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>
#include <node_version.h>

#include <fcntl.h>

#include "leptonica/allheaders.h"
#include "nan.h"

namespace ribs {

class Image;

inline static const char* FromV8String(v8::Local<v8::Value> v8Str) {
	// https://github.com/rvagg/nan/issues/29
	return NanFromV8String(v8Str, Nan::UTF8, NULL, NULL, 0, v8::String::HINT_MANY_WRITES_EXPECTED);
}

inline static void RibsError(char* error, const char* message, const char* description) {
	sprintf(error, "%s: %s", message, description);
}

}

#endif