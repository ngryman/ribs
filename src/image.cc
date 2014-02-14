/*!
 * ribs
 * Copyright (c) 2013 Nicolas Gryman <ngryman@gmail.com>
 * LGPL Licensed
 */

#include "image.h"
#include "operation/decode.h"
#include "operation/encode.h"

using namespace std;
using namespace v8;
using namespace node;
using namespace ribs;

Persistent<FunctionTemplate> Image::constructorTemplate;

Image::Image(Handle<Object> wrapper) {
	Wrap(wrapper);
}

Image::~Image() {
	V8::AdjustAmountOfExternalAllocatedMemory(-Length());
};

NAN_METHOD(Image::New) {
	NanScope();

	// Image() instead of new Image()
	if (!args.IsConstructCall()) {
		Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
		NanReturnValue(instance);
	}

	new Image(args.This());
	NanReturnValue(args.This());
}

Local<Object> Image::New(cv::Mat& mat) {
	NanScope();

	// create a new instance an feed it
	Local<Object> instance = constructorTemplate->GetFunction()->NewInstance();
	auto image = Unwrap<Image>(instance);
	image->mat = mat;

	// Let v8 handle [] accessor
	instance->SetIndexedPropertiesToPixelData(mat.data, image->Length());
//	instance->SetIndexedPropertiesToExternalArrayData(pixels, kExternalUnsignedIntArray, image->Length());

	// give a hint to GC about the amount of memory attached to this object
	// this help GC to know exactly the amount of memory it will free if collecting this object
	// this ensure GC will collect more regularly exhausted image objects
	V8::AdjustAmountOfExternalAllocatedMemory(mat.total());
	NanReturnValue(instance);
}

NAN_GETTER(Image::GetWidth) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->Width()));
}

NAN_GETTER(Image::GetHeight) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->Height()));
}

NAN_GETTER(Image::GetLength) {
	NanScope();
	NanReturnValue(Number::New(args.This()->GetIndexedPropertiesPixelDataLength()));
}

NAN_GETTER(Image::GetChannels) {
	NanScope();
	Image* image = Unwrap<Image>(args.This());
	NanReturnValue(Number::New(image->Channels()));
}

NAN_METHOD(Image::Decode) {
	RIBS_OPERATION(Decode);
}

NAN_METHOD(Image::Encode) {
	RIBS_OPERATION(Encode);
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
	prototype->SetAccessor(NanSymbol("length"), GetLength);
	prototype->SetAccessor(NanSymbol("channels"), GetChannels);
	NODE_SET_PROTOTYPE_METHOD(constructorTemplate, "encode", Encode);

	// object
	NODE_SET_METHOD(constructorTemplate->GetFunction(), "decode", Decode);

	// export
	target->Set(NanSymbol("Image"), constructorTemplate->GetFunction());

	// TODO return?
}