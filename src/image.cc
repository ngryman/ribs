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

Persistent<FunctionTemplate> Image::constructorTemplate;

Image::Image(Handle<Object> wrapper) {
	Wrap(wrapper);
};

Image::~Image() {};

NAN_METHOD(Image::New) {
	NanScope();

	// Image() instead of new Image()
	if (!args.IsConstructCall()) {
		Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
		NanReturnValue(instance);
	}

	Image* image = new Image(args.This());
	NanReturnValue(args.This());
}

Local<Object> Image::New(const string& filename, Pix* imageData) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	Image* image = Unwrap<Image>(instance);
	image->filename = filename;
	image->imageData = imageData;

	NanReturnValue(instance);
};

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
	NanCallback* callback = new NanCallback(args[1].As<Function>());

	// start the decoding process async
	ImageDecoder::Decode(filename, OnDecoded, callback);

	// make the compiler happy
	NanReturnUndefined();
}

void Image::Initialize(Handle<Object> target) {
	NanScope();

	// constructor
	Local<FunctionTemplate> t = FunctionTemplate::New(New);
	NanAssignPersistent(FunctionTemplate, constructorTemplate, t);
	constructorTemplate->InstanceTemplate()->SetInternalFieldCount(1);
	constructorTemplate->SetClassName(NanSymbol("Image"));

	// prototype
	Local<ObjectTemplate> prototype = constructorTemplate->PrototypeTemplate();
	prototype->SetAccessor(NanSymbol("width"), GetWidth);
	prototype->SetAccessor(NanSymbol("height"), GetHeight);

	// object
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "fromFile", FromFile);

	// export
	target->Set(NanSymbol("Image"), constructorTemplate->GetFunction());
}

void OnDecoded(ImageDecoder::Result* result) {
	NanScope();

	// execute callback with error
	if (!result->error.empty()) {
		Local<Value> arg = Exception::Error(String::New(result->error.c_str()));
		return result->callback->Call(1, &arg);
	}

	// create the image instance with data
	Local<Object> instance = Image::New(result->filename, result->imageData);

	// execute callback with newly created image
	Local<Value> args[] = {
		Local<Value>::New(Null()),
		instance
	};
	result->callback->Call(sizeof(args), args);
}