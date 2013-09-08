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
#include <sstream>
#include <string>

#include "leptonica/allheaders.h"
#include "nan.h"

inline static std::string FromV8String(v8::Local<v8::Value> v8Str) {
	// https://github.com/rvagg/nan/issues/29
	char* str = NanFromV8String(v8Str, Nan::UTF8, NULL, NULL, 0, v8::String::HINT_MANY_WRITES_EXPECTED);
	std::string cppStr(str);
	delete[] str;
	return cppStr;
}

static std::string RibsError(const char* message, const char* description) {
	std::ostringstream stream;
	stream << message << ": " << description;
	return stream.str();
}

#endif