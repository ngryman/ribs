/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_COMMON_H__
#define __RIBS_COMMON_H__

#include <v8.h>
#include <node.h>
#include <node_object_wrap.h>
#include <node_version.h>

#include <fcntl.h>
#include <string>

#include "nan.h"

struct ReadClosure {
	std::string filename;
	uint8_t* buf;
	int offset;
	uint8_t* pixels;
	int width;
	int height;
	uv_fs_t req;
	v8::Persistent<v8::Function> callback;
};

inline static std::string FromV8String(v8::Local<v8::Value> v8Str) {
	char* cstr = NanFromV8String(v8Str);
	std::string cppstr(cstr);
	delete[] cstr;
	return cppstr;
}

#endif