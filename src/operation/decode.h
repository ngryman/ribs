/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_OPERATION_DECODE_H__
#define __RIBS_OPERATION_DECODE_H__

#include "../operation.h"

namespace ribs {

OPERATION(Decode,
	cv::Mat inMat;
	cv::Mat outMat;
);

}

#endif