/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
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

	static const int ChunkSize;

private:
	uint8_t* chunksPtr;
	int chunksCount;
};

#endif