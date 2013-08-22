/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"
#include "codec.h"

using namespace v8;
using namespace std;

static void OnOpen(uv_fs_t* req);
static void OnRead(uv_fs_t* req);
static void OnClose(uv_fs_t* req);
static void OnDecoded(const string& error, const ReadClosure* data);

Persistent<Function> Image::constructor;

Image::Image() {};
Image::~Image() {};

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
	closure->req.data = closure;

	// open the file async
	uv_fs_open(uv_default_loop(), &closure->req, closure->filename.c_str(), O_RDONLY, 0, OnOpen);

//	// which type of image?
//	Type type = typeOf(filename);

//	// load image data by type
//	switch (type) {
//		case Image::JPEG:
//			NanReturnValue(Image::loadFromJPG(filename));
//		case Image::PNG:
//			NanReturnValue(Image::loadFromPNG(filename));
//		case Image::GIF:
//			NanReturnValue(Image::loadFromGIF(filename));
//		case Image::UNKNOWN:
//			NanThrowError((filename + " is not a valid image.").c_str());
//	}

	// make the compiler happy
	NanReturnUndefined();
}

void OnOpen(uv_fs_t* req) {
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
	}

	uv_fs_req_cleanup(req);
	uv_fs_read(uv_default_loop(), &closure->req, req->result, closure->buf, sizeof(closure->buf), -1, OnRead);
}

void OnRead(uv_fs_t* req) {
	// fetch our closure
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at reading file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
        // function can be garbage-collected
        closure->callback.Dispose();
        // clean up any memory we allocated
        delete closure->buf;
        delete closure;
	}

	uv_fs_req_cleanup(req);
	uv_fs_close(uv_default_loop(), &closure->req, req->result, OnClose);
}

void OnClose(uv_fs_t* req) {
	NanScope();

	// fetch our closure
	ReadClosure* closure = reinterpret_cast<ReadClosure*>(req->data);

	if (-1 == req->result) {
		fprintf(stderr, "Error at closing file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));
	}
	else {
//		Codec::Decode(closure);

		Codec::decode(closure, OnDecoded);

		// assign pixel data
		// image->pixels = closure->buf;

		// TODO: launch an sync task to decode image
		// - 1 sniff for magic numbers
		// - 2 call async work pointing to the right decoder

//		// create an arguments array for the callback
//		Handle<Value> argv[] = {
//			Null(),
//			Number::New(asyncData->estimate)
//		};
//
//		// execute the callback function
//		closure->callback->Call(Context::GetCurrent()->Global(), 2, argv);
	}

	// TODO: factorize
	// dispose the Persistent handle so the callback
	// function can be garbage-collected
	closure->callback.Dispose();
	// clean up any memory we allocated
	delete closure->buf;
	delete closure;

	uv_fs_req_cleanup(req);
}

void OnDecoded(const string& error, const ReadClosure* closure) {
	NanScope();

	const int argc = 2;
	Handle<Value> argv[argc] = {
		Number::New(closure->width),
		Number::New(closure->height)
	};
	Local<Object> instance = Image::constructor->NewInstance(argc, argv);

	// TODO callback
};