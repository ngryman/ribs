/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * MIT Licensed
 */

#include "image.h"
#include "image_decoder.h"

using namespace v8;
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
	Handle<Value> imageArgs[] = {
		Number::New(result->imageData->w),
		Number::New(result->imageData->h)
	};
	Local<Object> instance = Image::constructor->NewInstance(sizeof(imageArgs), imageArgs);

	// link with image data
	// TODO

	// execute the callback function
	Handle<Value> callbackArgs[] = {
		Null(),
		instance
	};
	result->jsCallback->Call(Context::GetCurrent()->Global(), 2, callbackArgs);
}