/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_SMART_BUFFER_H__
#define __RIBS_SMART_BUFFER_H__

#include "common.h"

namespace ribs {

class SmartBuffer {
public:
	SmartBuffer();
	~SmartBuffer();

	bool append(uint8_t* buf, size_t length);
	int length() const;

	operator const uint8_t* () const;
	operator uint8_t* ();

private:
	uint8_t* ptr;
	uint8_t* headPtr;
	size_t len;
};

}

#endif