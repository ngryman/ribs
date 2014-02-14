/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_ENCODE_H__
#define __RIBS_OPERATION_ENCODE_H__

#include "../operation.h"

namespace ribs {

class EncodeOperation : public Operation {
public:
	EncodeOperation(_NAN_METHOD_ARGS);

private:
	void                  DoProcess();
	v8::Local<v8::Object> OutputValue();

	Image*             image;
	std::vector<uchar> outVec;
	std::string        ext;
	uint32_t           quality;
};

}

#endif