/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image_decoder.h"
#include <leptonica/allheaders.h>

using namespace v8;
using namespace std;

struct Closure {
	std::string filename;
	uint8_t* buf;
	int offset;
	Pix* imageData;
	uv_fs_t fsReq;
	uv_work_t workReq;
	ImageDecoder::Callback callback;
	Persistent<Function> jsCallback;
};

static const int BUFFER_SIZE = 4096;

static void OnOpen(uv_fs_t* req);
static void OnRead(uv_fs_t* req);
static void OnClose(uv_fs_t* req);
static void DecodeAsync(uv_work_t* req);
static void OnDecoded(uv_work_t* req);

void ImageDecoder::Decode(const string& filename, ImageDecoder::Callback callback, Persistent<Function> jsCallback) {
	// create our closure that will be passed over different uv calls
	Closure* closure = new Closure();
	// assign request variables
	closure->filename = filename;
	closure->callback = callback;
	closure->jsCallback = jsCallback;

	// set request data pointer to closure
	closure->fsReq.data = static_cast<void*>(closure);

	// open the file async
	uv_fs_open(uv_default_loop(), &closure->fsReq, closure->filename.c_str(), O_RDONLY, 0, OnOpen);
};

void OnOpen(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our closure
	Closure* closure = reinterpret_cast<Closure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at opening file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
		// function can be garbage-collected
		closure->jsCallback.Dispose();
		// clean up any memory we allocated
		delete closure;
		return;
	}

	// allocate buffer now
	closure->buf = new uint8_t[BUFFER_SIZE];

	uv_fs_read(uv_default_loop(), &closure->fsReq, req->result, closure->buf, BUFFER_SIZE, 0, OnRead);
}

void OnRead(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our closure
	Closure* closure = reinterpret_cast<Closure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at reading file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
		// function can be garbage-collected
		closure->jsCallback.Dispose();
		// clean up any memory we allocated
		delete[] closure->buf;
		delete closure;
		return;
	}

	// schedule a new read all the buffer was read
	if (req->result == BUFFER_SIZE) {
		closure->offset += BUFFER_SIZE;
		uv_fs_read(uv_default_loop(), &closure->fsReq, req->result, closure->buf, BUFFER_SIZE, closure->offset, OnRead);
	}
	else {
		uv_fs_close(uv_default_loop(), &closure->fsReq, req->result, OnClose);
	}
}

void OnClose(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our closure
	Closure* closure = reinterpret_cast<Closure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at closing file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));
	}
	else {
		closure->workReq.data = static_cast<void*>(closure);

		// pass the request to libuv to be run when a worker-thread is available to
		uv_queue_work(
			uv_default_loop(),
			&closure->workReq,
			DecodeAsync,
			(uv_after_work_cb)OnDecoded
		);
	}
}

void DecodeAsync(uv_work_t* req) {
	// fetch our closure
	Closure* closure = reinterpret_cast<Closure*>(req->data);
	// let leptonica fetch image data for us
	closure->imageData = pixReadMem(closure->buf, sizeof(closure->buf));
};

void OnDecoded(uv_work_t* req) {
	NanScope();

	// fetch our closure
	Closure* closure = reinterpret_cast<Closure*>(req->data);

	// build up our result
	ImageDecoder::Result* result = new ImageDecoder::Result();
	result->filename = closure->filename;
	result->imageData = closure->imageData;
	result->jsCallback = closure->jsCallback;

	// TODO: free memory

	// and forward it to the callback
	closure->callback(result);
};