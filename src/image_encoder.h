/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_IMAGE_ENCODER_H__
#define __RIBS_IMAGE_ENCODER_H__

#include "common.h"

class ImageEncoder {
public:
	struct Result {
		NanCallback* callback;
		char error[128];

		Result() { error[0] = 0; }
	};

	typedef void (*Callback)(Result*);

	static void Initialize(void);
	static void Encode(const char* filename, int32_t quality, bool progressive, const Image* image, Callback callback, NanCallback* jsCallback);

private:
	ImageEncoder();
	~ImageEncoder();
};

#endif