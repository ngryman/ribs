/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"

using namespace v8;
using namespace std;

typedef struct {
	string filename;
	uint8_t* buf;
	uv_fs_t req;
	Persistent<Function> callback;
} read_closure_t;

static void on_open(uv_fs_t* req);
static void on_read(uv_fs_t* req);
static void on_close(uv_fs_t* req);

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
    read_closure_t* closure = new read_closure_t();

	// get filename & callback
	closure->filename = FromV8String(args[0]);
	NanAssignPersistent(Function, closure->callback, Local<Function>::Cast(args[1]));

	// set request data pointer to closure
	closure->req.data = closure;

	// open the file async
	uv_fs_open(uv_default_loop(), &closure->req, closure->filename.c_str(), O_RDONLY, 0, on_open);

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

Image::Type Image::typeOf(const string& filename) {
	size_t pos = filename.find_last_of(".");
	if (string::npos == pos) return Image::UNKNOWN;

	string ext = filename.substr(pos + 1);
	if ("jpeg" == ext || "jpg" == ext) return Image::JPEG;
	if ("png" == ext) return Image::PNG;
	if ("gif" == ext) return Image::GIF;
	return Image::UNKNOWN;
}

Local<Object> Image::loadFromJPG(const std::string& filename) {
	// instanciate the new image
	Local<Object> instance = constructor->NewInstance();
	Image* image = ObjectWrap::Unwrap<Image>(instance);

	return instance;
}

Local<Object> Image::loadFromPNG(const std::string& filename) {
	// instanciate the new image
	Local<Object> instance = constructor->NewInstance();
	Image* image = ObjectWrap::Unwrap<Image>(instance);

    // TODO

	return instance;
}

Local<Object> Image::loadFromGIF(const std::string& filename) {
	// instanciate the new image
	Local<Object> instance = constructor->NewInstance();
	Image* image = ObjectWrap::Unwrap<Image>(instance);

    // TODO

	return instance;
}

void on_open(uv_fs_t* req) {
	int result = req->result;

	if (-1 == result) {
		fprintf(stderr, "Error at opening file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
        // function can be garbage-collected
        closure->callback.Dispose();
        // clean up any memory we allocated
        delete closure;
	}

	// fetch our closure
	read_closure_t* closure = (read_closure_t*)req->data;

	uv_fs_req_cleanup(req);
	uv_fs_read(uv_default_loop(), &closure->req, result, closure->buf, sizeof(closure->buf), -1, on_read);
}

void on_read(uv_fs_t* req) {
	int result = req->result;

	if (-1 == result) {
		fprintf(stderr, "Error at reading file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));

		// TODO: factorize
		// dispose the Persistent handle so the callback
        // function can be garbage-collected
        closure->callback.Dispose();
        // clean up any memory we allocated
        delete closure->buf;
        delete closure;
	}

	// fetch our closure
	read_closure_t* closure = (read_closure_t*)req->data;

	uv_fs_req_cleanup(req);
	uv_fs_close(uv_default_loop(), &closure->req, result, on_close);
}

void on_close(uv_fs_t* req) {
	NanScope();

	int result = req->result;
	if (-1 == result) {
		fprintf(stderr, "Error at closing file: %s.\n", uv_strerror(uv_last_error(uv_default_loop())));
	}
	else {
		// fetch our closure
		read_closure_t* closure = (read_closure_t*)req->data;

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