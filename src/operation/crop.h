/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_CROP_H__
#define __RIBS_OPERATION_CROP_H__

#include "../operation.h"

namespace ribs {

OPERATION(Crop,
	Image*   image;
	v8::Persistent<v8::Object> imageHandle;
	uint32_t width;
	uint32_t height;
	uint32_t x;
	uint32_t y;
);

}

#endif