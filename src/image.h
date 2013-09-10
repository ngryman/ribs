/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_IMAGE_H__
#define __RIBS_IMAGE_H__

#include "common.h"

class Image : public node::ObjectWrap {
public:
	static void Initialize(v8::Handle<v8::Object> target);
	static NAN_METHOD(New);
	static v8::Local<v8::Object> New(const char* filename, Pix* data);

	inline Pix* pixels() const { return data; }
	inline int length() const { return stride() * height; }
	inline int stride() const { return width * 4; }

private:
	Image(v8::Handle<v8::Object>& wrapper);
	~Image();

	static v8::Persistent<v8::FunctionTemplate> constructorTemplate;

	static NAN_GETTER(GetWidth);
	static NAN_GETTER(GetHeight);
	static NAN_GETTER(GetLength);
	static NAN_METHOD(Open);
	static NAN_METHOD(Save);

	const char* filename;
	int width;
	int height;
	Pix* data;
};

#endif