/*!
 * ribs
 * Copyright (c) 2013-2014 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_IMAGE_H__
#define __RIBS_IMAGE_H__

#include "common.h"

namespace ribs {

class Image : public node::ObjectWrap {
public:
	static void Initialize(v8::Handle<v8::Object> target);
	static NAN_METHOD(New);
	static v8::Local<v8::Object> New(cv::Mat& mat);

	inline pixel_t* Pixels()   const { return mat.data; }
	inline uint32_t Width()    const { return mat.size().width; }
	inline uint32_t Height()   const { return mat.size().height; }
	inline int      Length()   const { return mat.total() * Channels(); }
	inline int      Channels() const { return mat.channels(); }
	inline cv::Mat& Matrix()         { return mat; }
	void            Matrix(cv::Mat newMat);
	void            Sync(v8::Handle<v8::Object> instance);

private:
	Image(v8::Handle<v8::Object> wrapper);
	~Image();

	static v8::Persistent<v8::FunctionTemplate> constructorTemplate;

	static NAN_GETTER(GetWidth);
	static NAN_GETTER(GetHeight);
	static NAN_GETTER(GetChannels);
	static NAN_GETTER(GetLength);

	static NAN_METHOD(Decode);
	static NAN_METHOD(Encode);
	static NAN_METHOD(Resize);
	static NAN_METHOD(Crop);

	cv::Mat mat;
};

}

#endif