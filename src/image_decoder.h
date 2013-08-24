/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_IMAGE_DECODER_H__
#define __RIBS_IMAGE_DECODER_H__

#include "common.h"

class ImageDecoder {
public:
	struct Result {
		std::string filename;
		Pix* imageData;
		v8::Persistent<v8::Function> jsCallback;
	};

	typedef void (*Callback)(Result*);

	static void Decode(const std::string& filename, Callback callback, v8::Persistent<v8::Function> jsCallback);

private:
	ImageDecoder();
    ~ImageDecoder();
};

#endif