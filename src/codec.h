/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#ifndef __RIBS_CODEC_H__
#define __RIBS_CODEC_H__

typedef void (*CodecCallback)(ImageData);

class Codec {
public:
	static void Decode(CodecCallback callback);
};

#endif