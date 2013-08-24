/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"
//#include "codec.h"
#include <leptonica/allheaders.h>

using namespace v8;
using namespace std;

static void OnOpen(uv_fs_t* req);
static void OnRead(uv_fs_t* req);
static void OnClose(uv_fs_t* req);
static void DecodeAsync(uv_work_t* req);
static void OnDecoded(uv_work_t* req);

Persistent<Function> Image::constructor;

Image::Image() {};
Image::~Image() {};

static const int BUFFER_SIZE = 4096;

void Image::Init(Handle<Object> target) {
	// constructor
	Local<FunctionTemplate> ctor = FunctionTemplate::New(New);
	ctor->SetClassName(NanSymbol("Image"));
	ctor->InstanceTemplate()->SetInternalFieldCount(1);
	NODE_SET_METHOD(ctor, "fromFile", FromFile);

	// prototype
	Local<ObjectTemplate> proto = ctor->PrototypeTemplate();
	proto->SetAccessor(NanSymbol("width"), GetWidth);
	proto->SetAccessor(NanSymbol("height"), GetHeight);

	// export
	NanAssignPersistent(Function, constructor, ctor->GetFunction());
	target->Set(NanSymbol("Image"), constructor);
}

NAN_METHOD(Image::New) {
	NanScope();

	Image* image = new Image();
	image->width = args[0]->IsUndefined() ? 0 : args[0]->IntegerValue();
	image->height = args[1]->IsUndefined() ? 0 : args[1]->IntegerValue();

	image->Wrap(args.This());
	NanReturnValue(args.This());
}

NAN_GETTER(Image::GetWidth) {
	NanScope();
	Image* image = ObjectWrap::Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->width));
}

NAN_GETTER(Image::GetHeight) {
	NanScope();
	Image* image = ObjectWrap::Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->height));
}

NAN_METHOD(Image::FromFile) {
	NanScope();

	// create our closure that will be passed over different uv calls
	ReadClosure* closure = new ReadClosure();

	// get filename & callback
	closure->filename = FromV8String(args[0]);
	NanAssignPersistent(Function, closure->callback, Local<Function>::Cast(args[1]));

	// set request data pointer to closure
	closure->fsReq.data = static_cast<void*>(closure);

	// open the file async
	uv_fs_open(uv_default_loop(), &closure->fsReq, closure->filename.c_str(), O_RDONLY, 0, OnOpen);

	// make the compiler happy
	NanReturnUndefined();
}

void OnOpen(uv_fs_t* req) {
	uv_fs_req_cleanup(req);

	// fetch our closure
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at opening file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
		// function can be garbage-collected
		closure->callback.Dispose();
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
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at reading file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
		// function can be garbage-collected
		closure->callback.Dispose();
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
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);

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
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);
	// let leptonica fetch image data for us
	closure->imageData = pixReadMem(closure->buf, sizeof(closure->buf));
};

void OnDecoded(uv_work_t* req) {
	NanScope();

	// fetch our closure
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);

	// create the image instance
	Handle<Value> imageArgs[] = {
		Number::New(closure->imageData->w),
		Number::New(closure->imageData->h)
	};
	Local<Object> instance = Image::constructor->NewInstance(sizeof(imageArgs), imageArgs);

	// link with image data
	// TODO

	// execute the callback function
	Handle<Value> callbackArgs[] = {
		Null(),
		instance
	};
	closure->callback->Call(Context::GetCurrent()->Global(), 2, callbackArgs);
};