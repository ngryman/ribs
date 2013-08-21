/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_IMAGE_H__
#define __RIBS_IMAGE_H__

#include "common.h"

struct ImageData {
	std::string filename;
	int width;
	int height;
};

class Image : public node::ObjectWrap {
public:
	static void Init(v8::Handle<v8::Object> target);
	static v8::Persistent<v8::Function> constructor;

	static NAN_METHOD(New);
	static NAN_GETTER(GetWidth);
	static NAN_GETTER(GetHeight);

	static NAN_METHOD(FromFile);

	typedef enum {
		UNKNOWN,
		JPEG,
		PNG,
		GIF
    } Type;

private:
	Image();
    ~Image();

    static Type typeOf(const std::string& filename);
    static v8::Local<v8::Object> loadFromJPG(const std::string& filename);
    static v8::Local<v8::Object> loadFromPNG(const std::string& filename);
    static v8::Local<v8::Object> loadFromGIF(const std::string& filename);

	ImageData data;
};

#endif