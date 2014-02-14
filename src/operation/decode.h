/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_DECODE_H__
#define __RIBS_OPERATION_DECODE_H__

#include "../operation.h"

namespace ribs {

class DecodeOperation : public Operation {
public:
	DecodeOperation(_NAN_METHOD_ARGS);

private:
	void                  DoProcess();
	v8::Local<v8::Object> OutputValue();

	cv::Mat inMat;
	cv::Mat outMat;
};

}

#endif