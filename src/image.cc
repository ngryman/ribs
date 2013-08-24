/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"
#include "image_decoder.h"

using namespace v8;
using namespace node;
using namespace std;

static void OnDecoded(ImageDecoder::Result* result);

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
	if (NULL == image) {
		return NanThrowError("Not enough memory.");
	}

	image->Wrap(args.This());
	NanReturnValue(args.This());
}

NAN_GETTER(Image::GetWidth) {
	NanScope();
	Image* image = ObjectWrap::Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->imageData->w));
}

NAN_GETTER(Image::GetHeight) {
	NanScope();
	Image* image = ObjectWrap::Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->imageData->h));
}

NAN_METHOD(Image::FromFile) {
	NanScope();

	// get filename & callback
	string filename = FromV8String(args[0]);
	Persistent<Function> callback;
	NanAssignPersistent(Function, callback, Local<Function>::Cast(args[1]));

	// start the decoding process async
	ImageDecoder::Decode(filename, OnDecoded, callback);

	// make the compiler happy
	NanReturnUndefined();
}

void OnDecoded(ImageDecoder::Result* result) {
	// create the image instance
	Local<Object> instance = Image::constructor->NewInstance();

	// link with image data
	Image* image = ObjectWrap::Unwrap<Image>(instance);
	image->filename = result->filename;
	image->imageData = result->imageData;

	// execute the callback function
	Handle<Value> args[] = {
		Null(),
		instance
	};
	result->jsCallback->Call(Context::GetCurrent()->Global(), sizeof(args), args);
}