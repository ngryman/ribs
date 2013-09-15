/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "smart_buffer.h"

using namespace ribs;

SmartBuffer::SmartBuffer() {
	len = 0;
}

SmartBuffer::~SmartBuffer() {
	if (0 != len) {
		free(ptr);
	}
}

bool SmartBuffer::append(uint8_t* buf, size_t length) {
	if (0 == len) {
		ptr = static_cast<uint8_t*>(calloc(length, sizeof(uint8_t)));
		headPtr = ptr;
	}
	else {
		ptr = static_cast<uint8_t*>(realloc(ptr, len + length * sizeof(uint8_t)));
	}

	if (NULL == ptr) {
		free(ptr);
		return false;
	}

	memcpy(headPtr, buf, length * sizeof(uint8_t));
	headPtr += length;
	len += length;

	return true;
}

int SmartBuffer::length() const {
	return len;
}

SmartBuffer::operator const uint8_t* () const {
	return ptr;
}

SmartBuffer::operator uint8_t* () {
	return ptr;
}