/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "codec.h"

void Codec::encode(const ReadClosure* closure, CodecCallback callback) {

};

void Codec::decode(const ReadClosure* closure, CodecCallback callback) {
	uint8_t* buf = closure->buf;

	if (JpegCodec::isJepg(buf)) {
	    JpegCodec::decode(closure, callback); return;
	}
	// TODO

	// error, unknown file format
	callback("unknown file format.", NULL);
};
