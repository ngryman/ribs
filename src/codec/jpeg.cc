/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "../codec.h"

void JpegCodec::encode(const ReadClosure* closure, CodecCallback callback) {

};

void JpegCodec::decode(const ReadClosure* closure, CodecCallback callback) {

};

bool JpegCodec::isJepg(uint8_t* buf) {
	return (0xff == buf[0] && 0xd8 == buf[1]);
}