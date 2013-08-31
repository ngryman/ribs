/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_IMAGE_DECODER_H__
#define __RIBS_IMAGE_DECODER_H__

#include "common.h"

class ImageDecoder {
public:
	struct Result {
		std::string filename;
		Pix* raw;
		NanCallback* callback;
		std::string error;
	};

	typedef void (*Callback)(Result*);

	static void Initialize(void);
	static void Decode(const std::string& filename, Callback callback, NanCallback* jsCallback);

private:
	ImageDecoder();
	~ImageDecoder();
};

#endif