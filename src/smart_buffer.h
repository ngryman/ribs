/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#ifndef __RIBS_SMART_BUFFER_H__
#define __RIBS_SMART_BUFFER_H__

#include "common.h"

class SmartBuffer {
public:
	SmartBuffer();
	~SmartBuffer();

	bool append(uint8_t* buf);
	int size() const;

	operator const uint8_t* () const;

	static const int ChunkSize;

private:
	uint8_t* chunksPtr;
	int chunksCount;
};

#endif