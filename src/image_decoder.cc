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
	uv_fs_t fs;
	uint8_t* buf;
	SmartBuffer buffer;
	// decoder stuff
	uv_work_t work;
};

static void OnOpen(uv_fs_t* req);
static void OnRead(uv_fs_t* req);
static void DecodeAsync(uv_work_t* req);
static void OnDecoded(uv_work_t* req);
static void Done(Baton* baton);

void ImageDecoder::Decode(const string& filename, ImageDecoder::Callback callback, NanCallback* jsCallback) {
	// create our Baton that will be passed over different uv calls
	Baton* baton = new Baton;
	baton->buf = NULL;
	baton->result.filename = filename;
	baton->result.callback = jsCallback;
	baton->callback = callback;
	// reference baton in the request
	baton->fs.data = baton;

	// open the file async
	uv_fs_open(uv_default_loop(), &baton->fs, baton->result.filename.c_str(), O_RDONLY, 0, OnOpen);
};

void OnOpen(uv_fs_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		baton->result.error = RibsError("Error opening file", uv_strerror(uv_last_error(uv_default_loop())));
		uv_fs_req_cleanup(req);
		return Done(baton);
	}

	// allocate temporary buffer
	baton->buf = new uint8_t[SmartBuffer::ChunkSize];
	if (NULL == baton->buf) {
		baton->result.error = RibsError("Error opening file", "not enough memory");
		uv_fs_req_cleanup(req);
		return Done(baton);
	}

	// read the file async
	uv_fs_read(uv_default_loop(), &baton->fs, req->result, baton->buf, SmartBuffer::ChunkSize, 0, OnRead);
	uv_fs_req_cleanup(req);
}

void OnRead(uv_fs_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	if (-1 == req->result) {
		baton->result.error = RibsError("Error reading file", uv_strerror(uv_last_error(uv_default_loop())));
		uv_fs_req_cleanup(req);
		return Done(baton);
	}

	// copy data
	baton->buffer.append(baton->buf);

	// schedule a new read if all the buffer was read
	if (req->result == SmartBuffer::ChunkSize) {
		uv_fs_read(uv_default_loop(), &baton->fs, req->fd, baton->buf, SmartBuffer::ChunkSize, baton->buffer.size(), OnRead);
	}
	else {
		// close file sync
		// it's a quick operation that does not need threading overhead
		int err = uv_fs_close(uv_default_loop(), &baton->fs, req->fd, NULL);
		if (-1 == err) {
			baton->result.error = RibsError("Error closing file", uv_strerror(uv_last_error(uv_default_loop())));
			uv_fs_req_cleanup(req);
			return Done(baton);
		}

		// reference baton in the request
		baton->work.data = baton;
		// pass the request to libuv to be run when a worker-thread is available to
		uv_queue_work(
			uv_default_loop(),
			&baton->work,
			DecodeAsync,
			(uv_after_work_cb)OnDecoded
		);
	}

	uv_fs_req_cleanup(req);
}

void DecodeAsync(uv_work_t* req) {
	Baton* baton = static_cast<Baton*>(req->data);

	// let leptonica fetch image data for us
	//
	// leptonica can read from memory, but not on Windows:
	//   http://tpgit.github.io/UnOfficialLeptDocs/leptonica/README.html#gnu-runtime-functions-for-stream-redirection-to-memory
	// so for now, a ugly thing is done in order to continue the dev: leptonica re-reads the file from disk... yeah i know, i know...
#ifdef WIN32
	baton->result.imageData = pixRead(baton->result.filename.c_str());
#else
	baton->result.imageData = pixReadMem(baton->buffer, baton->buffer.size());
#endif
};

void OnDecoded(uv_work_t* req) {
	NanScope();

	// check if image was decoded correctly
	Baton* baton = static_cast<Baton*>(req->data);
	if (NULL == baton->result.imageData) {
		baton->result.error = RibsError("Error decoding file", "TODO");
	}

	Done(baton);
};

void Done(Baton* baton) {
	// forward result to the callback
	baton->callback(&baton->result);

	// free baton allocated memory
	if(baton->buf) delete[] baton->buf;
	delete baton;
}
