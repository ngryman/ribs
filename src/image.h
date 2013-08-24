/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_IMAGE_H__
#define __RIBS_IMAGE_H__

#include "common.h"

class Image : public node::ObjectWrap {
public:
	static void Init(v8::Handle<v8::Object> target);
	static v8::Persistent<v8::Function> constructor;

	static NAN_METHOD(New);
	static NAN_GETTER(GetWidth);
	static NAN_GETTER(GetHeight);

	static NAN_METHOD(FromFile);

private:
	Image();
    ~Image();

	std::string filename;
	int64_t width;
	int64_t height;
};

#endif