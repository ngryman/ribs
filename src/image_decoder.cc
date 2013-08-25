/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image_decoder.h"
#include "smart_buffer.h"
#include <leptonica/allheaders.h>

using namespace v8;
using namespace std;

struct Baton {
	// data
	ImageDecoder::Result result;
	ImageDecoder::Callback callback;
	// fs stuff
	uv_fs_t fsReq;
	uint8_t* buf;
	SmartBuffer buffer;
	// decoder stuff
	uv_work_t workReq;
};

static void OnOpen(uv_fs_t* req);
static void OnRead(uv_fs_t* req);
static void OnClose(uv_fs_t* req);
static void DecodeAsync(uv_work_t* req);
static void OnDecoded(uv_work_t* req);
static void Done(Baton* baton);

void ImageDecoder::Decode(const string& filename, ImageDecoder::Callback callback, NanCallback* jsCallback) {
	// create our Baton that will be passed over different uv calls
	Baton* baton = new Baton;
	baton->result.filename = filename;
	baton->result.callback = jsCallback;
	baton->callback = callback;
	// reference baton in the request
	baton->fsReq.data = baton;

	// open the file async
	uv_fs_open(uv_default_loop(), &baton->fsReq, baton->result.filename.c_str(), O_RDONLY, 0, OnOpen);
};

void OnOpen(uv_fs_t* req) {
	uv_fs_req_cleanup(req);
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		baton->result.error = RibsError("Error opening file", uv_strerror(uv_last_error(uv_default_loop())));
		return Done(baton);
	}

	// allocate temporary buffer
	baton->buf = new uint8_t[SmartBuffer::ChunkSize];
	if (NULL == baton->buf) {
		baton->result.error = "Not enough memory.";
		return Done(baton);
	}

	uv_fs_read(uv_default_loop(), &baton->fsReq, req->result, baton->buf, SmartBuffer::ChunkSize, 0, OnRead);
}

void OnRead(uv_fs_t* req) {
	uv_fs_req_cleanup(req);
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		baton->result.error = RibsError("Error reading file", uv_strerror(uv_last_error(uv_default_loop())));
		return Done(baton);
	}

	// schedule a new read all the buffer was read
	if (req->result == SmartBuffer::ChunkSize) {
		baton->buffer.append(baton->buf);
//		baton->offset += BUFFER_SIZE;
		uv_fs_read(uv_default_loop(), &baton->fsReq, req->result, baton->buf, SmartBuffer::ChunkSize, baton->buffer.size(), OnRead);

		// TODO: copy to our final buffer
//		if (NULL == baton->buf) {
//        		baton->error = "Not enough memory.";
//        		return Done(baton);
//        	}
	}
	else {
		uv_fs_close(uv_default_loop(), &baton->fsReq, req->result, OnClose);
	}
}

void OnClose(uv_fs_t* req) {
	uv_fs_req_cleanup(req);
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		baton->result.error = RibsError("Error closing file", uv_strerror(uv_last_error(uv_default_loop())));
		return Done(baton);
	}
	
	// reference baton in the request
	baton->workReq.data = baton;

	// pass the request to libuv to be run when a worker-thread is available to
	uv_queue_work(
		uv_default_loop(),
		&baton->workReq,
		DecodeAsync,
		(uv_after_work_cb)OnDecoded
	);
}

void DecodeAsync(uv_work_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	// let leptonica fetch image data for us
	baton->result.imageData = pixReadMem(baton->buf, sizeof(baton->buf));
	if (NULL == baton->result.imageData) {
		baton->result.error = RibsError("Error decoding file", "TODO");
	}
};

void OnDecoded(uv_work_t* req) {
	NanScope();
	Baton* baton = static_cast<Baton*>(req->data);
	// TODO: handle error of image not decompressed

	// and call Done directly
	Done(baton);
};

void Done(Baton* baton) {
	// forward result to the callback
	baton->callback(&baton->result);

	// free baton allocated memory
	if(baton->buf) delete[] baton->buf;
	delete baton;
}
