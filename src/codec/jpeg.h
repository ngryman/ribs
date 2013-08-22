/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_JPEG_CODEC_H__
#define __RIBS_JPEG_CODEC_H__

class JpegCodec {
public:
	static void encode(const ReadClosure* closure, CodecCallback callback);
	static void decode(const ReadClosure* closure, CodecCallback callback);
	static bool isJepg(uint8_t* buff);
};

#endif