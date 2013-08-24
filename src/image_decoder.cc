/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image_decoder.h"
#include <leptonica/allheaders.h>

using namespace v8;
using namespace std;

struct Baton {
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
	// create our Baton that will be passed over different uv calls
	Baton* baton = new Baton();
	// assign request variables
	baton->filename = filename;
	baton->callback = callback;
	baton->jsCallback = jsCallback;

	// set request data pointer to Baton
	baton->fsReq.data = static_cast<void*>(baton);

	// open the file async
	uv_fs_open(uv_default_loop(), &baton->fsReq, baton->filename.c_str(), O_RDONLY, 0, OnOpen);
};

void OnOpen(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our Baton
	Baton* baton = reinterpret_cast<Baton*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at opening file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
		// function can be garbage-collected
		baton->jsCallback.Dispose();
		// clean up any memory we allocated
		delete baton;
		return;
	}

	// allocate buffer now
	baton->buf = new uint8_t[BUFFER_SIZE];

	uv_fs_read(uv_default_loop(), &baton->fsReq, req->result, baton->buf, BUFFER_SIZE, 0, OnRead);
}

void OnRead(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our Baton
	Baton* baton = reinterpret_cast<Baton*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at reading file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
		// function can be garbage-collected
		baton->jsCallback.Dispose();
		// clean up any memory we allocated
		delete[] baton->buf;
		delete baton;
		return;
	}

	// schedule a new read all the buffer was read
	if (req->result == BUFFER_SIZE) {
		baton->offset += BUFFER_SIZE;
		uv_fs_read(uv_default_loop(), &baton->fsReq, req->result, baton->buf, BUFFER_SIZE, baton->offset, OnRead);
	}
	else {
		uv_fs_close(uv_default_loop(), &baton->fsReq, req->result, OnClose);
	}
}

void OnClose(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our Baton
	Baton* baton = reinterpret_cast<Baton*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at closing file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));
	}
	else {
		baton->workReq.data = static_cast<void*>(baton);

		// pass the request to libuv to be run when a worker-thread is available to
		uv_queue_work(
			uv_default_loop(),
			&baton->workReq,
			DecodeAsync,
			(uv_after_work_cb)OnDecoded
		);
	}
}

void DecodeAsync(uv_work_t* req) {
	// fetch our Baton
	Baton* baton = reinterpret_cast<Baton*>(req->data);
	// let leptonica fetch image data for us
	baton->imageData = pixReadMem(baton->buf, sizeof(baton->buf));
};

void OnDecoded(uv_work_t* req) {
	NanScope();

	// fetch our Baton
	Baton* baton = reinterpret_cast<Baton*>(req->data);

	// build up our result
	ImageDecoder::Result* result = new ImageDecoder::Result();
	result->filename = baton->filename;
	result->imageData = baton->imageData;
	result->jsCallback = baton->jsCallback;

	// TODO: free memory

	// and forward it to the callback
	baton->callback(result);
};