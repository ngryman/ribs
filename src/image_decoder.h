/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_IMAGE_DECODER_H__
#define __RIBS_IMAGE_DECODER_H__

#include "common.h"

namespace ribs {

class ImageDecoder {
public:
	struct Result {
		const char* filename;
		Pix* data;
		NanCallback* callback;
		char error[128];
	};

	typedef void (*Callback)(Result*);

	static void Initialize(void);
	static void Decode(const char* filename, Callback callback, NanCallback* jsCallback);

private:
	ImageDecoder();
	~ImageDecoder();
};

}

#endif