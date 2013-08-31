/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "smart_buffer.h"

// TODO: benchmark this size
// TODO: when custom allocator will be available, perhaps a big increase would be possible in the working area
const int SmartBuffer::ChunkSize = 32 * 1024;

SmartBuffer::SmartBuffer() {
	chunksCount = 0;
}

SmartBuffer::~SmartBuffer() {
	if (chunksCount) {
		free(chunksPtr);
	}
}

bool SmartBuffer::append(uint8_t* buf) {
	chunksCount++;
	if (1 == chunksCount) {
		chunksPtr = static_cast<uint8_t*>(calloc(ChunkSize, sizeof(uint8_t)));
	}
	else {
		chunksPtr = static_cast<uint8_t*>(realloc(chunksPtr, chunksCount * ChunkSize * sizeof(uint8_t)));
	}

	if (NULL == chunksPtr) {
		free(chunksPtr);
		return false;
	}
	return true;
};

int SmartBuffer::size() const {
	return chunksCount * ChunkSize;
};

SmartBuffer::operator const uint8_t* () const {
	return chunksPtr;
};