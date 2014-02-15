/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_RESIZE_H__
#define __RIBS_OPERATION_RESIZE_H__

#include "../operation.h"

namespace ribs {

class ResizeOperation : public Operation {
public:
	ResizeOperation(_NAN_METHOD_ARGS);
	~ResizeOperation();

private:
	void                 DoProcess();
	v8::Local<v8::Value> OutputValue();

	Image*               image;
	v8::Persistent<v8::Object> imageHandle;
	uint32_t             width;
	uint32_t             height;
};

}

#endif