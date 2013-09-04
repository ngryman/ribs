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
	static v8::Local<v8::Object> New(const std::string& filename, int width, int height, int depth, uint32_t* pixels);
	static v8::Local<v8::Object> New(const std::string& filename, Pix* raw);

private:
	Image(v8::Handle<v8::Object> wrapper);
	~Image();

	static v8::Persistent<v8::FunctionTemplate> constructorTemplate;

	static NAN_GETTER(GetWidth);
	static NAN_GETTER(GetHeight);
	static NAN_GETTER(GetDepth);
	static NAN_GETTER(GetPixels);
	static NAN_METHOD(FromFile);

	std::string filename;
	int width;
	int height;
	int depth;
	uint32_t* pixels;
	Pix* raw;
};

#endif