/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_CODEC_H__
#define __RIBS_CODEC_H__

#include "common.h"

typedef void (*CodecCallback)(const std::string&, const ReadClosure*);

class Codec {
public:
    static void encode(const ReadClosure* closure, CodecCallback callback);
	static void decode(const ReadClosure* closure, CodecCallback callback);
};

#include "codec/jpeg.h"

#endif